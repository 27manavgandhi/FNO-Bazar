import React, { useEffect, useState } from "react";
import style from "./MarketLook.module.css";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { futureDB, app } from "../../firebase";
import { useFavourites } from "../../contexts/FavouritesContext";

import StarIcon from "@mui/icons-material/Star";
function getMonth() {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const d = new Date();
  let name = month[d.getMonth()];
  return name;
}
function generateTimestampArray() {
  const startTimestamp = new Date();
  startTimestamp.setHours(9, 15, 0, 0); // Set the start time to 9:18 AM
  const endTimestamp = new Date();
  endTimestamp.setHours(15, 30, 0, 0); // Set the end time to 3:30 PM

  const timestamps = [];
  let currentTimestamp = new Date(startTimestamp);

  while (currentTimestamp <= endTimestamp) {
    const formattedTimestamp = currentTimestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    timestamps.push(formattedTimestamp);
    currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 5);
  }

  return timestamps;
}
export default function MarketLook(props) {
  const [niftyData, setNiftyData] = useState([]);
  const [bankNiftyData, setBankNiftyData] = useState([]);
  const [oiNiftyData, setOiNiftyData] = useState([]);
  const [oiBankNiftyData, setOiBankNiftyData] = useState([]);
  const timestampsArray = generateTimestampArray();
  const currentDate = "23" + getMonth().slice(0, 3).toUpperCase();
  const [futureExpiry, setFutureExpiry] = useState();
  const [componentLoading, setComponentLoading] = useState(true);
  // favourites options and functions
  const id = "marketlook";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Market Look";
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
  useEffect(() => {
    try {
      setComponentLoading(true);
      const rtdb = getDatabase(app);
      const futureRef = ref(rtdb, `tick/Future`);

      var fetchIndicesData = async () => {
        const niftysnap = await get(futureRef);
        const niftyData = niftysnap.val();
        const expiry = Object.keys(niftyData);
        const rbt = expiry[0];
        setFutureExpiry(rbt);
      };
      fetchIndicesData();
      // load the star If Already Marked....
      const index = favourites.findIndex((component) => component.id === id);
      if (index !== -1) {
        setFavouritesToggle(true);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    let unsubscribe1;
    let unsubscribe2;
    let unsubscribe3;
    let unsubscribe4;
    let tempData = [];
    let downData = [];
    let futureNiftyData = [];
    let futureBankNiftyData = [];
    for (let i = 0; i < timestampsArray.length; i++) {
      const dbRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Index/NIFTY 50`
      );
      const bankRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Index/NIFTY BANK`
      );
      const futureNiftyRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Future/${futureExpiry}/NIFTY FUT`
      );
      const futureBankNiftyRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Future/${futureExpiry}/BANKNIFTY FUT`
      );
      unsubscribe1 = onValue(dbRef, (snapshot) => {
        downData.push(snapshot.val());
        setNiftyData(downData);
        if (i == timestampsArray.length - 1) console.log("haris");
      });
      unsubscribe2 = onValue(bankRef, (snapshot) => {
        tempData.push(snapshot.val());
        setBankNiftyData(tempData);
        if (i == timestampsArray.length - 1) console.log("haris");
      });
      unsubscribe3 = onValue(futureNiftyRef, (snapshot) => {
        futureNiftyData.push(snapshot.val());
        setOiNiftyData(futureNiftyData);
        if (i == timestampsArray.length - 1) console.log("haris");
      });
      unsubscribe4 = onValue(futureBankNiftyRef, (snapshot) => {
        futureBankNiftyData.push(snapshot.val());
        setOiBankNiftyData(futureBankNiftyData);
        if (i == timestampsArray.length - 1) console.log("haris");
      });
    }

    return () => {
      if (unsubscribe1) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe1();
      }
      if (unsubscribe2) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe2();
      }
      if (unsubscribe3) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe3();
      }
      if (unsubscribe4) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe4();
      }
    };
  }, [futureExpiry]);
  return (
    <div className="relative">
      <div className="table-info-icons">
        <div>{/* FILTER ICON IF REQUIRED */}</div>
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

      <div className={style.container}>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              <td colSpan={10}>Nifty</td>
            </tr>
            <tr>
              {/* call columns */}
              <th
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Time
              </th>
              <th>Nifty</th> <th>Change</th> <th>Future</th> <th>Change</th>{" "}
              <th>Future OI Change</th> <th>VWAP</th>
              <th>PCR</th>
              <th>COI</th>
              <th>OI</th>
            </tr>
          </thead>
          <tbody>
            {timestampsArray.map((time, i) => {
              return (
                <tr key={time}>
                  {/* call columns */}
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    {time}
                  </td>
                  <td>{niftyData[i]?.LTP}</td>{" "}
                  <td>
                    {(niftyData[i]?.LTP - niftyData[i]?.Prev_Close).toFixed(2)}
                  </td>{" "}
                  <td>{oiNiftyData[i]?.LTP?.toFixed(0)}</td>{" "}
                  <td>
                    {(oiNiftyData[i]?.OI - oiNiftyData[i]?.LTP).toFixed(0)}
                  </td>{" "}
                  <td>
                    {(oiNiftyData[i]?.OI - oiNiftyData[i]?.Prev_Close)?.toFixed(
                      0
                    )}
                  </td>{" "}
                  <td>VWAP</td>
                  <td>PCR</td>
                  <td>
                    {oiNiftyData[i]?.OI - oiNiftyData[i]?.Prev_Open_Int_Close}
                  </td>
                  <td>{oiNiftyData[i]?.OI}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              <td colSpan={10}>BankNifty</td>
            </tr>
            <tr>
              {/* call columns */}
              <th
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Time
              </th>
              <th>BankNifty</th> <th>Change</th> <th>Future</th> <th>Change</th>{" "}
              <th>Future OI Change</th> <th>VWAP</th>
              <th>PCR</th>
              <th>COI</th>
              <th>OI</th>
            </tr>
          </thead>
          <tbody>
            {timestampsArray.map((time, i) => {
              return (
                <tr key={time}>
                  {/* call columns */}
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    {time}
                  </td>
                  <td>{bankNiftyData[i]?.LTP}</td>{" "}
                  <td>
                    {(
                      bankNiftyData[i]?.LTP - bankNiftyData[i]?.Prev_Close
                    ).toFixed(2)}
                  </td>{" "}
                  <td>{oiBankNiftyData[i]?.LTP?.toFixed(0)}</td>{" "}
                  <td>
                    {(oiBankNiftyData[i]?.OI - oiBankNiftyData[i]?.LTP).toFixed(
                      0
                    )}
                  </td>{" "}
                  <td>
                    {(
                      oiBankNiftyData[i]?.OI - oiBankNiftyData[i]?.Prev_Close
                    )?.toFixed(0)}
                  </td>{" "}
                  <td>VWAP</td>
                  <td>PCR</td>
                  <td>
                    {oiBankNiftyData[i]?.OI -
                      oiBankNiftyData[i]?.Prev_Open_Int_Close}
                  </td>
                  <td>{oiBankNiftyData[i]?.OI}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
