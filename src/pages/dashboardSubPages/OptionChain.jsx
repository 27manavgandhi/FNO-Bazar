import React, { useEffect, useState } from "react";
import "./Option.css";
import "../../App.css";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { db, futureDB } from "../../firebase";
import { app } from "../../firebase";
import OptionChainBelowTable from "./OptionChainBelowTable";
import OptionChainTable from "./OptionChainTable";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useFavourites } from "../../contexts/FavouritesContext";
import { Box, Modal } from "@mui/material";
import filterIcon from "../../assets/filterIcon.svg";
import FilterSVG from "../../components/FilterSVG";
import StarIcon from "@mui/icons-material/Star";
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

function OptionChain(props) {
  const { theme } = props;
  // favourites options and functions
  const id = "optionchain";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Option Chain";
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

  const [optionChainOptions, setOptionChainOptions] = useState({
    index: "NIFTY",
    lotOrValue: "value",
    numStrikePrice: 5,
    expiry: "", // Initialize expiry state
    time: 0, // Initialize time state
    // strikePrices: [],
    // count: 0,
  });
  const [optionChainData, setOptionChainData] = useState({
    Calls: [],
    Puts: [],
  });
  // MODAL OPEN CLOSE
  const [toggleButton, setToggleButton] = useState(false);
  const [viData, setViData] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [expiryDates, setExpiryDates] = useState([]);
  const [time, setTime] = useState(0);
  const [timeGap, setTimeGap] = useState(calculateStartTime(time));
  const [expiry, setExpiry] = useState("");
  const [strikeArray, setStrikeArray] = useState([]);
  const [expiryDataObject, setExpiryDataObject] = useState([]);

  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
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
    //call above function
    dateFetchOption();
    // set loading false
    setComponentLoading(false);
    // Function to load options from localStorage
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
  // ---------------- Function to load options from localStorage--------START--------

  const loadOptionsFromLocalStorage = () => {
    const savedOptions = JSON.parse(localStorage.getItem("optionChainOptions"));
    if (savedOptions) {
      setOptionChainOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setOptionChainOptions(updatedOptions);
    localStorage.setItem("optionChainOptions", JSON.stringify(updatedOptions));
  };
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE-- END-----
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
      optionChainOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [optionChainOptions.index, indexWiseExpiry]);

  useEffect(() => {
    const dbRef =
      optionChainOptions["index"] === "NIFTY" ? "NIFTY" : "BANKNIFTY";

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
        onValue(optionChainCallRef, (snapshot) => {
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
  }, [expiry, optionChainOptions, time, indexWiseExpiry]);

  useEffect(() => {
    let unsubscribe;
    console.log(optionChainOptions["numStrikePrice"]);
    const index =
      optionChainOptions["index"] === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          optionChainOptions["numStrikePrice"] || 5,
          optionChainOptions["index"] === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
      }
      setStrikeArray(strikePriceArray);
    });

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [optionChainOptions["index"], optionChainOptions["numStrikePrice"]]);

  useEffect(() => {
    let unsubscribe;
    let tempData = {};
    let downData = [];
    const index =
      optionChainOptions["index"] === "NIFTY" ? "NIFTY" : "BANKNIFTY";
    // const expiry = optionChainOptions["expiry"];
    console.log(`/greeks/Option/${expiry}/${optionChainOptions["index"]}`);
    const dbRef = ref(futureDB, `/greeks/Option/${expiry}/${index}`);
    unsubscribe = onValue(dbRef, (snapshot) => {
      // snapshot.forEach((snapshot) => {
      //   tempData.push(snapshot.val());
      //   downData.push(snapshot.val());
      // });
      if (snapshot.val()) {
        tempData = snapshot.val();

        setViData(tempData);
      }
    });

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [expiry, optionChainOptions, indexWiseExpiry]);
  console.log(strikeArray);
  if (strikeArray.length === 0) return <>loading...</>;

  // STYLE FOR MODAL
  const style = {
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
      <Modal
        open={toggleButton}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className="option-optionchain subpage">
            <div
              className="subpage-dropdowns-container"
              data-theme={props.theme}
            >
              <div className="dropdown-container">
                <select
                  name="option-optionchain-index"
                  id="option-optionchain-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...optionChainOptions,
                      index: e.target.value,
                    });
                  }}
                  value={optionChainOptions.index}
                >
                  <option value="NIFTY">Nifty 50</option>
                  <option value="BANKNIFTY">Nifty Bank</option>
                </select>
                <p>Select Indices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-optionchain-lotorvalue"
                  id="option-optionchain-lotorvalue"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...optionChainOptions,
                      lotOrValue: e.target.value,
                    });
                  }}
                  value={optionChainOptions.lotOrValue}
                >
                  <option value="lot">Lot Wise</option>
                  <option value="value">Value Wise</option>
                </select>
                <p>Lot Wise/Value Wise</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-optionchain-expiry"
                  id="option-optionchain-expiry"
                  className="subpage-dropdown"
                  value={optionChainOptions.expiry}
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...optionChainOptions,
                      expiry: e.target.value,
                    });
                    setExpiry(e.target.value);
                  }}
                >
                  {optionChainOptions.index === "NIFTY" ? (
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
                          <option
                            key={index}
                            value={expiryDate}
                            defaultValue={index === 0 ? expiryDate : ""}
                          >
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
                  name="option-optionchain-numstrikeprice"
                  id="option-optionchain-numstrikeprice"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...optionChainOptions,
                      numStrikePrice: e.target.value,
                    });
                  }}
                  value={optionChainOptions.numStrikePrice}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                </select>
                <p>Strike Prices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-optionchain-time"
                  id="option-optionchain-time"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...optionChainOptions,
                      time: e.target.value,
                    });
                    setTime(e.target.value);
                  }}
                  value={optionChainOptions.time}
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
          </div>
        </Box>
      </Modal>
      <div className="table-info-icons">
        <div
          onClick={handleOpen}
          style={{
            cursor: "pointer",
            backgroundColor:
              theme === "dark"
                ? "rgba(38, 40, 47, 0.6)"
                : "rgba(224, 224, 228, 1)",
            borderRadius: "10px",
            padding: "0.5rem",
          }}
        >
          {" "}
          {/* <TuneIcon /> */}
          <FilterSVG theme={theme} />
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
      <OptionChainTable
        optionChainData={optionChainData}
        optionChainOptions={optionChainOptions}
        strikeArray={strikeArray}
        viData={viData}
        handleToggleFavourite={handleToggleFavourite}
        theme={theme}
      />

      <OptionChainBelowTable
        optionChainData={optionChainData}
        optionChainOptions={optionChainOptions}
        strikeArray={strikeArray}
        theme={theme}
      />
    </div>
  );
}

export default OptionChain;
