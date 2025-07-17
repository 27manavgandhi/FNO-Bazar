import React, { useEffect, useState } from "react";
import style from "./StockDetails.module.css";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { db, futureDB } from "../../firebase";
import { app } from "../../firebase";
import { cloneDeep } from "lodash";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
function getTodaysDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}
function findMostRecentDates(dateList, count = 3) {
  const sortedDates = dateList
    .map((dateString) => {
      const [day, month, year] = dateString.split("-");
      return new Date(`${year}-${month}-${day}`);
    })
    .sort((a, b) => b - a); // Sort in descending order

  const mostRecentDates = sortedDates.slice(0, count);

  return mostRecentDates.map((date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  });
}

function GainerAndLoserStocks(props) {
  const { strikePrice, stockData } = props;
  const [loserStrikeArray, setLoserStrikeArray] = useState([]);
  const [gainerLoser, setGainerLoser] = useState(null);
  const [gainerStrikeArray, setGainerStrikeArray] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [expiryDates, setExpiryDates] = useState([]);
  const [isActive, setIsActive] = useState(null);
  const [componentLoading, setComponentLoading] = useState(true);
  // favourites options and functions
  const id = "topgainersandlosers";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Top Gainers And Losers";
    const index = favourites.findIndex((component) => component.id === id);
    console.log({ favourites });

    if (index !== -1) {
      removeFavourite({ id, label });
      setFavouritesToggle(false);
    } else {
      addFavourite({ id, label });
      setFavouritesToggle(true);
    }
  };

  function toggle(index) {
    if (isActive === index) {
      return setIsActive(null);
    }
    setIsActive(index);
  }

  useEffect(() => {
    setComponentLoading(true);
    const rtdb = getDatabase(app);
    // get list of expiries from realtime database first

    const expiryRef = ref(rtdb, "Top Gainers And Losers/Top Gainers");

    // Attach a listener to the "expiry" reference to listen for changes in the data
    const dateFetchOption = async () => {
      const callsSnapshot = await get(expiryRef);
      const expiryData = callsSnapshot.val();

      var expiryArray = expiryData ? Object.keys(expiryData) : [];
      // var NiftDate=
      // remove all dates before today from expiryArray
      const currentDate = new Date();

      // Set the time to the beginning of the day for both dates
      const currentDateStartOfDay = new Date(currentDate);
      currentDateStartOfDay.setHours(0, 0, 0, 0);

      const recentDate = findMostRecentDates(expiryArray, 4);

      setExpiryDates(recentDate);
    };
    dateFetchOption();

    setComponentLoading(false);
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
    return () => {
      // Detach the listener when the component unmounts
      // off(expiryRef, "value", onExpiryValueChange);
    };
  }, []);
  console.log(expiryDates);
  const calculatePreviousDate = (inputDays) => {
    try {
      // Convert the input to an integer
      const days = parseInt(inputDays, 10);

      // Get the current date
      let currentDate = new Date();

      // Calculate the previous date by subtracting the given number of days,
      // excluding weekends (Saturday and Sunday)
      for (let i = 0; i < days; i++) {
        currentDate.setDate(currentDate.getDate() - 1);

        // Skip Sundays (day 0) and Saturdays (day 6)
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate.setDate(currentDate.getDate() - 1);
        }
      }

      // Format the date in "dd-mm-yyyy" format
      const day = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const year = currentDate.getFullYear();

      const formattedDate = `${day}-${month}-${year}`;

      return formattedDate;
    } catch (error) {
      console.log("Invalid input. Please enter a valid number of days.");
    }
  };

  const currentDate = getTodaysDate();
  console.log(currentDate);
  useEffect(() => {
    let tempData = [];

    const dbRef = ref(
      futureDB,
      `/Top Gainers And Losers/Top Gainers/${currentDate}`
    );
    onValue(dbRef, (snapshot) => {
      tempData = snapshot.val();
      setTopGainers(tempData);
    });
  }, []);

  useEffect(() => {
    let tempData = [];

    const dbRef = ref(
      futureDB,
      `/Top Gainers And Losers/Top Losers/${currentDate}`
    );
    onValue(dbRef, (snapshot) => {
      tempData = snapshot.val();
      setTopLosers(tempData);
    });
  }, []);
  useEffect(() => {
    let tempData = [];

    const dbRef = ref(futureDB, `/Top Gainers And Losers/`);
    onValue(dbRef, (snapshot) => {
      tempData = snapshot.val();
      setGainerLoser(tempData);
    });
  }, []);
  console.log(gainerLoser);
  useEffect(() => {
    const gainerStrike = cloneDeep(strikePrice);
    setGainerStrikeArray(gainerStrike);
    const loserStrike = cloneDeep(strikePrice);
    setLoserStrikeArray(loserStrike);
  }, []);
  if (!gainerLoser) return <>loading...</>;
  return (
    <div
      className={style.stockDetailsContainer}
      style={{ textAlign: "center" }}
    >
      <div className="table-info-icons">
        <div
          style={{
            cursor: "pointer",
            color: "#3f62d7",
            marginLeft: "auto",
          }}
          onClick={() => handleToggleFavourite(id)}
        >
          {favouritesToggle ? <StarIcon /> : <StarBorderIcon />}
        </div>
      </div>
      <table className={style.tableContainer} data-theme={props.theme}>
        <thead>
          <tr>
            <td
              colSpan={3}
              style={{
                backgroundColor: "inherit",
                border: "0",
                color: props.theme === "dark" ? "white" : "black",
              }}
            >
              Top Gainers
            </td>
          </tr>
        </thead>
        <tbody>
          {topGainers?.map((strike, i) => {
            if (!strike) return null;
            return (
              <tr key={strike.symbol}>
                <td>{strike.symbol}</td>
                <td className="textbold" style={{ color: "green" }}>
                  {strike.ltp}
                </td>
                <td>{strike.volume}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <table className={style.tableContainer} data-theme={props.theme}>
        <thead>
          <tr>
            <td
              style={{
                backgroundColor: "inherit",
                border: "0",
                color: props.theme === "dark" ? "white" : "black",
              }}
              colSpan={3}
            >
              Top Losers
            </td>
          </tr>
        </thead>
        <tbody>
          {topLosers?.map((strike, i) => {
            if (!strike) return null;
            return (
              <tr key={strike.symbol}>
                <td>{strike.symbol}</td>
                <td className="textbold" style={{ color: "red" }}>
                  {strike.ltp}
                </td>
                <td>{strike.volume}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
      Previous Date
      <br />
      {expiryDates.map((expiry, index) => {
        if (index === 0) return null;
        return (
          <React.Fragment key={index}>
            <div
              style={{
                cursor: "pointer",
                padding: "5px",
                "&:hover": {
                  backgroundColor: "#efefef",
                },
              }}
              onClick={() => toggle(index)}
            >
              {expiry}
            </div>
            {isActive === index ? (
              <>
                <table
                  className={style.tableContainer}
                  data-theme={props.theme}
                >
                  <thead>
                    <tr>
                      <td
                        style={{ backgroundColor: "inherit", border: "0" }}
                        colSpan={3}
                      >
                        Top Gainers
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {gainerLoser?.["Top Gainers"][expiry]?.map((strike, i) => {
                      if (!strike) return null;
                      return (
                        <tr key={strike.symbol}>
                          <td>{strike.symbol}</td>
                          <td>{strike.ltp}</td>
                          <td>{strike.volume}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <table
                  className={style.tableContainer}
                  data-theme={props.theme}
                >
                  <thead>
                    <tr>
                      <td
                        style={{ backgroundColor: "inherit", border: "0" }}
                        colSpan={3}
                      >
                        Top Losers
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {gainerLoser?.["Top Losers"][expiry]?.map((strike, i) => {
                      if (!strike) return null;
                      return (
                        <tr key={strike.symbol}>
                          <td>{strike.symbol}</td>
                          <td>{strike.ltp}</td>
                          <td>{strike.volume}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            ) : (
              <></>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default GainerAndLoserStocks;
