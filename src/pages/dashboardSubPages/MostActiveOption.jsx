import React, { useEffect, useState } from "react";
import style from "./MostActiveOption.module.css";
import { cloneDeep } from "lodash";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { db, futureDB } from "../../firebase";
import { app } from "../../firebase";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";

import StarIcon from "@mui/icons-material/Star";
import { useFavourites } from "../../contexts/FavouritesContext";
function MostActiveOption(props) {
  const { mostActiveOptionsOptions, setMostActiveOptionsOptions } = props;

  const [optionChainData, setOptionChainData] = useState({
    Calls: [],
    Puts: [],
  });
  const [toggleButton, setToggleButton] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);
  const [expiryDates, setExpiryDates] = useState([]);
  const [time, setTime] = useState(0);
  const [timeGap, setTimeGap] = useState();
  const [expiry, setExpiry] = useState("");
  const [strikeArray, setStrikeArray] = useState([]);
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  // favourites options and functions
  const id = "mostactiveoptions";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Most Active Options";
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
    const savedOptions = JSON.parse(
      localStorage.getItem("mostActiveOptionsOptions")
    );
    if (savedOptions) {
      setMostActiveOptionsOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setMostActiveOptionsOptions(updatedOptions);
    localStorage.setItem(
      "mostActiveOptionsOptions",
      JSON.stringify(updatedOptions)
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

  useEffect(() => {
    console.log("-------expiry date keeps running");
    const date =
      mostActiveOptionsOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [mostActiveOptionsOptions.index, indexWiseExpiry]);

  useEffect(() => {
    let unsubscribe;
    const dbRef =
      mostActiveOptionsOptions["index"] === "NIFTY" ? "NIFTY" : "BANKNIFTY";

    const rtdb = getDatabase(app);

    const optionTimeChainCallRef = ref(
      rtdb,
      `recent data/${timeGap}/Option/${expiry}/${dbRef}/Calls`
    );
    const optionTimeChainPutRef = ref(
      rtdb,
      `recent data/${timeGap}/Option/${expiry}/${dbRef}/Puts`
    );
    const fetchOptionChainHistoricData = async () => {
      try {
        const callsSnapshot = await get(optionTimeChainCallRef);
        const putsSnapshot = await get(optionTimeChainPutRef);

        const callsData = callsSnapshot.val();
        const putsData = putsSnapshot.val();

        if (callsData && putsData) {
          setOptionChainData({ Calls: callsData, Puts: putsData });
          console.log(`tick/${timeGap}/Option/${expiry}/${dbRef}/Calls`);
        }
      } catch (error) {
        // Handle the error if necessary
        console.error("Error fetching option chain data:", error);
      }
    };

    const fetchOptionChainData = async () => {
      try {
        const optionChainCallRef = ref(
          futureDB,
          `tick/Option/${expiry}/${dbRef}`
        );
        console.log(`tick/Option/${expiry}/${dbRef}`);
        unsubscribe = onValue(optionChainCallRef, (snapshot) => {
          const callsSnapshot = snapshot.val();
          // const callsData = callsSnapshot.Calls;
          // const putsData = callsSnapshot.Puts;
          if (callsSnapshot) {
            const callsData = callsSnapshot.Calls;
            const putsData = callsSnapshot.Puts;
            setOptionChainData(callsSnapshot);
          }
        });
      } catch (error) {
        // Handle the error if necessary
        console.error("Error fetching option chain data:", error);
      }
    };

    if (time > 0) {
      fetchOptionChainHistoricData();
      console.log(`${time} time data run here`);
    } else {
      fetchOptionChainData();
      console.log("live data runn here---------");
    }

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [expiry, mostActiveOptionsOptions, time, indexWiseExpiry]);

  useEffect(() => {
    console.log(mostActiveOptionsOptions["numStrikePrice"]);
    const index =
      mostActiveOptionsOptions["index"] === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    const unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          mostActiveOptionsOptions["numStrikePrice"] || 5,
          mostActiveOptionsOptions["index"] === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
      }
    });
    setStrikeArray(strikePriceArray);

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [
    mostActiveOptionsOptions["index"],
    mostActiveOptionsOptions["numStrikePrice"],
  ]);

  console.log(optionChainData, strikeArray);
  const [mostActiveCallOption, setMostActiveCallOption] = useState([]);
  const [mostActivePutOption, setMostActivePutOption] = useState([]);
  useEffect(() => {
    const tempCallData = cloneDeep(strikeArray);

    const callStrike = tempCallData;
    const tempPutData = cloneDeep(strikeArray);

    const putStrike = tempPutData;
    console.log();
    if (mostActiveOptionsOptions.parameter == "OI") {
      const callSorted = callStrike?.toSorted((a, b) => {
        return (
          optionChainData?.Calls?.[b]?.["OI"] -
          optionChainData?.Calls?.[a]?.["OI"]
        );
      });
      setMostActiveCallOption(callSorted);
      const putSorted = putStrike?.toSorted((a, b) => {
        return (
          optionChainData?.Puts?.[b]?.["OI"] -
          optionChainData?.Puts?.[a]?.["OI"]
        );
      });
      setMostActivePutOption(putSorted);
    }
    if (mostActiveOptionsOptions.parameter == "Volume") {
      console.log(mostActiveOptionsOptions.parameter);
      const callSorted = callStrike?.toSorted((a, b) => {
        return (
          optionChainData?.Calls?.[b]?.["Volume"] -
          optionChainData?.Calls?.[a]?.["Volume"]
        );
      });
      setMostActiveCallOption(callSorted);
      const putSorted = putStrike?.toSorted((a, b) => {
        return (
          optionChainData?.Puts?.[b]?.["Volume"] -
          optionChainData?.Puts?.[a]?.["Volume"]
        );
      });
      setMostActivePutOption(putSorted);
    }
    if (mostActiveOptionsOptions.parameter == "COI") {
      const callSorted = callStrike?.toSorted((a, b) => {
        return (
          optionChainData.Calls?.[b]["OI"] -
          optionChainData.Calls?.[b]["Prev_Open_Int_Close"] -
          (optionChainData.Calls?.[a]["OI"] -
            optionChainData.Calls?.[a]["Prev_Open_Int_Close"])
        );
      });
      setMostActiveCallOption(callSorted);
      const putSorted = putStrike?.toSorted((a, b) => {
        return (
          optionChainData.Puts?.[b]["OI"] -
          optionChainData.Puts?.[b]["Prev_Open_Int_Close"] -
          (optionChainData.Puts?.[a]["OI"] -
            optionChainData.Puts?.[a]["Prev_Open_Int_Close"])
        );
      });
      setMostActivePutOption(putSorted);
    }

    // setMostActiveCallOption(callSorted);
  }, [mostActiveOptionsOptions, optionChainData, mostActiveOptionsOptions]);
  console.log(mostActiveCallOption);
  if (!optionChainData) return <>loading...</>;
  // MODAL STYLE AND OPEN CLOSE FUNCTIONS
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
    <div data-theme={props.theme}>
      <div className="option-orderflowanalysis">
        {/* MOST ACTIVE OPTIONS - CALL */}
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

        <Modal
          open={toggleButton}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <div className="subpage-dropdowns-container">
              <div className="dropdown-container">
                <select
                  name="option-mostactiveoptions-call-index"
                  id="option-mostactiveoptions-call-index"
                  className="subpage-dropdown"
                  value={mostActiveOptionsOptions.index}
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...mostActiveOptionsOptions,

                      index: e.target.value,
                    });
                  }}
                >
                  <option value="NIFTY">Nifty 50</option>
                  <option value="BANKNIFTY">Nifty Bank</option>
                </select>
                <p>Select Indices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-optionchain-expiry"
                  id="option-optionchain-expiry"
                  className="subpage-dropdown"
                  value={mostActiveOptionsOptions.expiry}
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...mostActiveOptionsOptions,
                      expiry: e.target.value,
                    });
                    setExpiry(e.target.value);
                  }}
                >
                  {mostActiveOptionsOptions.index === "NIFTY" ? (
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
                  name="option-mostactiveoptions-call-time"
                  id="option-mostactiveoptions-call-time"
                  className="subpage-dropdown"
                  value={mostActiveOptionsOptions.parameter}
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...mostActiveOptionsOptions,

                      parameter: e.target.value,
                    });
                  }}
                >
                  <option value="COI">COI</option>
                  <option value="Volume">Volume</option>
                  <option value="OI">OI</option>
                </select>
                <p>Parameter</p>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      <div className={style.container}>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              {/* call columns */}
              <th className={style.strike_prices} data-theme={props.theme}>
                Option
              </th>
              <th>Strike Price</th> <th>LTP</th> <th>Change</th> <th>High</th>
              <th>Low</th>
              <th>Volume</th>
              <th>OI</th>{" "}
            </tr>
          </thead>
          <tbody>
            {mostActiveCallOption?.map((strikePrice, index) => {
              if (index >= 5) return null;
              const callChange = (
                optionChainData?.Calls?.[strikePrice]?.["LTP"] -
                optionChainData.Calls?.[strikePrice]?.["Prev_Close"]
              ).toFixed(2);
              return (
                <tr key={index}>
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    Call
                  </td>
                  <td>{strikePrice}</td>
                  <td style={{ color: `${callChange < 0 ? "red" : "green"}` }}>
                    {optionChainData?.Calls?.[strikePrice]?.["LTP"]}
                  </td>
                  <td style={{ color: `${callChange < 0 ? "red" : "green"}` }}>
                    {callChange}
                  </td>
                  <td>{optionChainData?.Calls?.[strikePrice]?.["High"]}</td>
                  <td>{optionChainData?.Calls?.[strikePrice]?.["Low"]}</td>
                  <td>{optionChainData?.Calls?.[strikePrice]?.["Volume"]}</td>
                  <td>{optionChainData?.Calls?.[strikePrice]?.["OI"]}</td>
                </tr>
              );
            })}
            {mostActivePutOption?.map((strikePrice, index) => {
              if (index >= 5) return null;
              const putChange =
                optionChainData.Puts?.[strikePrice]?.["OI"] -
                optionChainData.Puts?.[strikePrice]?.["Prev_Open_Int_Close"];
              return (
                <tr key={index}>
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    Put
                  </td>
                  <td>{strikePrice}</td>
                  <td style={{ color: `${putChange < 0 ? "red" : "green"}` }}>
                    {optionChainData?.Puts?.[strikePrice]?.["LTP"]}
                  </td>
                  <td style={{ color: `${putChange < 0 ? "red" : "green"}` }}>
                    {putChange}
                  </td>
                  <td>{optionChainData?.Puts?.[strikePrice]?.["High"]}</td>
                  <td>{optionChainData?.Puts?.[strikePrice]?.["Low"]}</td>
                  <td>{optionChainData?.Puts?.[strikePrice]?.["Volume"]}</td>
                  <td>{optionChainData?.Puts?.[strikePrice]?.["OI"]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MostActiveOption;
