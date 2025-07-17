import React, { useEffect, useState } from "react";
import StrikePricewiseTable from "./StrikePricewiseTable";

import { db, futureDB, app } from "../../firebase";
import { onValue, ref, off, getDatabase, get } from "firebase/database";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";
import StarIcon from "@mui/icons-material/Star";
import { useFavourites } from "../../contexts/FavouritesContext";
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

function StrikePricewiseData(props) {
  const {
    setStrikePriceWiseDataOptions,
    strikePriceWiseDataOptions,
    optionChainData,
    optionChainOptions,
  } = props;
  const [toggleButton, setToggleButton] = useState(false);
  const [time, setTime] = useState(0);
  const [timeGap, setTimeGap] = useState(calculateStartTime(time));

  const [strikeData, setStrikeData] = useState([]);
  const [firstVisitTime, setFirstVisitTime] = useState(new Date());
  const [dateState, setDateState] = useState(false);
  const [viData, setViData] = useState([]);

  const [strikePriceData, setStrikePriceData] = useState();
  //option state--------------------
  const [strikeArray, setStrikeArray] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expiry, setExpiry] = useState();
  const [expiryDates, setExpiryDates] = useState([]);
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  // favourites options and functions
  const id = "strikepricewisedata";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Strike Price Wise Data";
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
    let unsubscribe;
    let tempData = {};
    // let downData = [];
    const index =
      strikePriceWiseDataOptions.index === "NIFTY" ? "NIFTY" : "BANKNIFTY";
    // const expiry = optionChainOptions["expiry"];
    console.log(`/greeks/Option/${expiry}/${strikePriceWiseDataOptions.index}`);
    const dbRef = ref(futureDB, `/greeks/Option/${expiry}/${index}`);
    unsubscribe = onValue(dbRef, (snapshot) => {
      // snapshot.forEach((snapshot) => {
      //   tempData.push(snapshot.val());
      //   downData.push(snapshot.val());
      // });
      tempData = snapshot.val();

      setStrikeData(tempData);
    });
    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [expiry, strikePriceWiseDataOptions, indexWiseExpiry]);
  console.log(strikeData);
  useEffect(() => {
    console.log("local,storage first time");
    // Save the user's first visit time in a state variable
    const savedTime = localStorage.getItem("firstVisitTime");
    const savedData = localStorage.getItem("firstVisitData");
    const firstVisitData = strikeData;
    if (savedData) {
      setViData(strikeData);
    } else {
      localStorage.setItem("firstVisitData", firstVisitData);
    }
    if (savedTime) {
      setFirstVisitTime(new Date(savedTime));
    } else {
      localStorage.setItem("firstVisitTime", new Date());
    }
  }, [dateState, time]);
  useEffect(() => {
    const optionTime = time * 60;

    const interval = setInterval(() => {
      const currentTime = new Date();
      const timeDifference = (currentTime - firstVisitTime) / 1000; // Calculate the time difference in seconds

      if (timeDifference <= 0) {
        console.log(
          "Function is running because the time difference is >= 30 seconds."
        );
        // console.log(viData);
        console.log("Option has expired.");
        clearInterval(interval); // Clear the interval since it's no longer needed
        setDateState(!dateState);
      } else if (timeDifference >= optionTime) {
        console.log(
          "Function is running because the time difference is >= 30 seconds."
        );
        // console.log(viData);
        setDateState(!dateState);
      }
    }, 1000); // Run the function every second

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, [firstVisitTime]);

  //------------- Option Data code---------------
  // ---------------- Function to load options from localStorage--------START--------

  const loadOptionsFromLocalStorage = () => {
    const savedOptions = JSON.parse(
      localStorage.getItem("strikePricewiseDataOptions")
    );
    if (savedOptions) {
      setStrikePriceWiseDataOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setStrikePriceWiseDataOptions(updatedOptions);
    localStorage.setItem(
      "strikePricewiseDataOptions",
      JSON.stringify(updatedOptions)
    );
  };
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----END---
  useEffect(() => {
    setComponentLoading(true);
    const rtdb = getDatabase(app);
    // get list of expiries from realtime database first

    const expiryRef = ref(rtdb, "tick/Option");

    // Attach a listener to the "expiry" reference to listen for changes in the data
    const dateFetchOption = async () => {
      try {
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
      } catch (error) {
        console.log(error);
      } finally {
        setComponentLoading(false);
      }
    };
    dateFetchOption();

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
    // setLoading(false);

    let unsubscribe;
    console.log("runned option portfolio");
    const dbRef =
      strikePriceWiseDataOptions["index"] === "NIFTY" ? "NIFTY" : "BANKNIFTY";
    // removing the use Effect From upper one
    const date =
      strikePriceWiseDataOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
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
          setStrikePriceData({ Calls: callsData, Puts: putsData });
          console.log(`tick/${timeGap}/Option/${expiry}/${dbRef}/Calls`);
        }
      } catch (error) {
        // Handle the error if necessary
        console.error("Error fetching option chain data:", error);
      }
    };

    function fetchData() {
      let currentcount = expiry;
      let currentindex = strikePriceWiseDataOptions.index;
      console.log(`tick/Option/${currentcount}/${currentindex}`);
      let index = "";
      let temp = [];
      const dbRef = ref(
        futureDB,
        `tick/Option/${currentcount}/${currentindex}`
      );
      unsubscribe = onValue(dbRef, (snapshot) => {
        // let option = portfolioOptions["optionChain"];

        temp = snapshot.val();
        setStrikePriceData(temp);

        console.log(temp);
        // setTitleList(strikeNumber);
      });
    }

    if (time > 0) {
      fetchOptionChainHistoricData();
    } else {
      fetchData();
    }
    // const timeToken = setTimeout(fetchData, 1000);

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [strikePriceWiseDataOptions, indexWiseExpiry, expiry, time]);

  useEffect(() => {
    let unsubscribe;
    // console.log(strikePriceWiseDataOptions["numStrikePrice"]);
    const index =
      strikePriceWiseDataOptions.index === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          strikePriceWiseDataOptions.numStrikePrice || 5,
          strikePriceWiseDataOptions.index === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
        // setportfolioOptions({
        //   ...portfolioOptions,
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
  }, [strikePriceWiseDataOptions]);
  console.log(strikeArray);
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
      <div className="option-strikepricewisedata">
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
                  name="option-strikepricewisedata-index"
                  id="option-strikepricewisedata-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...strikePriceWiseDataOptions,
                      index: e.target.value,
                    });
                  }}
                  value={strikePriceWiseDataOptions.index}
                >
                  <option value="NIFTY">Nifty 50</option>
                  <option value="BANKNIFTY">Nifty Bank</option>
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
                      ...strikePriceWiseDataOptions,
                      expiry: e.target.value,
                    });
                    setExpiry(e.target.value);
                  }}
                  value={strikePriceWiseDataOptions.expiry}
                >
                  {strikePriceWiseDataOptions.index === "NIFTY" ? (
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
                <p>Select Expiry</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-strikepricewisedata-lotorvalue"
                  id="option-strikepricewisedata-lotorvalue"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...strikePriceWiseDataOptions,
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
                  name="option-strikepricewisedata-expiry"
                  id="option-strikepricewisedata-expiry"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...strikePriceWiseDataOptions,
                      parameter: e.target.value,
                    });
                  }}
                >
                  <option value="LTP">LTP</option>
                  <option value="OI">OI</option>
                  <option value="Volume">Volume</option>
                </select>
                <p>Parameter</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-strikepricewisedata-numstrikeprice"
                  id="option-strikepricewisedata-numstrikeprice"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...strikePriceWiseDataOptions,
                      numStrikePrice: e.target.value,
                    });
                  }}
                  value={strikePriceWiseDataOptions.numStrikePrice}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                </select>
                <p>Strike Prices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-strikepricewisedata-time"
                  id="option-strikepricewisedata-time"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...strikePriceWiseDataOptions,
                      time: e.target.value,
                    });
                    setTime(e.target.value);
                  }}
                  value={strikePriceWiseDataOptions.time}
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
      <StrikePricewiseTable
        strikeArray={strikeArray}
        strikePriceData={strikePriceData}
        strikeData={strikeData}
        viData={viData}
        strikePriceWiseDataOptions={strikePriceWiseDataOptions}
        theme={props.theme}
      />
    </>
  );
}

export default StrikePricewiseData;
