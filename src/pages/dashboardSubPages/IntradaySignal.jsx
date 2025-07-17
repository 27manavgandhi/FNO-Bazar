import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { getDatabase, off, get } from "firebase/database";
import { app } from "../../firebase";
import { futureDB } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import "./IntradaySignal.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import PremiumDecay from "./PremiumDecay";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import OiDirection from "./OiDirection";
import IntradayOptionChain from "./IntradayOptionChain";
import TuneIcon from "@mui/icons-material/Tune";
import CallPutScore from "./CallPutScore";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";
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
const calculateStartTime = (interval) => {
  const currentTime = new Date();
  const intervalInMinutes = parseInt(interval, 10);

  // Calculate the start time by subtracting the selected interval in minutes
  const startTime = new Date(
    currentTime.getTime() - intervalInMinutes * 60 * 1000
  );

  // Format the start time to display in "10:00 AM" format
  const formattedStartTime = startTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return formattedStartTime;
};
function IntradaySignal(props) {
  const { intradaySignalsOptions, setIntradaySignalsOptions } = props;
  const [toggleButton, setToggleButton] = useState(false);
  const [time, setTime] = useState(0);
  const [timeGap, setTimeGap] = useState(calculateStartTime(time));

  const [optionTab, setOptionTab] = useState("optionchainscore");
  const [strikeArray, setStrikeArray] = useState([]);
  const [expiryDates, setExpiryDates] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [indexValue, setIndexValue] = useState();
  const [ivValue, setIvValue] = useState();
  const [futureOI, setFutureOi] = useState([]);
  const currentFutureDate = "23" + getMonth().slice(0, 3).toUpperCase();

  const [expiry, setExpiry] = useState();
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [futureExpiry, setFutureExpiry] = useState();

  // favourites options and functions
  const id = "intradaysignals";
  const { addFavourite, removeFavourite, favourites, selectedFavouriteTab } =
    useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Intraday Signals";
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
  const tabArray = [
    "optionchainscore",
    "premiumdecay",
    "oidirection",
    "callputscore",
  ];
  useEffect(() => {
    if (tabArray.includes(selectedFavouriteTab)) {
      setOptionTab(selectedFavouriteTab);
    }
  }, [selectedFavouriteTab]);
  // ---------------- Function to load options from localStorage--------START--------

  const loadOptionsFromLocalStorage = () => {
    const savedOptions = JSON.parse(
      localStorage.getItem("intradaySignalsOptions")
    );
    if (savedOptions) {
      setIntradaySignalsOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setIntradaySignalsOptions(updatedOptions);
    localStorage.setItem(
      "intradaySignalsOptions",
      JSON.stringify(updatedOptions)
    );
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
      loadOptionsFromLocalStorage();
      // load the star If Already Marked....
      const index = favourites.findIndex((component) => component.id === id);
      if (index !== -1) {
        setFavouritesToggle(true);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  // useEffect(() => {
  //   setComponentLoading(true);
  //   const rtdb = getDatabase(app);
  //   // get list of expiries from realtime database first

  //   const expiryRef = ref(rtdb, "tick/Option");

  //   // Attach a listener to the "expiry" reference to listen for changes in the data
  //   const onExpiryValueChange = onValue(expiryRef, (snapshot) => {
  //     const expiryData = snapshot.val();

  //     // Convert the data to an array if it's an object
  //     var expiryArray = expiryData ? Object.keys(expiryData) : [];
  //     // var NiftDate=
  //     // remove all dates before today from expiryArray
  //     const currentDate = new Date();
  //     const currentDateStartOfDay = new Date(currentDate);
  //     currentDateStartOfDay.setHours(0, 0, 0, 0);

  //     expiryArray = expiryArray.filter((dateString) => {
  //       const [dd, mm, yy] = dateString.split("-").map(Number);
  //       const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
  //       const expiryDate = new Date(fullYear, mm - 1, dd); // Adjust year to 4-digit format

  //       // Include dates on or after the current date (ignoring time)
  //       return expiryDate >= currentDateStartOfDay;
  //     });

  //     setExpiryDates(expiryArray);
  //   });
  //   setComponentLoading(false);

  //   return () => {
  //     // Detach the listener when the component unmounts
  //     off(expiryRef, "value", onExpiryValueChange);
  //   };
  // }, []);
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

    return () => {
      // Detach the listener when the component unmounts
      // off(expiryRef, "value", onExpiryValueChange);
    };
  }, []);

  // expiry date indexwise---------

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
  //   console.log("useEffect runn");
  //   let niftyDate = [];
  //   let bankNiftyDate = [];
  //   for (let i = 0; i < expiryDates.length; i++) {
  //     const dbRef = ref(futureDB, `tick/Option/${expiryDates[i]}`);
  //     onValue(dbRef, (snapshot) => {
  //       const temp = snapshot.val();
  //       if (temp) {
  //         if (temp.BANKNIFTY) {
  //           bankNiftyDate.push(expiryDates[i]);
  //         }
  //         if (temp.NIFTY) {
  //           niftyDate.push(expiryDates[i]);
  //         }
  //       }
  //     });
  //     setIndexWiseExpiry({
  //       ...indexWiseExpiry,
  //       nifty: niftyDate,
  //       banknifty: bankNiftyDate,
  //     });
  //     // setExpiry(niftyDate[0]);
  //   }

  //   niftyDate = [];
  //   bankNiftyDate = [];
  // }, [expiryDates]);

  useEffect(() => {
    const date =
      intradaySignalsOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [intradaySignalsOptions["index"], indexWiseExpiry]);

  console.log(expiry);

  useEffect(() => {
    let unsubscribe;
    const index =
      intradaySignalsOptions["index"] === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        console.log(niftyLTPData);
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          intradaySignalsOptions.numStrikePrice || 5,
          intradaySignalsOptions["index"] === "NIFTY" ? 50 : 100
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
  }, [intradaySignalsOptions["index"], intradaySignalsOptions.numStrikePrice]);

  useEffect(() => {
    setData([]);
    let unsubscribe;
    console.log("runned option portfolio");
    const dbRef =
      intradaySignalsOptions["index"] === "NIFTY" ? "NIFTY" : "BANKNIFTY";

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
          setData({ Calls: callsData, Puts: putsData });
          console.log(`tick/${timeGap}/Option/${expiry}/${dbRef}/Calls`);
        }
      } catch (error) {
        // Handle the error if necessary
        console.error("Error fetching option chain data:", error);
      }
    };
    function fetchOptionLiveData() {
      const index = intradaySignalsOptions["index"];
      console.log(`tick/Option/${expiry}/${index}`);
      const niftyLTPRef = ref(futureDB, `tick/Option/${expiry}/${index}`);

      onValue(niftyLTPRef, (snapshot) => {
        const strikePriceArray = snapshot.val();
        if (strikePriceArray) {
          setData(strikePriceArray);
        }
      });
    }

    if (time > 0) {
      fetchOptionChainHistoricData();
    } else {
      fetchOptionLiveData();
    }
    // const timeToken = setTimeout(fetchData, 1000);

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [intradaySignalsOptions, expiry, time]);

  useEffect(() => {
    let unsubscribe;

    setLoading(true);

    const index = intradaySignalsOptions["index"];
    console.log(`greeks/Option/${expiry}/${index}`);
    const niftyLTPRef = ref(futureDB, `greeks/Option/${expiry}/${index}`);

    let strikePriceArray = [];

    unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      strikePriceArray = snapshot.val();
      setIvValue(strikePriceArray);
    });

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [intradaySignalsOptions, expiry]);
  useEffect(() => {
    let unsubscribe;
    const index =
      intradaySignalsOptions["index"] === "NIFTY"
        ? "NIFTY FUT"
        : "BANKNIFTY FUT";
    let indexName = [];
    const niftyLTPRef = ref(futureDB, `tick/Future/${futureExpiry}/${index}`);
    unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      indexName = snapshot.val();
    });
    setFutureOi(indexName);
    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [intradaySignalsOptions.index, futureExpiry]);
  console.log(data);
  console.log(strikeArray);
  if (data.length === 0) return <>loading...</>;
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
    <>
      <div className="option-intradaysignals">
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
                  name="option-intradaysignals-index"
                  id="option-intradaysignals-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...intradaySignalsOptions,
                      index: e.target.value,
                    });
                  }}
                  value={intradaySignalsOptions.index}
                >
                  <option value="NIFTY">Nifty 50</option>
                  <option value="BANKNIFTY">Nifty Bank</option>
                </select>
                <p>Select Indices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-intradaysignals-lotorvalue"
                  id="option-intradaysignals-lotorvalue"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...intradaySignalsOptions,
                      lotOrValue: e.target.value,
                    });
                  }}
                >
                  <option value="lot">Lot Wise</option>
                  <option value="value">Value Wise</option>
                </select>
                <p>Lot Wise/Value Wise</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-intradaysignals-expiry"
                  id="option-intradaysignals-expiry"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...intradaySignalsOptions,
                      expiry: e.target.value,
                    });
                    setExpiry(e.target.value);
                  }}
                  value={intradaySignalsOptions.expiry}
                >
                  {intradaySignalsOptions.index === "NIFTY" ? (
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
                  name="option-intradaysignals-numstrikeprice"
                  id="option-intradaysignals-numstrikeprice"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...intradaySignalsOptions,
                      numStrikePrice: e.target.value,
                    });
                  }}
                  value={intradaySignalsOptions.numStrikePrice}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                </select>
                <p>Strike Prices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-intradaysignals-time"
                  id="option-intradaysignals-time"
                  className="subpage-dropdown"
                  value={intradaySignalsOptions.time}
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...intradaySignalsOptions,
                      time: e.target.value,
                    });
                    setTime(e.target.value);
                  }}
                >
                  <option value={0}>Live</option>

                  <option value={1}>1 Minute</option>
                  <option value={2}>2 Minutes</option>
                  <option value={3}>3 Minutes</option>
                  <option value={4}>4 Minutes</option>
                  <option value={5}>5 Minutes</option>
                </select>
                <p>Time</p>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      <div>
        <Nav
          id="intraday-nav"
          // className="navIntra"
          value={optionTab}
          onChange={(e, newValue) => {
            setOptionTab(newValue);
          }}
          data-theme={props.theme}
          variant={window.screen.width > 1280 ? "fullWidth" : "scrollable"}
          scrollButtons="auto"
        >
          <Nav.Link
            as={Link}
            onClick={() => {
              setOptionTab("optionchainscore");
            }}
            className={optionTab === "optionchainscore" ? "active" : "inactive"}
          >
            Option Chain Score
          </Nav.Link>
          <Nav.Link
            as={Link}
            onClick={() => {
              setOptionTab("premiumdecay");
            }}
            className={optionTab === "premiumdecay" ? "active" : "inactive"}
          >
            Premium Decay
          </Nav.Link>
          <Nav.Link
            as={Link}
            onClick={() => {
              setOptionTab("oidirection");
            }}
            className={optionTab === "oidirection" ? "active" : "inactive"}
          >
            OI Direction
          </Nav.Link>
          <Nav.Link
            as={Link}
            onClick={() => {
              setOptionTab("callputscore");
            }}
            className={optionTab === "callputscore" ? "active" : "inactive"}
          >
            Call Put Score
          </Nav.Link>
        </Nav>
      </div>
      <div>
        {optionTab === "optionchainscore" && (
          <>
            <IntradayOptionChain
              strikeArray={strikeArray}
              data={data}
              ivValue={ivValue}
              futureOI={futureOI}
              intradaySignalsOptions={intradaySignalsOptions}
              theme={props.theme}
            />
          </>
        )}
        {optionTab === "premiumdecay" && (
          <>
            <PremiumDecay
              strikeArray={strikeArray}
              data={data}
              theme={props.theme}
            />
          </>
        )}
        {optionTab === "oidirection" && (
          <>
            <OiDirection
              strikeArray={strikeArray}
              data={data}
              intradaySignalsOptions={intradaySignalsOptions}
              theme={props.theme}
            />
          </>
        )}
        {optionTab === "callputscore" && (
          <>
            <CallPutScore
              strikeArray={strikeArray}
              data={data}
              intradaySignalsOptions={intradaySignalsOptions}
              theme={props.theme}
            />
          </>
        )}
      </div>
    </>
  );
}

export default IntradaySignal;
