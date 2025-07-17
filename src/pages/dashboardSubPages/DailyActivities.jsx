import React, { useEffect, useState, useId } from "react";
import "./Option.css";
import { ref, onValue } from "firebase/database";
import { getDatabase, off, get } from "firebase/database";
import { app } from "../../firebase";
import { futureDB } from "../../firebase";
import OthersScanner from "./OthersScanner";
import ChartPlotting from "./ChartPlotting";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import StrategyBuilder from "./StrategyBuilder";
import StrategyBuilderModal from "./StrategyBuilderModal";
import { useAuth } from "../../contexts/AuthContext";
import "./Option.css";
import "./DailyActivities.css";
import { db } from "../../firebase";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

import {
  getDoc,
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { useFavourites } from "../../contexts/FavouritesContext";
import DailyJournal from "./DailyJournal";
import MorningBreakfast from "./MorningBreakfast";

export default function DailyActivities(props) {
  const [dailyActivitiesTab, setDailyActivitiesTab] =
    useState("morningbreakfast");
  const [componentLoading, setComponentLoading] = useState(true);
  const [fetchedJournals, setFetchedJournals] = useState(null);
  const [currentJournal, setCurrentJournal] = useState(null);
  const [positiveValue, setPositiveValue] = useState();
  const [negativeValue, setNegativeValue] = useState();

  const [morningBreakfastData, setMorningBreakfastData] = useState({
    sgxnifty: "Yes",
    dowjones: "Yes",
    adrs: "Yes",
    anyprevdaynews: "Yes",
    eventdaycalendar: "Yes",
    fiianddiidata: "Yes",
    trend: "Yes",
    globalmarket: "Yes",
    supportandresistance: "Yes",
  });

  const { currentUser } = useAuth();

  const fetchJournals = async (userId) => {
    // firestore fetch
    const retCollection = [];
    const journalsCollection = collection(
      db,
      "user_journals",
      userId,
      "journals"
    );
    const docsSnap = await getDocs(journalsCollection);
    docsSnap?.forEach((doc) => {
      retCollection.push(doc.data());
    });
    return retCollection;
  };

  const handleCreateJournal = async (userId) => {
    setComponentLoading(true);
    if (!currentUser) {
      setComponentLoading(false);
      return;
    }
    // get an id for the journal
    const docForNextId = doc(db, "user_journals", userId);
    // check if there is a doc for the given user otherwise create one
    let docSnap = await getDoc(docForNextId);
    if (!docSnap.exists()) {
      // create a new doc for the user
      await setDoc(docForNextId, { next_journal_id: 0 });
      // update docsnap
      docSnap = await getDoc(docForNextId);
    }
    // get the next journal id
    const nextJournalId = docSnap.data().next_journal_id;
    console.log(nextJournalId);
    // create a new journal
    const journalDocRef = doc(
      db,
      "user_journals",
      userId,
      "journals",
      nextJournalId.toString()
    );
    const journalData = {
      journal_id: nextJournalId,
      title: "",
      content: "",
      createdOn: new Date(),
      lastModified: new Date(),
    };
    await setDoc(journalDocRef, journalData);
    // update the next journal id
    await setDoc(docForNextId, { next_journal_id: nextJournalId + 1 });

    // refresh the journals list
    const journals = await fetchJournals(currentUser.uid);
    setFetchedJournals(journals);

    // fetch newly created journal before settingcurrent journal
    const journalDoc = doc(
      db,
      "user_journals",
      userId,
      "journals",
      nextJournalId.toString()
    );
    const journalDocSnap = await getDoc(journalDoc);
    const journal = journalDocSnap.data();
    setCurrentJournal(journal);
    setComponentLoading(false);
  };
  const handleDeleteJournal = async (journalId) => {
    setComponentLoading(true);

    setCurrentJournal(null);
    const journalsCollection = collection(
      db,
      "user_journals",
      currentUser.uid,
      "journals"
    );
    const journalDoc = doc(journalsCollection, journalId.toString());
    await deleteDoc(journalDoc);
    const journals = await fetchJournals(currentUser.uid);
    setFetchedJournals(journals);

    setComponentLoading(false);
  };

  const updateJournal = async (userId, journalId, journalData) => {
    setComponentLoading(true);
    const journalDocRef = doc(
      db,
      "user_journals",
      userId,
      "journals",
      journalId.toString()
    );
    await setDoc(journalDocRef, journalData);
    // refresh journal list
    const journals = await fetchJournals(currentUser.uid);
    setFetchedJournals(journals);
    // fetch newly created journal before settingcurrent journal
    const journalDoc = doc(
      db,
      "user_journals",
      userId,
      "journals",
      journalId.toString()
    );
    const journalDocSnap = await getDoc(journalDoc);
    const journal = journalDocSnap.data();
    setCurrentJournal(journal);
    setComponentLoading(false);
  };

  const fetchAndSetMorningBreakfastData = async (userId) => {
    setComponentLoading(true);
    // firestore fetch
    const morningBreakfastDataDoc = doc(db, "user_morningbreakfast", userId);
    // create if not exist with all default true boolean values
    let morningBreakfastDataDocSnap = await getDoc(morningBreakfastDataDoc);
    if (!morningBreakfastDataDocSnap.exists()) {
      await setDoc(morningBreakfastDataDoc, morningBreakfastData);
      morningBreakfastDataDocSnap = await getDoc(morningBreakfastDataDoc);
    } else {
      setMorningBreakfastData(morningBreakfastDataDocSnap.data());
    }
  };
  const handleMorningBreakfastDataChange = async (
    userId,
    morningBreakfastData
  ) => {
    setComponentLoading(true);
    const morningBreakfastDataDoc = doc(db, "user_morningbreakfast", userId);
    await setDoc(morningBreakfastDataDoc, morningBreakfastData);
    setComponentLoading(false);
  };
  useEffect(() => {
    setComponentLoading(true);

    currentUser &&
      fetchJournals(currentUser.uid).then((journals) => {
        setFetchedJournals(journals);
      });

    currentUser && fetchAndSetMorningBreakfastData(currentUser.uid);

    setTimeout(() => {
      setComponentLoading(false);
    }, 1000);
  }, [currentUser]);

  useEffect(() => {
    const temp = morningBreakfastData;
    let yesCount = 0;
    let noCount = 0;
    for (let key in temp) {
      //   console.log(temp[key]);
      if (temp[key] === "Yes") yesCount++;
      if (temp[key] === "No") noCount++;
    }
    setPositiveValue(yesCount);
    setNegativeValue(noCount);
    console.log(`yes count= ${yesCount}/n no count=${noCount} `);
  }, [morningBreakfastData]);
  //   console.log(morningBreakfastData);

  //--------------- code to run the chart plot START-------------
  const [othersTab, setOthersTab] = useState("strategybuilder");
  const [scannerData, setScannerData] = useState([]);
  const [titleList, setTitleList] = useState([]);
  // const [componentLoading, setComponentLoading] = useState(true);
  const [dump, setDump] = useState([]);
  const [dumpTitle, setDumpTitle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [expiryDates, setExpiryDates] = useState([]);
  const [time, setTime] = useState(0);

  const [expiry, setExpiry] = useState("");

  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  const [futureExpiry, setFutureExpiry] = useState();
  console.log(currentUser);
  const [scannerOptions, setScannerOptions] = useState({
    index: "NIFTY",
    optionChain: "Calls",
    option: "Future",
    parameter: "LTP",
    order: "Ascending",
    count: 0,
    date: [],
  });
  const [optionTab, setOptionTab] = useState("Future");
  const [chartPlottingOptions, setChartPlottingOptions] = useState({
    index: "NIFTY",
    strikPrice: 0,
    minutes: 15,
    expiry: 0,
    param: "LTP",
  });
  const [strikeArray, setStrikeArray] = useState([]);
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

  //     const timeZoneOffset = 330; // 5 hours and 30 minutes in minutes
  //     currentDate.setMinutes(currentDate.getMinutes() + timeZoneOffset);

  //     expiryArray = expiryArray.filter((dateString) => {
  //       const [dd, mm, yy] = dateString.split("-").map(Number);
  //       const date = new Date(2000 + yy, mm - 1, dd); // Adjust year to 4-digit format

  //       return date >= currentDate;
  //     });

  //     setExpiryDates(expiryArray);
  //     setScannerOptions({
  //       ...scannerOptions,
  //       date: expiryArray[0],
  //     });
  //     const n = expiryArray.length - 1;
  //     setChartPlottingOptions({
  //       ...chartPlottingOptions,
  //       expiry: expiryArray[n],
  //     });
  //   });
  //   setComponentLoading(false);

  //   return () => {
  //     // Detach the listener when the component unmounts
  //     off(expiryRef, "value", onExpiryValueChange);
  //   };
  // }, []);
  // console.log(expiryDates);

  // FAVORITE CONTEXT
  const { selectedFavouriteTab } = useFavourites();
  useEffect(() => {
    const dailyActivityTabs = [
      "scanner",
      "chartplotting",
      "dailyjournal",
      "morningbreakfast",
      "strategybuilder",
    ];

    if (selectedFavouriteTab) {
      if (dailyActivityTabs.includes(selectedFavouriteTab)) {
        setDailyActivitiesTab(selectedFavouriteTab);
      } else {
        setDailyActivitiesTab("morningbreakfast");
      }
    }
  }, [selectedFavouriteTab]);

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
      scannerOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [scannerOptions.index, indexWiseExpiry]);

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
    } catch (error) {
      console.log(error);
    }
  }, []);

  console.log(`tick/Future/${futureExpiry}`);
  useEffect(() => {
    let unsubscribe;

    if (optionTab === "Future") {
      try {
        setComponentLoading(true);
        const rtdb = getDatabase(app);
        const futureRef = ref(rtdb, `tick/Future/${futureExpiry}`);

        var fetchIndicesData = async () => {
          const niftysnap = await get(futureRef);
          const niftyData = niftysnap.val();

          const title = [];

          for (const key in niftyData) {
            console.log(key);
            title.push(key);
            //   tempArray.push(tempfutureAnalysis[haris]);
          }

          setScannerData(niftyData);
          setTitleList(title);
        };
      } catch (error) {
        console.log("error!!!!!!");
      }

      fetchIndicesData();
    }
    let currentcount = scannerOptions["date"];
    let option = scannerOptions["optionChain"];
    if (optionTab === "Option") {
      let temp = [];
      let name;
      const index = scannerOptions.index;
      let strikeNumber = [];

      const dbRef = ref(futureDB, `tick/Option/${expiry}/${index}`);
      unsubscribe = onValue(dbRef, (snapshot) => {
        name = snapshot.val();

        temp = snapshot.val();
        const tempData = temp?.[option];

        for (let strike in tempData) {
          strikeNumber.push(strike);
        }
        setDump(tempData);
        setDumpTitle(strikeNumber);
        setScannerData(tempData);
        setTitleList(strikeNumber);
      });
    }

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
    // const interval = setInterval(fetchIndicesData, 2000);
  }, [scannerOptions, futureExpiry, expiry, optionTab]);

  useEffect(() => {
    const index =
      chartPlottingOptions["index"] === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        console.log(niftyLTPData);
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          5,
          chartPlottingOptions["index"] === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
        // setChartPlottingOptions({
        //   ...chartPlottingOptions,
        //   strikPrice: strikePriceArray[0],
        // });
      }
    });
    setStrikeArray(strikePriceArray);
  }, [chartPlottingOptions["index"]]);
  console.log(scannerData);
  // console.log(dumpTitle);
  console.log(scannerOptions);

  //--------------Strategy Code here-----------------------

  useEffect(() => {
    const dbRef = ref(futureDB, `/Strategies/${currentUser.uid}`);

    onValue(dbRef, (snapshot) => {
      let temp = [];
      snapshot.forEach((snap) => {
        temp.push(snap.val());
      });
      console.log(temp);

      setData(temp);
    });
  }, []);
  console.log(`/Strategies/${currentUser.uid}`);
  const theme = useTheme();
  // Inside your component
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  //--------------- code to run the chart plot END-------------
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {componentLoading && (
        <div className="loader-overlay">
          <CircularProgress />
        </div>
      )}
      <Tabs
        value={dailyActivitiesTab}
        onChange={(e, newValue) => {
          setDailyActivitiesTab(newValue);
        }}
        // centered
        data-theme={props.theme}
        variant={isSmallScreen ? "scrollable" : "standard"}
        centered
        scrollButtons={isSmallScreen ? "auto" : "true"}
        allowScrollButtonsMobile
        aria-label="simple tabs example"
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
        <Tab
          label="Morning Breakfast"
          className="muiTab"
          id="simple-tab-1"
          value="morningbreakfast"
        />
        <Tab
          label="Daily Journal"
          className="muiTab"
          id="simple-tab-2"
          value="dailyjournal"
        />
        <Tab
          label="Strategy Builder"
          className="muiTab"
          id="simple-tab-3"
          value="strategybuilder"
        />
        <Tab
          label="Chart Plotting"
          className="muiTab"
          id="simple-tab-4"
          value="chartplotting"
        />

        <Tab
          label="Scanner"
          className="muiTab"
          id="simple-tab-5"
          value="scanner"
        />
      </Tabs>
      {dailyActivitiesTab === "dailyjournal" && (
        <DailyJournal
          fetchedJournals={fetchedJournals}
          setCurrentJournal={setCurrentJournal}
          currentJournal={currentJournal}
          updateJournal={updateJournal}
          handleDeleteJournal={handleDeleteJournal}
          handleCreateJournal={handleCreateJournal}
          theme={props.theme}
        />
      )}
      {dailyActivitiesTab === "morningbreakfast" && (
        <MorningBreakfast
          morningBreakfastData={morningBreakfastData}
          setMorningBreakfastData={setMorningBreakfastData}
          handleMorningBreakfastDataChange={handleMorningBreakfastDataChange}
          positiveValue={positiveValue}
          negativeValue={negativeValue}
          theme={props.theme}
        />
      )}
      {dailyActivitiesTab === "scanner" && (
        <OthersScanner
          // scannerData={scannerData}
          // titleList={titleList}
          // setScannerOptions={setScannerOptions}
          // scannerOptions={scannerOptions}
          // expiryDates={expiryDates}
          theme={props.theme}
          // indexWiseExpiry={indexWiseExpiry}
          // setOptionTab={setOptionTab}
          // optionTab={optionTab}
          // setExpiry={setExpiry}
        />
      )}
      {dailyActivitiesTab === "chartplotting" && (
        <>
          <ChartPlotting
            strikeArray={strikeArray}
            setChartPlottingOptions={setChartPlottingOptions}
            chartPlottingOptions={chartPlottingOptions}
            theme={props.theme}
            expiryDataObject={expiryDataObject}
            expiryDates={expiryDates}
          />
        </>
      )}
      {dailyActivitiesTab === "strategybuilder" && (
        <>
          <StrategyBuilderModal
          // strikeArray={strikeArray}
          // expiryDates={expiryDates}
          // theme={props.theme}
          // data={data}
          />
        </>
      )}
    </div>
  );
}
