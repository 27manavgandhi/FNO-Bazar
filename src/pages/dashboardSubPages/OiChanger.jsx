import React, { useEffect, useState } from "react";
import { db, futureDB } from "../../firebase";
import { app } from "../../firebase";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { ConstructionOutlined } from "@mui/icons-material";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import "./Option.css";
import style from "./StockDetails.module.css";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";
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

  // If current time is between 9:15 AM and 3:30 PM
  if (currentTime >= startTime && currentTime <= endTime) {
    // Show timestamps only from the last one hour
    const oneHourAgo = new Date(currentTime);
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    generateTimestampsInRange(timestamps, oneHourAgo, currentTime);
  } else if (currentTime > endTime) {
    // Show timestamps from 2:15 PM to 3:30 PM
    const newStartTime = new Date(currentTime);
    newStartTime.setHours(14, 15, 0, 0); // Set start time to 2:15 PM
    generateTimestampsInRange(timestamps, newStartTime, endTime);
  }

  // Sort the array in reverse order
  timestamps.sort((a, b) => new Date(b) - new Date(a));

  return timestamps;
}

function generateTimestampsInRange(timestamps, startTime, endTime) {
  // Initialize the current time
  let currentTimePointer = new Date(endTime);

  // Generate timestamps with a 3-minute gap from last one hour
  while (currentTimePointer >= startTime) {
    // Format the current time
    const formattedTime = currentTimePointer.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    timestamps.push(formattedTime);

    // Decrement the current time by 3 minutes
    currentTimePointer.setMinutes(currentTimePointer.getMinutes() - 3);
  }
}

// Call the function and get the array of sorted timestamps
const result = generateTimestamps();

// Print the result to the console
console.log(result);

// Call the function and get the array of timestamps
// const result = generateTimestamps();

// // Print the result to the console
// console.log(result);

