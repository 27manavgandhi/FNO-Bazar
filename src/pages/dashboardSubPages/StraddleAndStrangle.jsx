import React, { useEffect, useState } from "react";
import "../../App.css";
import { db, futureDB, app } from "../../firebase";
import {
  onValue,
  ref,
  off,
  getDatabase,
  get,
  set,
  remove,
} from "firebase/database";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import TuneIcon from "@mui/icons-material/Tune";
import style from "./StraddleAndStrangle.module.css";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useFavourites } from "../../contexts/FavouritesContext";
import { Box, Button, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";
import { useAuth } from "../../contexts/AuthContext";

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

function StraddleAndStrangle(props) {
  const { optionChainData, optionChainOptions } = props;

  const [toggleButton, setToggleButton] = useState(false);
  const [time, setTime] = useState(0);
  const [timeGap, setTimeGap] = useState(calculateStartTime(time));
  const [lockStrikePrice, setLockStrikePrice] = useState([]);
  const [lockedData, setLockedData] = useState([]);
  const [lockAll, setLockAll] = useState(false);

  const [lockAddition, setLockAddition] = useState([]);

  //option state--------------------
  const [snsOptions, setSnsOptions] = useState({
    index: "NIFTY",
    numStrikePrice: "5",
    time: "0.5",
    expiry: "0",
    option: "Straddle",
  });
  const [strikePriceData, setStrikePriceData] = useState();
  const [strikeArray, setStrikeArray] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [expiry, setExpiry] = useState();
  const [expiryDates, setExpiryDates] = useState([]);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  // favourites options and functions
  const id = "straddleandstrangle";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Straddle And Strangle";
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
  // ------------CURRENT USER INFO ----------------
  const { currentUser } = useAuth();
  const loadOptionsFromLocalStorage = () => {
    const savedOptions = JSON.parse(localStorage.getItem("snsOptions"));
    if (savedOptions) {
      setSnsOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setSnsOptions(updatedOptions);
    localStorage.setItem("snsOptions", JSON.stringify(updatedOptions));
    // console.log(lockedData.length, +snsOptions.numStrikePrice * 2 + 1);
    // work on this
    // if (lockedData.length === +snsOptions.numStrikePrice * 2 + 1) {
    //   console.log("all data loaded");
    //   setLockAll(true);
    // } else {
    //   setLockAll(false);
    //   console.log("all data NOTTTTTTT loaded");
    // }
  };
  const fetchLockedData = async () => {
    try {
      const rtdb = getDatabase();
      const dbRef = ref(rtdb, `StraddleStrangle/${currentUser.uid}`);
      // this will only call it once so we use onValue
      // const snapshot = await get(dbRef);
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          setLockedData(Object.values(snapshot.val()));
          setLockStrikePrice(Object.keys(snapshot.val()).map((key) => +key));
        } else {
          setLockedData([]);
          setLockStrikePrice([]);
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      if (lockedData.length === +snsOptions.numStrikePrice * 2 + 1) {
        console.log("all data loaded");
        setLockAll(true);
      }
    }
  };
  useEffect(() => {
    setComponentLoading(true);
    const rtdb = getDatabase(app);
    // get list of expiries from realtime database first

    const expiryRef = ref(rtdb, "tick/Option");

    // Attach a listener to the "expiry" reference to listen for changes in the data
    const onExpiryValueChange = onValue(expiryRef, (snapshot) => {
      const expiryData = snapshot.val();

      // Convert the data to an array if it's an object
      var expiryArray = expiryData ? Object.keys(expiryData) : [];
      // var NiftDate=
      // remove all dates before today from expiryArray
      const currentDate = new Date();
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
      // setPortfolioOptions({
      //   ...portfolioOptions,
      //   date: expiryArray[0],
      // });
    });
    setComponentLoading(false);
    // call local storage function
    loadOptionsFromLocalStorage();
    // call the data from firebase
    fetchLockedData();
    // is all data loaded
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
    return () => {
      // Detach the listener when the component unmounts
      off(expiryRef, "value", onExpiryValueChange);
    };
  }, []);

  useEffect(() => {
    // console.log("useEffect runn");
    let niftyDate = [];
    let bankNiftyDate = [];
    let unsubscribe = [];
    for (let i = 0; i < expiryDates.length; i++) {
      const dbRef = ref(futureDB, `tick/Option/${expiryDates[i]}`);
      unsubscribe.push(
        onValue(dbRef, (snapshot) => {
          const temp = snapshot.val();
          if (temp) {
            if (temp.BANKNIFTY) {
              bankNiftyDate.push(expiryDates[i]);
            }
            if (temp.NIFTY) {
              niftyDate.push(expiryDates[i]);
            }
          }
          setIndexWiseExpiry({
            ...indexWiseExpiry,
            nifty: niftyDate,
            banknifty: bankNiftyDate,
          });
        })
      );
      // setExpiry(niftyDate[0]);
    }

    niftyDate = [];
    bankNiftyDate = [];

    // const id = setTimeout(() => {
    //   setLoading(true);
    // }, 1000);

    return () => {
      unsubscribe.forEach((u) => u());
    };
  }, [expiryDates]);

  useEffect(() => {
    const date =
      snsOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [snsOptions.index, indexWiseExpiry]);
  // console.log(expiry, indexWiseExpiry);

  useEffect(() => {
    // setLoading(false);
    let unsubscribe;
    // console.log("runned option portfolio");
    const dbRef = snsOptions["index"] === "NIFTY" ? "NIFTY" : "BANKNIFTY";

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
          // console.log(`tick/${timeGap}/Option/${expiry}/${dbRef}/Calls`);
        }
      } catch (error) {
        // Handle the error if necessary
        console.error("Error fetching option chain data:", error);
      }
    };

    function fetchOptionLiveData() {
      let currentcount = expiry;
      let currentindex = snsOptions["index"];
      // console.log(`tick/Option/${currentcount}/${currentindex}`);
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

        // console.log(temp);
        // setTitleList(strikeNumber);
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
  }, [snsOptions, indexWiseExpiry, expiry, time]);

  useEffect(() => {
    let unsubscribe;
    // console.log(snsOptions["numStrikePrice"]);
    const index = snsOptions["index"] === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          snsOptions["numStrikePrice"] || 5,
          snsOptions["index"] === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
        // setportfolioOptions({
        //   ...portfolioOptions,
        //   strikPrice: strikePriceArray[0],
        // });
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
  }, [snsOptions]);

  // console.log(strikePriceData);
  const lockUnlockHandler = async (
    strikePrice,
    call,
    put,
    addition,
    average,
    expiry,
    option
  ) => {
    const temp = {
      callLTP: String(call),
      putLTP: String(put),
      addition,
      average,
      strikePrice: String(strikePrice),
      expiry,
      type: option,
    };

    try {
      const rtdb = getDatabase(app);
      const dbRef = ref(
        rtdb,
        `StraddleStrangle/${currentUser.uid}/${strikePrice}`
      );

      if (lockStrikePrice.indexOf(strikePrice) > -1) {
        // Remove from lockedData
        const data1 = lockedData.filter(
          (data) => data.strikePrice != strikePrice
        );
        setLockedData(data1);

        // Remove from lockStrikePrice
        const updatedLockStrikePrice = lockStrikePrice.filter(
          (sp) => sp != strikePrice
        );
        setLockStrikePrice(updatedLockStrikePrice);

        // Remove from database
        await remove(dbRef);
        console.log("DATA REMOVED");
      } else {
        // Add to lockStrikePrice
        setLockStrikePrice((pre) => [...pre, strikePrice]);

        // Add to lockedData
        setLockedData((pre) => [...pre, temp]);

        // Add to database
        await set(dbRef, temp);
        console.log("DATA SAVED");
      }
    } catch (err) {
      console.log("error", err);
    } finally {
      if (lockedData.length === +snsOptions.numStrikePrice * 2 + 1) {
        console.log("all data loaded");
        setLockAll(true);
      }
    }
  };

  if (!strikePriceData) return <>loading</>;
  console.log(lockStrikePrice);
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

  const lockAllStrikePrice = async () => {
    console.log("lock all");
    setLockAll((pre) => !pre);
    strikeArray.forEach(async (strikePrice) => {
      const addition = (
        ((strikePriceData?.Puts?.[strikePrice]?.["LTP"] +
          strikePriceData?.Calls?.[strikePrice]?.["LTP"]) *
          100) /
        100
      ).toFixed(2);

      const call = strikePriceData.Calls[strikePrice]?.["LTP"];
      const put = strikePriceData.Puts[strikePrice]?.["LTP"];
      const average = (
        (((strikePriceData.Calls[strikePrice]?.["LTP"] +
          strikePriceData.Puts[strikePrice]?.["LTP"]) /
          2) *
          100) /
        100
      ).toFixed(2);
      const temp = {
        callLTP: String(call),
        putLTP: String(put),
        addition,
        average,
        strikePrice: String(strikePrice),
        expiry,
        type: snsOptions.option,
      };

      try {
        const rtdb = getDatabase(app);
        const dbRef = ref(
          rtdb,
          `StraddleStrangle/${currentUser.uid}/${strikePrice}`
        );

        if (lockAll) {
          // If all strike prices are locked, unlock this strike price
          await remove(dbRef);
          console.log(`Data for strike price ${strikePrice} removed`);
          setLockStrikePrice((prevLockStrikePrice) =>
            prevLockStrikePrice.filter((sp) => sp != strikePrice)
          );
          setLockedData((prevLockedData) =>
            prevLockedData.filter((data) => data.strikePrice != strikePrice)
          );
        } else {
          // If not all strike prices are locked, lock this strike price
          await set(dbRef, temp);
          console.log(`Data for strike price ${strikePrice} saved`);
          if (!lockStrikePrice.includes(strikePrice)) {
            setLockStrikePrice((pre) => [...pre, strikePrice]);
            console.log("strike price added");
          }
          if (!lockedData.some((item) => item.strikePrice == temp.strikePrice))
            setLockedData((pre) => [...pre, temp]);
          console.log("locked Data ADDED price added");
        }
      } catch (err) {
        console.log("error", err);
      }
    });
  };
  return (
    <>
      <div className="option-straddleandstrangle">
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
          {/*  DONOT CHANGE TO SNS OPTIONS WILL BREAK THE CODE  */}
          <Button
            style={{ width: "max-content" }}
            onClick={() =>
              updateOptionChainOptions({
                ...snsOptions,
                option:
                  snsOptions.option === "Straddle" ? "Strangle" : "Straddle",
              })
            }
            variant="outlined"
          >
            {snsOptions.option}
          </Button>
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
            <div className="option-optionchain subpage  ">
              <div className=" subpage-dropdowns-container">
                <div className="dropdown-container">
                  <select
                    name="option-straddleandstrangle-index"
                    id="option-straddleandstrangle-index"
                    className="subpage-dropdown"
                    onChange={(e) => {
                      updateOptionChainOptions({
                        ...snsOptions,
                        index: e.target.value,
                      });
                    }}
                    value={snsOptions.index}
                  >
                    <option value="NIFTY">Nifty 50</option>
                    <option value="BANKNIFTY">Nifty Bank</option>
                  </select>
                  <p>Select Indices</p>
                </div>
                <div className="dropdown-container">
                  <button
                    onClick={lockAllStrikePrice}
                    style={{
                      backgroundColor:
                        props.theme === "dark"
                          ? "rgba(38, 40, 47, 0.6)"
                          : "rgba(224, 224, 228, 1)",
                      borderRadius: "1.25rem",
                      padding: "1rem 2rem 1rem 1rem",
                      color: props.theme === "dark" ? "white" : "black",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: "1.15rem",
                    }}
                  >
                    {lockAll ? "Unlock" : "Lock"} All Strike Price
                  </button>
                  <p>Toggle All Strike Price</p>
                </div>
                <div className="dropdown-container">
                  <select
                    name="option-optionchain-expiry"
                    id="option-optionchain-expiry"
                    className="subpage-dropdown"
                    onChange={(e) => {
                      updateOptionChainOptions({
                        ...snsOptions,
                        expiry: e.target.value,
                      });
                      setExpiry(e.target.value);
                    }}
                    value={snsOptions.expiry}
                  >
                    {snsOptions.index === "NIFTY" ? (
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
                    name="option-optionchain-numstrikeprice"
                    id="option-optionchain-numstrikeprice"
                    className="subpage-dropdown"
                    onChange={(e) => {
                      updateOptionChainOptions({
                        ...snsOptions,
                        numStrikePrice: e.target.value,
                      });
                    }}
                    value={snsOptions.numStrikePrice}
                  >
                    <option value={"3"}>3</option>
                    <option value={"5"}>5</option>
                    <option value={"7"}>7</option>
                  </select>
                  <p>Strike Prices</p>
                </div>
                <div className="dropdown-container">
                  <select
                    name="option-straddleandstrangle-time"
                    id="option-straddleandstrangle-time"
                    className="subpage-dropdown"
                    onChange={(e) => {
                      updateOptionChainOptions({
                        ...snsOptions,
                        time: e.target.value,
                      });
                      setTime(e.target.value);
                    }}
                    value={snsOptions.time}
                  >
                    <option value={"0"}>Live</option>
                    <option value={"1"}>1 Minute</option>
                    <option value={"2"}>2 Minutes</option>
                    <option value={"3"}>3 Minutes</option>
                    <option value={"4"}>4 Minutes</option>
                    <option value={"5"}>5 Minutes</option>
                  </select>
                  <p>Time</p>
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      <div className={style.container}>
        <div className={style.tablewrapper}>
          <table className={style.tableContainer} data-theme={props.theme}>
            <thead>
              <tr>
                {/* call columns */}
                <th
                  className={`${style.strike_prices} textbold`}
                  data-theme={props.theme}
                >
                  Strike Price
                </th>
                <th style={{ color: "green" }}>LTP-Call</th>{" "}
                <th style={{ color: "red" }}>LTP-Put</th> <th>Addition</th>{" "}
                <th>Average</th>{" "}
                <th>
                  Lock<br></br>Unlock
                </th>{" "}
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {strikeArray.map((strikePrice, index) => {
                const addition = (
                  ((strikePriceData?.Puts?.[strikePrice]?.["LTP"] +
                    strikePriceData?.Calls?.[strikePrice]?.["LTP"]) *
                    100) /
                  100
                ).toFixed(2);

                const call = strikePriceData.Calls[strikePrice]?.["LTP"];
                const put = strikePriceData.Puts[strikePrice]?.["LTP"];
                const average = (
                  (((strikePriceData.Calls[strikePrice]?.["LTP"] +
                    strikePriceData.Puts[strikePrice]?.["LTP"]) /
                    2) *
                    100) /
                  100
                ).toFixed(2);
                const lockAddition = lockedData.filter(
                  (data) => data.strikePrice === strikePrice
                );

                return (
                  <React.Fragment key={index}>
                    {strikePriceData.Calls[strikePrice] &&
                    strikePriceData.Puts[strikePrice] ? (
                      <tr>
                        <td
                          className={style.strike_prices}
                          data-theme={props.theme}
                        >
                          <b
                            style={
                              index === strikeArray.length / 2 - 0.5
                                ? {
                                    color: "rgb(30,64,186)",
                                    backgroundColor:
                                      props.theme === "dark"
                                        ? "#27293b"
                                        : "#D0D2DE",
                                    padding: "4px",
                                  }
                                : {}
                            }
                          >
                            {strikePrice}
                          </b>
                        </td>
                        <td style={{ color: "green" }}>
                          {strikePriceData.Calls[strikePrice]?.["LTP"]}
                        </td>
                        <td style={{ color: "red" }}>
                          {strikePriceData.Puts[strikePrice]?.["LTP"]}
                        </td>
                        <td>
                          {(
                            ((strikePriceData.Puts[strikePrice]?.["LTP"] +
                              strikePriceData.Calls[strikePrice]?.["LTP"]) *
                              100) /
                            100
                          ).toFixed(2)}
                        </td>
                        <td>
                          {(
                            (((strikePriceData.Calls[strikePrice]?.["LTP"] +
                              strikePriceData.Puts[strikePrice]?.["LTP"]) /
                              2) *
                              100) /
                            100
                          ).toFixed(2)}
                        </td>
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            lockUnlockHandler(
                              strikePrice,
                              call,
                              put,
                              addition,
                              average,
                              expiry,
                              snsOptions.option
                            )
                          }
                        >
                          {lockStrikePrice.indexOf(strikePrice) > -1
                            ? "Unlock"
                            : "Lock"}
                        </td>
                        <td>
                          {lockAddition.length > 0 ? (
                            <span
                              style={{
                                color: `${
                                  addition - lockAddition[0].addition < 0
                                    ? "red"
                                    : "green"
                                }`,
                              }}
                            >
                              {(addition - lockAddition[0].addition).toFixed(2)}
                            </span>
                          ) : (
                            <>0</>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr></tr>
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <br />
        {lockedData?.length > 0 && (
          <div className={style.tablewrapper}>
            <span className="textbold" data-theme={props.theme}>
              {" "}
              Locked Strike Prices
            </span>
            <table className={style.tableContainer} data-theme={props.theme}>
              <thead>
                <tr>
                  {/* call columns */}
                  <th className={style.strike_prices} data-theme={props.theme}>
                    Strike Price
                  </th>
                  <th style={{ color: "green" }}>LTP-Call</th>{" "}
                  <th style={{ color: "red" }}>LTP-Put</th>
                  <th>Live Call</th> <th>Live Put</th>
                  <th>Addition</th> <th>Average</th>
                  <th>Live Add</th> <th>Live Avg</th>
                  <th>Expiry</th>
                  <th>Type</th>{" "}
                </tr>
              </thead>
              <tbody>
                {lockedData.map((strikePrice, index) => {
                  const addition = (
                    ((strikePriceData?.Puts?.[strikePrice.strikePrice]?.[
                      "LTP"
                    ] +
                      strikePriceData?.Calls?.[strikePrice.strikePrice]?.[
                        "LTP"
                      ]) *
                      100) /
                    100
                  ).toFixed(2);

                  const call =
                    strikePriceData?.Calls[strikePrice.strikePrice]?.["LTP"];
                  const put =
                    strikePriceData?.Puts[strikePrice.strikePrice]?.["LTP"];
                  const average = (
                    (((strikePriceData?.Calls[strikePrice.strikePrice]?.[
                      "LTP"
                    ] +
                      strikePriceData?.Puts[strikePrice.strikePrice]?.["LTP"]) /
                      2) *
                      100) /
                    100
                  ).toFixed(2);

                  return (
                    <tr key={strikePrice}>
                      <td
                        className={style.strike_prices}
                        data-theme={props.theme}
                      >
                        <b
                          style={
                            index === strikeArray.length / 2 - 0.5
                              ? {
                                  color: "rgb(30,64,186)",
                                  backgroundColor:
                                    props.theme === "dark"
                                      ? "#27293b"
                                      : "#D0D2DE",
                                  padding: "4px",
                                }
                              : {}
                          }
                        >
                          {strikePrice.strikePrice}
                        </b>
                      </td>
                      <td style={{ color: "green" }}>{strikePrice.callLTP}</td>
                      <td style={{ color: "red" }}>{strikePrice.putLTP}</td>
                      <td>{call}</td>
                      <td>{put}</td>
                      <td>{strikePrice.addition}</td>
                      <td>{strikePrice.average}</td>
                      <td>{addition}</td>
                      <td>{average}</td>
                      <td>{strikePrice.expiry}</td>
                      <td>{strikePrice.type}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default StraddleAndStrangle;
