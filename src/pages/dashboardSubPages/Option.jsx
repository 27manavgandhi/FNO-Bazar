import React, { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { CircularProgress } from "@mui/material";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { db, futureDB } from "../../firebase";
import { app } from "../../firebase";
import {
  roundToNearest50,
  buildStrikePricesArray,
  roundToNearest100,
} from "../../utils/MathAndArrayCreators";
import "../../App.css";
import "./Option.css";
import OptionChain from "./OptionChain";
import OptionChainBelowTable from "./OptionChainBelowTable";
import StraddleAndStrangle from "./StraddleAndStrangle";
import MostActiveOption from "./MostActiveOption";
import BuyingSellinPressure from "./BuyingSellinPressure";
import HighestOi from "./HighestOi";
import StrikePricewiseData from "./StrikePricewiseData";
import OiChanger from "./OiChanger";
import IntradayOutlook from "./IntradayOutlook";
import IntradaySignal from "./IntradaySignal";
import MarketLook from "./MarketLook";
import OrderFlowAnalysis from "./OrderFlowAnalysis";
import OptionAnalysis from "./OptionAnalysis";
import { useFavourites } from "../../contexts/FavouritesContext";
import OiTracker from "./OiTracker";
const timeMultiplierMap = {
  0: 1,
  0.5: 30,
  1: 60,
  2: 120,
  3: 180,
  4: 240,
  5: 300,
  6: 360,
  7: 420,
  8: 480,
  9: 540,
  10: 600,
  15: 900,
};

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
function generateTimestampArray() {
  const startMorningTimestamp = new Date();
  startMorningTimestamp.setHours(9, 15, 0, 0); // Set the morning start time to 9:15 AM

  const endMorningTimestamp = new Date();
  endMorningTimestamp.setHours(15, 30, 0, 0); // Set the morning end time to 3:30 PM

  const currentTimestamp = new Date(); // Get the current timestamp

  const timestamps = [];
  let currentLoopTimestamp = new Date(
    Math.max(currentTimestamp, startMorningTimestamp)
  );

  while (currentLoopTimestamp <= endMorningTimestamp) {
    timestamps.push(
      currentLoopTimestamp.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
    currentLoopTimestamp.setMinutes(currentLoopTimestamp.getMinutes() + 3);
  }

  return timestamps;
}

export default function Option(props) {
  const [nifty50LTP, setNifty50LTP] = useState();
  const [niftyBankLTP, setNiftyBankLTP] = useState();
  const [loading, setLoading] = useState(false);
  const [optionChainOptions, setOptionChainOptions] = useState({
    index: "nifty50",
    lotOrValue: "lot",
    expiry: 0,
    numStrikePrice: 5,
    time: 0,
    strikePrices: [],
    count: 0,
  });
  const [oiChangerOptions, setOiChangerOptions] = useState({
    index: "NIFTY",
    value: 100000,
    callorput: "Calls",
    expiry: 0,
  });
  const [straddleAndStrangleOptions, setStraddleAndStrangleOptions] = useState({
    index: "nifty50",
    time: "0",
    option: "Straddle",
  });
  const [orderFlowAnalysisOptions, setOrderFlowAnalysisOptions] = useState({
    index: "nifty50",
    numStrikePrice: 5,
    expiry: 0,
    time: 0,
    lotOrValue: "lot",
  });
  const [strikePriceWiseDataOptions, setStrikePriceWiseDataOptions] = useState({
    index: "NIFTY",
    lotOrValue: "lot",
    numStrikePrice: 5,
    parameter: "LTP",
    time: 0.5,
    expiry: 0,
  });
  // OI TRACKER OPTIONS
  const [oiTrackerOptions, setOiTrackerOptions] = useState({
    index: "NIFTY",
    lotOrValue: "lot",
    numStrikePrice: 5,
    // parameter: "LTP",
    time: 0,
    expiry: 0,
  });
  const [highestOiOptions, setHighestOiOptions] = useState({
    index: "nifty50",
  });
  const [intradaySignalsOptions, setIntradaySignalsOptions] = useState({
    index: "NIFTY",
    lotOrValue: "lot",
    expiry: 0,
    numStrikePrice: 5,
    time: 0,
  });
  const [marketLookOptions, setMarketLookOptions] = useState({
    call: {
      index: "nifty50",
      time: "0",
    },
    put: {
      index: "nifty50",
      time: "0",
    },
  });
  const [intradayOutlookOptions, setIntradayOutlookOptions] = useState({
    call: {
      index: "nifty50",
      time: "0",
    },
    put: {
      index: "nifty50",
      time: "0",
    },
  });
  const [optionAnalysisOptions, setOptionAnalysisOptions] = useState({
    index: "nifty50",
    lotOrValue: "lot",
    expiry: 0,
    numStrikePrice: 5,
    time: 0,
  });
  const [mostActiveOptionsOptions, setMostActiveOptionsOptions] = useState({
    index: "nifty50",
    expiry: "0",
    parameter: "OI",
  });
  const [buyingSellingPressureOptions, setBuyingSellingPressureOptions] =
    useState({
      index: "NIFTY",
      time: 0.5,
      numStrikePrice: 5,
      option: "call",
    });

  const [optionTab, setOptionTab] = useState("optionchain");
  const [componentLoading, setComponentLoading] = useState(true);
  const [expiryDates, setExpiryDates] = useState([]);

  const [optionChainData, setOptionChainData] = useState({
    Calls: [],
    Puts: [],
  });
  const [oiChangerData, setOiChangerData] = useState({
    oneminute: {
      nifty50: {
        strikePrices: [],
        calls: [],
        puts: [],
      },
      banknifty: {
        strikePrices: [],
        calls: [],
        puts: [],
      },
    },
    fiveminute: {
      nifty50: {
        strikePrices: [],
        calls: [],
        puts: [],
      },
      banknifty: {
        strikePrices: [],
        calls: [],
        puts: [],
      },
    },
  });
  const [firstVisitOptionTime, setFirstVisitOptionTime] = useState(new Date());
  const [dateState, setDateState] = useState(false);
  const [time, setTime] = useState(0);
  const [timeGap, setTimeGap] = useState(calculateStartTime(time));
  const [expiry, setExpiry] = useState("");
  const [strikeArray, setStrikeArray] = useState([]);
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  // FAVORITE CONTEXT
  const { selectedFavouriteTab } = useFavourites();

  useEffect(() => {
    const tabArray = [
      "optionchainscore",
      "premiumdecay",
      "oidirection",
      "callputscore",
    ];
    const optionChainTab = [
      "optionchain",
      "oitracker",
      "oichanger",
      "straddleandstrangle",
      "orderflowanalysis",
      "strikepricewisedata",
      "highestoi",
      "intradaysignals",
      "marketlook",
      "intradayoutlook",
      "optionanalysis",
      "mostactiveoptions",
      "buyingsellingpressure",
    ];
    if (tabArray.includes(selectedFavouriteTab)) {
      setOptionTab("intradaysignals");
    } else if (optionChainTab.includes(selectedFavouriteTab)) {
      setOptionTab(selectedFavouriteTab);
    } else {
      setOptionTab("optionchain");
    }
  }, [selectedFavouriteTab]);

  console.log(generateTimestampArray());
  // useEffect(() => {
  //   setComponentLoading(true);
  //   const rtdb = getDatabase(app);
  //   // get list of expiries from realtime database first

  //   const expiryRef = ref(rtdb, "tick/Option");

  //   // Attach a listener to the "expiry" reference to listen for changes in the data
  //   const dateFetchOption = async () => {
  //     const callsSnapshot = await get(expiryRef);
  //     const expiryData = callsSnapshot.val();
  //     setExpiryDataObject(expiryData);
  //     var expiryArray = expiryData ? Object.keys(expiryData) : [];
  //     // var NiftDate=
  //     // remove all dates before today from expiryArray
  //     const currentDate = new Date();

  //     // Set the time to the beginning of the day for both dates
  //     const currentDateStartOfDay = new Date(currentDate);
  //     currentDateStartOfDay.setHours(0, 0, 0, 0);

  //     expiryArray = expiryArray.filter((dateString) => {
  //       const [dd, mm, yy] = dateString.split("-").map(Number);
  //       const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
  //       const expiryDate = new Date(fullYear, mm - 1, dd); // Adjust year to 4-digit format

  //       // Include dates on or after the current date (ignoring time)
  //       return expiryDate >= currentDateStartOfDay;
  //     });
  //     // let bankNiftyDate = [];
  //     // let niftyDate = [];
  //     // expiryArray.map((expiry) => {
  //     //   if (expiry) {
  //     //     if (expiryData[expiry].BANKNIFTY) {
  //     //       bankNiftyDate.push(expiry);
  //     //     }
  //     //     if (expiryData[expiry].NIFTY) {
  //     //       niftyDate.push(expiry);
  //     //     }
  //     //   }
  //     // });

  //     // setIndexWiseExpiry({
  //     //   ...indexWiseExpiry,
  //     //   nifty: niftyDate,
  //     //   banknifty: bankNiftyDate,
  //     // });

  //     // const date =
  //     //   optionChainOptions.index === "NIFTY"
  //     //     ? indexWiseExpiry.nifty[0]
  //     //     : indexWiseExpiry.banknifty[0];
  //     // setExpiry(date);

  //     setExpiryDates(expiryArray);
  //   };
  //   dateFetchOption();
  //   // const onExpiryValueChange = onValue(expiryRef, (snapshot) => {
  //   //   const expiryData = snapshot.val();

  //   //   // Convert the data to an array if it's an object
  //   //   var expiryArray = expiryData ? Object.keys(expiryData) : [];
  //   //   // var NiftDate=
  //   //   // remove all dates before today from expiryArray
  //   //   const currentDate = new Date();

  //   //   // Set the time to the beginning of the day for both dates
  //   //   const currentDateStartOfDay = new Date(currentDate);
  //   //   currentDateStartOfDay.setHours(0, 0, 0, 0);

  //   //   expiryArray = expiryArray.filter((dateString) => {
  //   //     const [dd, mm, yy] = dateString.split("-").map(Number);
  //   //     const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
  //   //     const expiryDate = new Date(fullYear, mm - 1, dd); // Adjust year to 4-digit format

  //   //     // Include dates on or after the current date (ignoring time)
  //   //     return expiryDate >= currentDateStartOfDay;
  //   //   });

  //   //   setExpiryDates(expiryArray);

  //   //   setOptionChainOptions({
  //   //     ...optionChainOptions,
  //   //     expiry: expiryArray[0],
  //   //   });
  //   // });
  //   setComponentLoading(false);

  //   return () => {
  //     // Detach the listener when the component unmounts
  //     // off(expiryRef, "value", onExpiryValueChange);
  //   };
  // }, []);

  // useEffect(() => {
  //   const dbRef =
  //     optionChainOptions["index"] === "NIFTY" ? "NIFTY" : "BANKNIFTY";

  //   const rtdb = getDatabase(app);

  //   const optionTimeChainCallRef = ref(
  //     rtdb,
  //     `recent data/${timeGap}/Option/${expiry}/${dbRef}/Calls`
  //   );
  //   const optionTimeChainPutRef = ref(
  //     rtdb,
  //     `recent data/${timeGap}/Option/${expiry}/${dbRef}/Puts`
  //   );
  //   const fetchOptionChainHistoricData = async () => {
  //     try {
  //       const callsSnapshot = await get(optionTimeChainCallRef);
  //       const putsSnapshot = await get(optionTimeChainPutRef);

  //       const callsData = callsSnapshot.val();
  //       const putsData = putsSnapshot.val();

  //       if (callsData && putsData) {
  //         setOptionChainData({ calls: callsData, puts: putsData });
  //         console.log(`tick/${timeGap}/Option/${expiry}/${dbRef}/Calls`);
  //       }
  //     } catch (error) {
  //       // Handle the error if necessary
  //       console.error("Error fetching option chain data:", error);
  //     }
  //   };

  //   const fetchOptionChainData = async () => {
  //     try {
  //       const optionChainCallRef = ref(
  //         futureDB,
  //         `tick/Option/${expiry}/${dbRef}`
  //       );
  //       console.log(`tick/Option/${expiry}/${dbRef}`);
  //       onValue(optionChainCallRef, (snapshot) => {
  //         const callsSnapshot = snapshot.val();
  //         // const callsData = callsSnapshot.Calls;
  //         // const putsData = callsSnapshot.Puts;
  //         if (callsSnapshot) {
  //           const callsData = callsSnapshot.Calls;
  //           const putsData = callsSnapshot.Puts;
  //           setOptionChainData(callsSnapshot);
  //         }
  //       });
  //     } catch (error) {
  //       // Handle the error if necessary
  //       console.error("Error fetching option chain data:", error);
  //     }
  //   };

  //   if (time > 0) {
  //     fetchOptionChainHistoricData();
  //     console.log(`${time} time data run here`);
  //   } else {
  //     fetchOptionChainData();
  //     console.log("live data runn here---------");
  //   }
  // }, [expiry, optionChainOptions, time, indexWiseExpiry]);

  // console.log(expiry);
  // console.log(optionChainData);
  // //------Live Option Code here---------------
  // console.log(optionChainData);
  return (
    <div style={{ position: "relative" }}>
      <Tabs
        value={optionTab}
        onChange={(e, newValue) => {
          setOptionTab(newValue);
        }}
        data-theme={props.theme}
        variant="scrollable"
        scrollButtons={true}
        allowScrollButtonsMobile
        aria-label="simple tabs example"
        centered
        sx={{
          "& .MuiTabScrollButton-root": {
            color: "#3f62d7",
          },
        }}
        TabIndicatorProps={{
          style: {
            backgroundColor: "#3f62d7",
          },
        }}
      >
        {/* 1st tab  */}
        <Tab
          label="Option Chain"
          className="muiTab"
          id="simple-tab-7"
          value="optionchain"
        />
        {/* 2nd tab OI TRACKER */}
        <Tab
          label="OI Tracker"
          className="muiTab"
          id="simple-tab-13"
          value="oitracker"
        />

        {/* HIGHEST OI 3rd tab */}
        <Tab
          label="Highest OI"
          className="muiTab"
          id="simple-tab-5"
          value="highestoi"
        />
        {/* 4thd tab */}
        <Tab
          label="Straddles and Strangles"
          className="muiTab"
          id="simple-tab-2"
          value="straddleandstrangle"
        />
        {/* 5th Tab */}
        <Tab
          label="Strike Price Wise Data"
          className="muiTab"
          id="simple-tab-4"
          value="strikepricewisedata"
        />
        {/* 6th Tab */}
        <Tab
          label="OI Changer"
          className="muiTab"
          id="simple-tab-1"
          value="oichanger"
        />
        {/* 7th Tab */}
        <Tab
          label="Intraday Signals"
          className="muiTab"
          id="simple-tab-6"
          value="intradaysignals"
        />
        {/* 8th Tab */}
        <Tab
          label="Option Analysis"
          className="muiTab"
          id="simple-tab-10"
          value="optionanalysis"
        />
        {/* 9th Tab */}
        <Tab
          label="Most Active Options"
          className="muiTab"
          id="simple-tab-11"
          value="mostactiveoptions"
        />
        {/* 10th Tab */}
        <Tab
          label="Buying Selling Pressure"
          className="muiTab"
          id="simple-tab-12"
          value="buyingsellingpressure"
        />
        {/* 11th Tab */}
        {/* <Tab
          label="Order Flow Analysis"
          className="muiTab"
          id="simple-tab-3"
          value="orderflowanalysis"
        /> */}

        <Tab
          label="Market Outlook"
          className="muiTab"
          id="simple-tab-8"
          value="marketlook"
        />
        <Tab
          label="Intraday Outlook"
          className="muiTab"
          id="simple-tab-9"
          value="intradayoutlook"
        />
      </Tabs>

      <div
        className="option-subpage any-subpage"
        sx={{
          color: props.theme === "dark" ? "white" : "black",

          backgroundColor: props.theme === "dark" ? "white" : "blue",
        }}
        data-theme={props.theme}
      >
        {/* OPTION CHAIN */}
        {optionTab === "optionchain" && (
          <>
            <OptionChain
              optionChainOptions={optionChainOptions}
              setOptionChainOptions={setOptionChainOptions}
              optionChainData={optionChainData}
              expiryDates={expiryDates}
              theme={props.theme}
              indexWiseExpiry={indexWiseExpiry}
              setExpiry={setExpiry}
              strikeArray={strikeArray}
              setTime={setTime}
            />
          </>
          // <OptionChainBelowTable
          //   optionChainData={optionChainData}
          //   optionChainOptions={optionChainOptions}
          // />
        )}
        {optionTab === "oichanger" && (
          <OiChanger
            theme={props.theme}
            oiChangerOptions={oiChangerOptions}
            setOiChangerOptions={setOiChangerOptions}
            oiChangerData={oiChangerData}
            expiryDates={expiryDates}
            strikeArray={strikeArray}
          />
        )}
        {/* OI TRACKER */}
        {optionTab === "oitracker" && (
          <OiTracker
            theme={props.theme}
            oiTrackerOptions={oiTrackerOptions}
            setOiTrackerOptions={setOiTrackerOptions}
          />
        )}
        {/* STRADDLE AND STRANGLE */}
        {optionTab === "straddleandstrangle" && (
          <>
            <StraddleAndStrangle
              straddleAndStrangleOptions={straddleAndStrangleOptions}
              optionChainData={optionChainData}
              optionChainOptions={optionChainOptions}
              componentLoading={componentLoading}
              setStraddleAndStrangleOptions={setStraddleAndStrangleOptions}
              theme={props.theme}
            />
          </>
        )}
        {/* ORDER FLOW ANALYSIS */}
        {optionTab === "orderflowanalysis" && (
          <>
            <OrderFlowAnalysis theme={props.theme} />
          </>
        )}
        {/* STRIKE PRICE WISE DATA */}
        {optionTab === "strikepricewisedata" && (
          <StrikePricewiseData
            setStrikePriceWiseDataOptions={setStrikePriceWiseDataOptions}
            strikePriceWiseDataOptions={strikePriceWiseDataOptions}
            optionChainOptions={optionChainOptions}
            optionChainData={optionChainData}
            theme={props.theme}
          />
        )}
        {/* HIGHEST OI */}
        {optionTab === "highestoi" && (
          <>
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

            <HighestOi
              setHighestOiOptions={setHighestOiOptions}
              highestOiOptions={highestOiOptions}
              expiryDates={expiryDates}
              theme={props.theme}
            />
          </>
        )}
        {/* INTRADAY SIGNALS */}
        {optionTab === "intradaysignals" && (
          <>
            <IntradaySignal
              intradaySignalsOptions={intradaySignalsOptions}
              setIntradaySignalsOptions={setIntradaySignalsOptions}
              expiryDates={expiryDates}
              theme={props.theme}
            />
          </>
        )}

        {/* MARKET LOOK */}
        {optionTab === "marketlook" && (
          <>
            <MarketLook theme={props.theme} />
          </>
        )}
        {/* INTRADAY OUTLOOK */}
        {optionTab === "intradayoutlook" && (
          <>
            <IntradayOutlook
              setHighestOiOptions={setHighestOiOptions}
              highestOiOptions={highestOiOptions}
              expiryDates={expiryDates}
              theme={props.theme}
            />
          </>
        )}
        {/* OPTION ANALYSIS */}
        {optionTab === "optionanalysis" && (
          <>
            <OptionAnalysis
              optionChainOptions={optionChainOptions}
              setOptionChainOptions={setOptionChainOptions}
              expiryDates={expiryDates}
              optionChainData={optionChainData}
              theme={props.theme}
            />
          </>
        )}
        {/* MOST ACTIVE-C OPTIONS */}
        {optionTab === "mostactiveoptions" && (
          <>
            <MostActiveOption
              optionChainData={optionChainData}
              optionChainOptions={optionChainOptions}
              mostActiveOptionsOptions={mostActiveOptionsOptions}
              setMostActiveOptionsOptions={setMostActiveOptionsOptions}
              setOptionChainOptions={setOptionChainOptions}
              indexWiseExpiry={indexWiseExpiry}
              strikeArray={strikeArray}
              setExpiry={setExpiry}
              theme={props.theme}
            />
          </>
        )}
        {/* BUYING SELLING PRESSURE */}
        {optionTab === "buyingsellingpressure" && (
          <>
            <BuyingSellinPressure
              setBuyingSellingPressureOptions={setBuyingSellingPressureOptions}
              buyingSellingPressureOptions={buyingSellingPressureOptions}
              optionChainData={optionChainData}
              optionChainOptions={optionChainOptions}
              theme={props.theme}
            />
          </>
        )}
        {/* ALL TABS DIV CLOSE */}
      </div>
    </div>
  );
}

// const OIChanger = (props) => {};