function OiChanger(props) {
  const { oiChangerOptions, setOiChangerOptions, theme } = props;
  const [toggleButton, setToggleButton] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);
  const [oiChangerData, setOiChangerData] = useState([]);
  const [indexData, setIndexData] = useState([]);
  const [strikeArray, setStrikeArray] = useState([]);
  const [timestampsArray, setTimestampsArray] = useState(generateTimestamps());
  const [currentTime, setCurrentTime] = useState("");
  const [expiry, setExpiry] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [expiryDates, setExpiryDates] = useState([]);
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  console.log(generateTimestamps());
  // useEffect(() => {
  //   const rtdb = getDatabase(app);
  //   const oiChangerRef = ref(rtdb, `recent data/`);
  //   const fetchOichanger = async () => {
  //     const callsSnapshot = await get(oiChangerRef);
  //     const Data = callsSnapshot.val();
  //     console.log(Data);
  //     setOiChangerData(Data);
  //   };
  //   fetchOichanger();
  // }, []);
  const [loading, setLoading] = useState(false);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });

  // favourites options and functions
  const id = "oichanger";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "OI Changer";
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
  // ---------------- Function to load options from localStorage--------START--------

  const loadOptionsFromLocalStorage = () => {
    const savedOptions = JSON.parse(localStorage.getItem("OIChangerOptions"));
    if (savedOptions) {
      setOiChangerOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setOiChangerOptions(updatedOptions);
    localStorage.setItem("OIChangerOptions", JSON.stringify(updatedOptions));
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
      setExpiryDataObject(expiryData);
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

      setExpiryDates(expiryArray);
    };
    dateFetchOption();

    setComponentLoading(false);

    loadOptionsFromLocalStorage();
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

  useEffect(() => {
    let bankNiftyDate = [];
    let niftyDate = [];
    expiryDates.forEach((expiry) => {
      if (expiry) {
        if (expiryDataObject[expiry].BANKNIFTY) {
          bankNiftyDate.push(expiry);
        }
        if (expiryDataObject[expiry].NIFTY) {
          niftyDate.push(expiry);
        }
      }
    });

    setIndexWiseExpiry({
      nifty: niftyDate,
      banknifty: bankNiftyDate,
    });
  }, [expiryDates]);

  // useEffect(() => {
  //   let niftyDate = [];
  //   let bankNiftyDate = [];
  //   for (let i = 0; i < expiryDates.length; i++) {
  //     const dbRef = ref(futureDB, `tick/Option/${expiryDates[i]}`);
  //     onValue(dbRef, (snapshot) => {
  //       const temp = snapshot.val();
  //       if (temp) {
  //         if (temp.BANKNIFTY) {
  //           bankNiftyDate.push(expiryDates[i]);
  //           console.log(expiryDates[i]);
  //         }
  //         if (temp.NIFTY) {
  //           niftyDate.push(expiryDates[i]);
  //           console.log(expiryDates[i]);
  //         }
  //       }
  //       console.log(niftyDate, bankNiftyDate);
  //     });
  //     setIndexWiseExpiry({
  //       ...indexWiseExpiry,
  //       nifty: niftyDate,
  //       banknifty: bankNiftyDate,
  //     });
  //   }

  // }, [isLoading]);

  useEffect(() => {
    const date =
      oiChangerOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [oiChangerOptions, indexWiseExpiry]);
  //-----strike price calculation------
  useEffect(() => {
    const index =
      oiChangerOptions["index"] === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    const unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          2,
          oiChangerOptions["index"] === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
        // setoiChangerOptions({
        //   ...oiChangerOptions,
        //   strikPrice: strikePriceArray[0],

        // });
        setStrikeArray(strikePriceArray);
      }
    });
    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [oiChangerOptions["index"]]);

  //OI changer data fetching------------
  useEffect(() => {
    setOiChangerData([]);
    let unsubscribe;
    let tempData;
    const strikePriceArray = [];
    let strikRef;
    const callorput = oiChangerOptions["callorput"];
    const index = oiChangerOptions["index"];
    const indices =
      oiChangerOptions["index"] === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    //Data Fetching code

    let indexData = [];
    let dbRef;
    let unsubscribeIndex;
    let downData = [];
    console.log(`/recent data/${timestampsArray[1]}/Option/${expiry}/${index}`);
    for (let i = 0; i < timestampsArray.length; i++) {
      dbRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Option/${expiry}/${index}`
      );

      const indexRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Index/${indices}`
      );

      unsubscribe = onValue(dbRef, (snapshot) => {
        if (snapshot.val()) {
          downData.push(snapshot.val());
          setOiChangerData(downData);
        }
      });
      unsubscribeIndex = onValue(indexRef, (snapshot) => {
        if (snapshot.val()) {
          indexData.push(snapshot.val());
          setIndexData(indexData);
        }
      });
    }

    console.log("running oi");
    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
      if (unsubscribeIndex) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribeIndex();
      }
    };
    // tempData
  }, [oiChangerOptions, expiry, timestampsArray]);
  const index = oiChangerOptions["index"];
  console.log(oiChangerData);
  if (oiChangerData.length === 0) return <>loading...</>;
  // STYLE FOR MODAL
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: 800,
    bgcolor: props.theme === "dark" ? "rgba(0, 4, 18, 1)" : "background.paper",
    // border: "1px solid #000",
    boxShadow: 15,
    borderRadius: ".51rem",
  };
  const handleOpen = () => setToggleButton(true);
  const handleClose = () => setToggleButton(false);
  return (
    <div data-theme={theme}>
      <div className="table-info-icons">
        <div
          onClick={handleOpen}
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
          {/* <TuneIcon /> */}
          <FilterSVG theme={props.theme} />
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
      {/* <div
            style={{
              display: "flex",
              justifyItems: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{ cursor: "pointer", padding: "1rem" }}
              onClick={handleOpen}
            >
              {" "}
              <TuneIcon />
            </div>
            <div
              className="dropdown-container"
              style={{ cursor: "pointer" }}
              onClick={() => handleToggleFavourite(id)}
            >
              <StarBorderIcon />
            </div>
          </div> */}
      {/* TABLE 1 DROPDOWNS */}
      <Modal
        open={toggleButton}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <div
            className="option-optionchain subpage  "
            // style={{ marginRight: "32px" }}
          >
            <div className=" subpage-dropdowns-container">
              <div className="dropdown-container">
                <select
                  name="option-oichanger-index"
                  id="option-oichanger-table1-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...oiChangerOptions,

                      index: e.target.value,
                    });
                  }}
                  value={oiChangerOptions.index}
                >
                  <option value="NIFTY">Nifty</option>
                  <option value="BANKNIFTY">BankNifty</option>
                </select>
                <p>Select Indices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-straddleandstrangle-index"
                  id="option-straddleandstrangle-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...oiChangerOptions,
                      expiry: e.target.value,
                    });
                    setExpiry(e.target.value);
                  }}
                  value={oiChangerOptions.expiry}
                >
                  {oiChangerOptions.index === "NIFTY" ? (
                    <>
                      {indexWiseExpiry.nifty.map((expiryDate, index) => {
                        return (
                          <option key={index} value={expiryDate}>
                            {expiryDate}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {indexWiseExpiry.banknifty.map((expiryDate, index) => {
                        return (
                          <option key={index} value={expiryDate}>
                            {expiryDate}
                          </option>
                        );
                      })}
                    </>
                  )}
                </select>
                <p>Expiry</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-oichanger-table2-time"
                  id="option-oichanger-table2-time"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...oiChangerOptions,

                      value: e.target.value,
                    });
                  }}
                  value={oiChangerOptions.value}
                >
                  <option value={50000}>50k</option>
                  <option value={100000}>100k</option>
                  <option value={150000}>150k</option>
                  <option value={200000}>200k</option>
                </select>
                <p>Select COI value</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-oichanger-table1-callorput"
                  id="option-oichanger-table1-callorput"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...oiChangerOptions,

                      callorput: e.target.value,
                    });
                  }}
                  value={oiChangerOptions.callorput}
                >
                  <option value="Calls">Call</option>
                  <option value="Puts">Put</option>
                </select>
                <p>Call or Put</p>
              </div>
            </div>{" "}
          </div>
        </Box>
      </Modal>
      <div className={`${style.stocktableContainer} overflowWrapper`}>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              <th
                colSpan={strikeArray.length + 2}
                style={{ border: "none" }}
                className="textbold "
              >
                Strike Prices
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ color: "#1976d2" }}>
              <td
                className="textbold strike_prices"
                style={{ color: "#1976d2" }}
                data-theme={props.theme}
              >
                Time
              </td>
              <td className="textbold">Index</td>
              {strikeArray.map((strike, i) => {
                const coi = (
                  oiChangerData?.[oiChangerOptions.callorput]?.[strike]?.OI -
                  oiChangerData?.[oiChangerOptions.callorput]?.[strike]
                    ?.Prev_Close
                ).toFixed(0);

                return (
                  <td className="textbold" key={strike}>
                    {strike}
                  </td>
                );
              })}
            </tr>
            {timestampsArray.map((item, index) => {
              if (index === 0) return null;
              if (index === timestampsArray.length - 1) return null;

              return (
                <tr key={item}>
                  <td
                    className="textbold strike_prices"
                    data-theme={props.theme}
                  >
                    {item}
                  </td>
                  <td>{indexData[index]?.LTP?.toFixed(2)}</td>

                  {strikeArray.map((strike, i) => {
                    const previousCoi = (
                      oiChangerData[index - 1]?.[oiChangerOptions.callorput]?.[
                        strike
                      ]?.OI -
                      oiChangerData[index - 1]?.[oiChangerOptions.callorput]?.[
                        strike
                      ]?.Prev_Open_Int_Close
                    ).toFixed(0);
                    const coi = (
                      oiChangerData[index]?.[oiChangerOptions.callorput]?.[
                        strike
                      ]?.OI -
                      oiChangerData[index]?.[oiChangerOptions.callorput]?.[
                        strike
                      ]?.Prev_Open_Int_Close
                    ).toFixed(0);
                    const difference = coi - previousCoi;
                    let color = "";
                    if (difference >= oiChangerOptions.value) {
                      color = "green";
                    }
                    if (difference < 0) {
                      color = "red";
                    }

                    return (
                      <td style={{ backgroundColor: `${color}` }} key={strike}>
                        {coi}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OiChanger;
