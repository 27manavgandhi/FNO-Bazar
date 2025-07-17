import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, off, get } from "firebase/database";

import { db, futureDB } from "../../firebase";
import { app } from "../../firebase";
import style from "./HighestOi.module.css";
import { cloneDeep } from "lodash";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import { Box, Button, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";

import StarIcon from "@mui/icons-material/Star";
import "./Option.css";
import { useFavourites } from "../../contexts/FavouritesContext";
function HighestOi(props) {
  const { setHighestOiOptions, highestOiOptions, tableWidth } = props;
  const [date, setDate] = useState([]);
  const [oiDataNifty, setOiDataNifty] = useState([]);
  const [oiDataBankNifty, setOiDataBankNifty] = useState([]);
  const [niftyCallStrikePrices, setNiftyCallStrikePrices] = useState([]);
  const [niftyPutStrikePrices, setNiftyPutStrikePrices] = useState([]);
  const [expiryDates, setExpiryDates] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [toggleButton, setToggleButton] = useState(false);
  //   console.log(expiryDates);
  // -------------FAVORITES FUNCTION-------------------
  const id = "highestoi";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Highest OI";
    const index = favourites.findIndex((component) => component.id === id);
    // console.log({ favourites });
    if (index !== -1) {
      removeFavourite({ id, label });
      setFavouritesToggle(false);
    } else {
      addFavourite({ id, label });
      setFavouritesToggle(true);
    }
  };

  // ---------------- Function to load options from localStorage--------START--------

  const loadOptionsFromLocalStorage = () => {
    const savedOptions = JSON.parse(localStorage.getItem("highestOiOptions"));
    if (savedOptions) {
      setHighestOiOptions(savedOptions);
    }
  };
  const toggleIndex = () => {
    setHighestOiOptions((prev) =>
      prev.index === "nifty50" ? { index: "niftybank" } : { index: "nifty50" }
    );
    localStorage.setItem(
      "highestOiOptions",
      JSON.stringify(
        highestOiOptions.index === "nifty50"
          ? { index: "niftybank" }
          : { index: "nifty50" }
      )
    );
  };

  useEffect(() => {
    setComponentLoading(true);
    const rtdb = getDatabase(app);
    // get list of expiries from realtime database first

    const expiryRef = ref(rtdb, "tick/Option");

    // Attach a listener to the "expiry" reference to listen for changes in the data
    const dateFetchOption = async () => {
      const callsSnapshot = await get(expiryRef);
      const expiryData = callsSnapshot.val();
      // setExpiryDataObject(expiryData);
      var expiryArray = expiryData ? Object.keys(expiryData) : [];
      // var NiftDate=
      // remove all dates before today from expiryArray
      const currentDate = new Date();

      // Set the time to the beginning of the day for both dates
      const currentDateStartOfDay = new Date(currentDate);
      currentDateStartOfDay.setHours(0, 0, 0, 0);

      expiryArray = expiryArray.filter((dateString) => {
        const [dd, mm, yy] = dateString.split("-").map(Number);
        const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
        const expiryDate = new Date(fullYear, mm - 1, dd); // Adjust year to 4-digit format

        // Include dates on or after the current date (ignoring time)
        return expiryDate >= currentDateStartOfDay;
      });

      setDate(expiryArray);
      // Call the Nifty Data When App Renders
      fetchNiftyData(expiryArray);
      setComponentLoading(false);
    };
    dateFetchOption();

    // info from local storage
    loadOptionsFromLocalStorage();
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
    return () => {
      // Detach the listener when the component unmounts
      off(expiryRef, "value");
    };
  }, []);
  console.log(date);
  //NIFTY DATA FETCH FUNCTION
  const fetchNiftyData = (date) => {
    let oiBankNiftyData = [];
    let oiNiftyData = [];
    let unsubscribe;

    for (let i = 0; i < date.length; i++) {
      console.log("-------for loop--------");
      const dbRef = ref(futureDB, `/tick/Option/${date[i]}`);

      unsubscribe = onValue(dbRef, (snapshot) => {
        if (snapshot.val().NIFTY) {
          console.log(snapshot.val());
          const temp = snapshot.val().NIFTY;
          oiNiftyData.push({
            date: date[i],
            data: temp,
          });
        }
        if (snapshot.val().BANKNIFTY) {
          const temp = snapshot.val().BANKNIFTY;
          oiBankNiftyData.push({
            date: date[i],
            data: temp,
          });
        }
      });
    }

    setOiDataNifty(oiNiftyData);
    setOiDataBankNifty(oiBankNiftyData);
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchNiftyData(date);
    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        unsubscribe();
      }
    };
  }, [date]);

  console.log({ oiDataBankNifty });
  // OI NIFTY 50 DATA TABLE FUNCTION
  const oiNiftyTable = (index, niftyStrikeArray1, niftyPutStrike1) => {
    return (
      <React.Fragment key={index}>
        <tr>
          <td
            style={{
              color: props.theme === "dark" ? "white " : "black",
              backgroundColor: "inherit",
              border: "0",
            }}
            className="textbold"
            colSpan={4}
          >
            {oiDataNifty[index].date}
          </td>
        </tr>
        <tr>
          <td
            className="textbold strike_prices"
            data-theme={props.theme}
            rowSpan={2}
          >
            Call
          </td>
          {niftyStrikeArray1.map((strike, i) => {
            if (i >= 3) return null;
            return (
              <td
                style={{
                  color: "#3f62d7",
                  fontWeight: "bold",
                }}
                key={strike}
              >
                {strike}
              </td>
            );
          })}
        </tr>
        <tr>
          {niftyStrikeArray1.map((strike, i) => {
            if (i >= 3) return null;
            return (
              <td key={strike}>
                {oiDataNifty[index].data.Calls?.[strike]?.OI}
              </td>
            );
          })}
        </tr>
        <tr>
          <td
            className="textbold strike_prices"
            data-theme={props.theme}
            rowSpan={2}
          >
            Put
          </td>
          {niftyPutStrike1.map((strike, i) => {
            if (i >= 3) return null;
            return (
              <td
                style={{
                  color: "#3f62d7",
                  fontWeight: "bold",
                }}
                key={strike}
              >
                {strike}
              </td>
            );
          })}
        </tr>
        <tr>
          {niftyPutStrike1.map((strike, i) => {
            if (i >= 3) return null;
            return (
              <td key={strike}>{oiDataNifty[index].data.Puts?.[strike]?.OI}</td>
            );
          })}
        </tr>
      </React.Fragment>
    );
  };
  // ----------OI BANK NIFTY DATA TABLE FUNCTION

  // const oiBankNiftyTable = (index, niftyStrikeArray1, niftyPutStrike1) => {
  //   return (

  //   );
  // };
  console.log(oiDataNifty);
  if (oiDataNifty.length <= 0) return <>loading</>;
  // const styleBox = {
  //   position: "absolute",
  //   top: "50%",
  //   left: "50%",
  //   transform: "translate(-50%, -50%)",
  //   // width: 800,
  //   bgcolor: props.theme === "dark" ? "rgba(0, 4, 18, 1)" : "background.paper",
  //   // border: "1px solid #000",
  //   boxShadow: 15,
  //   borderRadius: ".51rem",
  // };
  // const handleOpen = () => setToggleButton(true);
  // const handleClose = () => setToggleButton(false);

  return (
    <>
      <div className="table-info-icons">
        {/* <div
          style={{
            cursor: "pointer",
            backgroundColor:
              props.theme === "dark"
                ? "rgba(38, 40, 47, 0.6)"
                : "rgba(224, 224, 228, 1)",
            borderRadius: "10px",
            padding: "0.5rem",
          }}
        >
          {" "}
          <TuneIcon />
          <FilterSVG theme={props.theme} />
        </div> */}
        {/* // toggle  */}
        <div style={{ margin: "auto" }}>
          <Button
            style={{ width: "max-content" }}
            onClick={toggleIndex}
            variant="outlined"
          >
            {highestOiOptions.index}
          </Button>
          {/* <select
            name="option-highestoi-index1"
            id="option-highestoi-index1"
            className="subpage-dropdown"
            onChange={(e) => {
              setHighestOiOptions({
                ...highestOiOptions,
                index: e.target.value,
              });
            }}
          >
            <option value="nifty50">Nifty 50</option>
            <option value="niftybank">Nifty Bank</option>
          </select>
          <p>Select Indices</p> */}
        </div>

        <div
          style={{
            cursor: "pointer",
            color: "#3f62d7",
          }}
          onClick={() => handleToggleFavourite(id)}
        >
          {favouritesToggle ? <StarIcon /> : <StarBorderIcon />}
        </div>
      </div>
      <div className={style.Container}>
        {/* <div className="option-highestoi">
        <div className="subpage-dropdowns-container">
          <div  style={{ cursor: "pointer" }}>
            <StarBorderIcon />
          </div>
        </div>
      </div> */}

        <table className={style.tableContainer} data-theme={props.theme}>
          <tbody>
            {highestOiOptions.index === "nifty50" ? (
              <>
                {oiDataNifty.map((item, index) => {
                  // if (index >= 2) return;
                  const niftyStrikeArray1 = [];
                  for (let keys in item.data.Calls) {
                    niftyStrikeArray1.push(keys);
                  }

                  const niftyPutStrike1 = cloneDeep(niftyStrikeArray1);

                  niftyStrikeArray1.sort((a, b) => {
                    return item.data.Calls?.[b]?.OI - item.data.Calls?.[a]?.OI;
                  });
                  niftyPutStrike1.sort((a, b) => {
                    return item.data.Puts?.[b]?.OI - item.data.Puts?.[a]?.OI;
                  });
                  if (index >= 3) return null;
                  return oiNiftyTable(
                    index,
                    niftyStrikeArray1,
                    niftyPutStrike1
                  );
                })}
              </>
            ) : (
              <>
                {" "}
                {oiDataBankNifty.map((item, index) => {
                  // if (index >= 2) return;
                  const niftyStrikeArray1 = [];
                  for (let keys in item.data.Calls) {
                    niftyStrikeArray1.push(keys);
                  }

                  const niftyPutStrike1 = cloneDeep(niftyStrikeArray1);

                  niftyStrikeArray1.sort((a, b) => {
                    return item.data.Calls?.[b]?.OI - item.data.Calls?.[a]?.OI;
                  });
                  niftyPutStrike1.sort((a, b) => {
                    return item.data.Puts?.[b]?.OI - item.data.Puts?.[a]?.OI;
                  });
                  if (index >= 3) return null;
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td
                          style={{
                            color: props.theme === "dark" ? "white " : "black",
                            backgroundColor: "inherit",
                            border: "none",
                          }}
                          colSpan={4}
                          className="textbold strike_prices"
                        >
                          {oiDataBankNifty[index].date}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="textbold strike_prices"
                          data-theme={props.theme}
                          rowSpan={2}
                        >
                          Call
                        </td>
                        {niftyStrikeArray1.map((strike, i) => {
                          if (i >= 3) return null;
                          return (
                            <td
                              style={{
                                color: "#3f62d7",
                                fontWeight: "bold",
                              }}
                              key={strike}
                            >
                              {strike}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        {niftyStrikeArray1.map((strike, i) => {
                          if (i >= 3) return null;
                          return (
                            <td key={strike}>
                              {oiDataBankNifty[index].data.Calls?.[strike]?.OI}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td
                          className="textbold strike_prices"
                          data-theme={props.theme}
                          rowSpan={2}
                        >
                          Put
                        </td>
                        {niftyPutStrike1.map((strike, i) => {
                          if (i >= 3) return null;
                          return (
                            <td
                              style={{
                                color: "#3f62d7",
                                fontWeight: "bold",
                              }}
                              key={strike}
                            >
                              {strike}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        {niftyPutStrike1.map((strike, i) => {
                          if (i >= 3) return null;
                          return (
                            <td key={strike}>
                              {oiDataBankNifty[index].data.Puts?.[strike]?.OI}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>{" "}
    </>
  );
}

export default HighestOi;
