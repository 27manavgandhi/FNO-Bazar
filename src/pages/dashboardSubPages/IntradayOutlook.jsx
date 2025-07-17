import React, { useEffect, useState } from "react";
import style from "./IntradayOutlook.module.css";
import { db, futureDB, app } from "../../firebase";
import { onValue, ref } from "firebase/database";
import { getDatabase, off, get } from "firebase/database";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import HighestOi from "./HighestOi";

import StarIcon from "@mui/icons-material/Star";
import { useFavourites } from "../../contexts/FavouritesContext";
function generateTimestamps() {
  const timestamps = [];

  // Get the current time
  const currentTime = new Date();

  // Set the start time to 9:15 AM
  const startTime = new Date(currentTime);
  startTime.setHours(9, 15, 0, 0);

  // Set the end time to 3:30 PM
  const endTime = new Date(currentTime);
  endTime.setHours(15, 30, 0, 0);

  // If current time is after 3:30 PM, generate timestamps from 2:15 PM to 3:30 PM
  if (currentTime > endTime) {
    const newStartTime = new Date(currentTime);
    newStartTime.setHours(14, 15, 0, 0); // Set start time to 2:15 PM
    generateTimestampsInRange(timestamps, newStartTime, endTime);
  } else {
    // Generate timestamps from 9:15 AM to current time
    generateTimestampsInRange(timestamps, startTime, currentTime);
  }

  return timestamps;
}

function generateTimestampsInRange(timestamps, startTime, endTime) {
  // Initialize the current time
  let currentTimePointer = new Date(startTime);

  // Generate timestamps with a 3-minute gap until specified end time
  while (currentTimePointer <= endTime) {
    // Format the current time
    const formattedTime = currentTimePointer.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    timestamps.push(formattedTime);

    // Increment the current time by 3 minutes
    currentTimePointer.setMinutes(currentTimePointer.getMinutes() + 3);
  }
}

// Call the function and get the array of timestamps
const result = generateTimestamps();

// Print the result to the console
console.log(result);

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
function IntradayOutlook(props) {
  const { setHighestOiOptions, highestOiOptions, expiryDates } = props;
  const [intradayData, setIntradayData] = useState();
  const [intradayBankData, setIntradayBankData] = useState();
  const currentDate = "23" + getMonth().slice(0, 3).toUpperCase();
  const [futureExpiry, setFutureExpiry] = useState();
  const [componentLoading, setComponentLoading] = useState(true);
  // favourites options and functions
  const id = "intradayoutlook";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Intraday Outlook";
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
    let tempData = [];

    const dbRef = ref(futureDB, `/tick/Future/${futureExpiry}/NIFTY FUT`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      tempData = snapshot.val();

      setIntradayData(tempData);
    });

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [futureExpiry]);
  useEffect(() => {
    let downData = [];
    const dbRef = ref(futureDB, `/tick/Future/${futureExpiry}/BANKNIFTY FUT`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      downData = snapshot.val();

      setIntradayBankData(downData);
    });

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [futureExpiry]);
  console.log(intradayData);
  return (
    <>
      <div className="table-info-icons">
        <div>{/* FILTER ICON IF NEEDED  */}</div>
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
              {/* call columns */}

              <th>Nifty</th>
              <th className={style.strike_prices} data-theme={props.theme}>
                Index
              </th>
              <th>BankNifty</th>
            </tr>
          </thead>
          <tbody>
            <tr className={style.textbold}>
              {/* call columns */}

              <td>
                <span>{intradayData?.LTP}</span>
              </td>
              <td
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Price
              </td>
              <td>{intradayBankData?.LTP}</td>
            </tr>
            <tr>
              {/* call columns */}

              <td>{intradayData?.OI}</td>
              <td
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                OI
              </td>
              <td>{intradayBankData?.OI}</td>
            </tr>
            <tr>
              {/* call columns */}

              <td>{intradayData?.OI - intradayData?.Prev_Close}</td>
              <td
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                OI Change
              </td>
              <td>{intradayBankData?.OI - intradayBankData?.Prev_Close}</td>
            </tr>
            <tr>
              {/* call columns */}

              <td>{intradayData?.Volume}</td>
              <td
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Volume
              </td>
              <td>{intradayBankData?.Volume}</td>
            </tr>
            <tr>
              {/* call columns */}

              <td>
                {(intradayData?.LTP - intradayData?.Prev_Close).toFixed(2)}
              </td>
              <td
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Premium Decay
              </td>
              <td>
                {(intradayBankData?.LTP - intradayBankData?.Prev_Close).toFixed(
                  2
                )}
              </td>
            </tr>
            <tr>
              {/* call columns */}

              <td>tbd</td>
              <td
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                PCR
              </td>
              <td>tbd</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2 style={{ textAlign: "center", marginTop: "1rem", width: "100%" }}>
        Highest OI
      </h2>
      <HighestOi
        setHighestOiOptions={setHighestOiOptions}
        highestOiOptions={highestOiOptions}
        expiryDates={expiryDates}
        theme={props.theme}
      />
    </>
  );
}

export default IntradayOutlook;
