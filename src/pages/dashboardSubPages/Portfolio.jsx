import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { getDatabase, off, get } from "firebase/database";
import { app } from "../../firebase";
import { futureDB } from "../../firebase";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import StockDetails from "./StockDetails";
import PortfolioOption from "./PortfolioOption";
import PortfolioStock from "./PortfolioStock";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import PortfolioFuture from "./PortfolioFuture";
import HoldingAndPosition from "./HoldingAndPosition";
import PortfolioHolding from "./PortfolioHolding";
import PortfolioPosition from "./PortfolioPosition";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useMediaQuery, useTheme } from "@mui/material";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useAuth } from "../../contexts/AuthContext";
import { set } from "firebase/database";
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

function Portfolio(props) {
  // const { searchString, strikePrice, stockData, searchHandler } = props;
  const [stockData, setStockData] = useState([]);
  const [strikePrice, setStrikePrice] = useState([]);
  const [searchString, setSearchString] = useState("");
  // favourites options and functions
  const id = "portfolio";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Portfolio";
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
    let downData = [];
    let strikePriceArray = [];
    const dbRef = ref(futureDB, `/tick/Stocks`);
    unsubscribe = onValue(dbRef, (snapshot) => {
      // snapshot.forEach((snapshot) => {
      //   tempData.push(snapshot.val());
      //   downData.push(snapshot.val());
      // });
      let tempData = snapshot.val();

      for (let key in tempData) {
        strikePriceArray.push(key);
      }
      setStrikePrice(strikePriceArray);
      setStockData(tempData);
    });
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
    getDataFromFirebase();
    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
    //StockData in the dependency array will trigger the STOCK PRICE WHEN CLICK THE ADD PORTFOLIO
  }, []);
  const getDataFromFirebase = async () => {
    try {
      const rtdb = getDatabase();
      const dbRef = ref(rtdb, `Portfolio/${currentUser.uid}/`);
      // this will only call it once so we use onValue
      // const snapshot = await get(dbRef);
      onValue(dbRef, (snapshot) => {
        try {
          const portfolioData = snapshot.val();
          let positionData = {};
          let holdingData = {};

          for (const key in portfolioData) {
            if (portfolioData.hasOwnProperty(key)) {
              const item = portfolioData[key];
              if (item.type === "Option") {
                positionData[key] = item;
              } else if (item.type === "Equity") {
                holdingData[key] = item;
              }
            }
          }
          console.log("Position Data (Options):");
          console.log(positionData);
          console.log("\nHolding Data (Equities):");
          console.log(holdingData);
          setPositionData(positionData);
          setHoldingData(holdingData);
        } catch (error) {
          console.error("Error processing portfolio data:", error);
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      // if (lockedData.length === +snsOptions.numStrikePrice * 2 + 1) {
      //   console.log("all data loaded");
      //   setLockAll(true);
      // }
    }
  };
  const searchHandler = (e) => {
    setSearchString(e.target.value);
  };
  const [optionSearchString, setOptionSearchString] = useState("");

  const [portfolioTab, setPortfolioTab] = useState("stock");
  const [portfolioData, setPortfolioData] = useState([]);
  const [strikeArray, setStrikeArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);
  const [expiryDates, setExpiryDates] = useState([]);
  const [indices, setIndices] = useState();
  const [futureData, setFutureData] = useState();
  const [futureTitle, setFutureTitle] = useState();
  const [totalReturn, setTotalReturn] = useState(() => {
    const totalReturn = window.localStorage.getItem("totalReturn");
    return totalReturn ? JSON.parse(totalReturn) : 0;
  });
  const [totalInvestment, setTotalInvestment] = useState(() => {
    const totalInvestment = window.localStorage.getItem("totalInvestment");
    return totalInvestment ? JSON.parse(totalInvestment) : 0;
  });
  const [totalHolding, setTotalHolding] = useState(() => {
    const totalHolding = window.localStorage.getItem("totalHolding");
    return totalHolding ? JSON.parse(totalHolding) : 0;
  });

  const [totalPositionReturn, setTotalPositionReturn] = useState(() => {
    const totalPositionReturn = window.localStorage.getItem(
      "totalPositionReturn"
    );
    return totalPositionReturn ? JSON.parse(totalPositionReturn) : 0;
  });
  const [totalPositionInvestment, setTotalPositionInvestment] = useState(0);
  const [totalPositionHolding, setTotalPositionHolding] = useState(() => {
    const totalPositionHolding = window.localStorage.getItem(
      "totalPositionHolding"
    );
    return totalPositionHolding ? JSON.parse(totalPositionHolding) : 0;
  });

  const [holdingTitle, setHoldingTitle] = useState(() => {
    const holdingTitle = window.localStorage.getItem("holdingTitle");
    return holdingTitle ? JSON.parse(holdingTitle) : [];
  });
  const [futureExpiry, setFutureExpiry] = useState();
  const [positionTitle, setPositionTitle] = useState(() => {
    const positionTitle = window.localStorage.getItem("positionTitle");
    return positionTitle ? JSON.parse(positionTitle) : [];
  });
  const [expiry, setExpiry] = useState();
  const [positionData, setPositionData] = useState(() => {
    const positionItem = window.localStorage.getItem("positionData");
    return positionItem ? JSON.parse(positionItem) : {};
  });
  const [holdingData, setHoldingData] = useState(() => {
    const holdingItem = window.localStorage.getItem("holdingData");
    return holdingItem ? JSON.parse(holdingItem) : {};
  });
  const [portfolioOptions, setPortfolioOptions] = useState({
    index: "NIFTY",

    count: 0,
    date: 0,
  });

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const optionSearchHandler = (e) => {
    setOptionSearchString(e.target.value);
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

      const timeZoneOffset = 330; // 5 hours and 30 minutes in minutes
      currentDate.setMinutes(currentDate.getMinutes() + timeZoneOffset);

      expiryArray = expiryArray.filter((dateString) => {
        const [dd, mm, yy] = dateString.split("-").map(Number);
        const date = new Date(2000 + yy, mm - 1, dd); // Adjust year to 4-digit format

        return date >= currentDate;
      });

      setExpiryDates(expiryArray);
      // setPortfolioOptions({
      //   ...portfolioOptions,
      //   date: expiryArray[0],
      // });
    });
    setComponentLoading(false);

    return () => {
      // Detach the listener when the component unmounts
      off(expiryRef, "value", onExpiryValueChange);
    };
  }, []);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  useEffect(() => {
    console.log("useEffect runn");
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
              console.log(expiryDates[i]);
            }
            if (temp.NIFTY) {
              niftyDate.push(expiryDates[i]);
              console.log(expiryDates[i]);
            }
          }
          console.log(niftyDate, bankNiftyDate);
        })
      );
      setIndexWiseExpiry({
        ...indexWiseExpiry,
        nifty: niftyDate,
        banknifty: bankNiftyDate,
      });
      // setExpiry(niftyDate[0]);
    }

    niftyDate = [];
    bankNiftyDate = [];
    console.log("reapeat");
    const id = setTimeout(() => {
      setLoading(true);
    }, 1000);

    return () => {
      clearTimeout(id);
      unsubscribe.forEach((u) => u());
    };
  }, [loading]);

  useEffect(() => {
    const date =
      portfolioOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [portfolioOptions, indexWiseExpiry]);
  // console.log(expiry, indexWiseExpiry);

  useEffect(() => {
    // setLoading(false);
    console.log("runned option portfolio");
    function fetchData() {
      let currentcount = expiry;
      let currentindex = portfolioOptions["index"];
      console.log(`tick/Option/${currentcount}/${currentindex}`);
      let index = "";
      let temp = [];
      const dbRef = ref(
        futureDB,
        `tick/Option/${currentcount}/${currentindex}`
      );
      onValue(dbRef, (snapshot) => {
        // let option = portfolioOptions["optionChain"];
        console.log(snapshot.val());
        temp = snapshot.val();
        setPortfolioData(temp);
        setIndices(index);

        console.log(temp);
        // setTitleList(strikeNumber);
      });
    }
    fetchData();
    // const timeToken = setTimeout(fetchData, 1000);

    // return () => {
    //   clearTimeout(timeToken);
    // };
  }, [portfolioOptions, indexWiseExpiry, expiry]);

  useEffect(() => {
    const index =
      portfolioOptions.index === "NIFTY" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          5,
          portfolioOptions["index"] === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
        // setportfolioOptions({
        //   ...portfolioOptions,
        //   strikPrice: strikePriceArray[0],
        // });
      }
    });
    setStrikeArray(strikePriceArray);
  }, [portfolioOptions.index]);
  // console.log(strikeArray);
  //Future DATA expiry UseEffect---------------
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

  //-----------Future DATA UseEffect---------------
  useEffect(() => {
    const rtdb = getDatabase(app);
    const futureRef = ref(rtdb, `tick/Future/${futureExpiry}`);
    try {
      var fetchIndicesData = async () => {
        const niftysnap = await get(futureRef);
        const niftyData = niftysnap.val();

        const title = [];

        for (const key in niftyData) {
          title.push(key);
          //   tempArray.push(tempfutureAnalysis[haris]);
        }

        setFutureData(niftyData);
        setFutureTitle(title);
      };
    } catch (error) {
      console.log("error!!!!!!");
    }

    fetchIndicesData();
  }, [futureExpiry]);

  const onSubmitHandle = (strike, price, value, date) => {
    console.log(stockData[strike], price, value, strike, date);
    const investment = price * value;
    let postioninvestment;
    let positionQuantity;
    let avgPrice;
    //  buyPrice: '5.0',
    //   expiry: 'none',
    //   investedAmount: '1178445.0',
    //   lot: '0',
    //   purchaseDate: '26-3-2024',
    //   quantity: '235689',
    //   symbol: 'AUBANK',
    //   symbolID: '100000144',
    //   type: 'Equity'
    if (holdingData[strike]) {
      postioninvestment = holdingData[strike].investment + investment;
      positionQuantity = holdingData[strike].quantity + value;
      avgPrice = postioninvestment / positionQuantity;
    } else {
      postioninvestment = investment;
      positionQuantity = value;
      avgPrice = postioninvestment / positionQuantity;
    }
    console.log(postioninvestment, positionQuantity, avgPrice);
    const data = {
      // 1. Quantity
      quantity: String(positionQuantity),
      // 2. type = equity as its stocks
      type: "Equity",
      // 3. expiry has to be none as its stocks
      expiry: "none",
      // 4. no lots in stocks only quantity
      lot: "0",
      // 5,6 set SYMBOL AND ID FOR THE STOCK
      symbol: String(stockData[strike].Symbol),
      symbolID: String(stockData[strike].Symbol_ID),
      // 7. Invested Amount
      investedAmount: String(postioninvestment),
      // 8. Purchase Date
      purchaseDate: String(date),
      // 9. buyPrice
      buyPrice: String(avgPrice),
    };
    // SET IT IN THE HOLDING DATA
    setHoldingData({
      ...holdingData,
      [strike]: data,
    });
    // SAVE DATA TO FIREBASE
    saveToFirebase(stockData[strike].Symbol_ID, data);

    const currrentValue = stockData[strike].LTP * value;
    const holdingValue = totalHolding + currrentValue;
    const investreturn = currrentValue - investment;
    const temp = holdingTitle;
    const tinvestment = totalInvestment + investment;
    console.log(currrentValue, investment, investreturn);
    if (temp.indexOf(strike) === -1) {
      temp.push(strike);
    }

    setHoldingTitle(temp);
    setTotalHolding(holdingValue);
    setTotalReturn(investreturn);
    setTotalInvestment(tinvestment);

    window.localStorage.setItem("holdingTitle", JSON.stringify(holdingTitle));
    window.localStorage.setItem("totalHolding", JSON.stringify(holdingValue));
    window.localStorage.setItem("totalReturn", JSON.stringify(investreturn));
    window.localStorage.setItem("totalInvestment", JSON.stringify(tinvestment));
  };
  // useEffect(() => {
  //   const item = window.localStorage.setItem(
  //     "holdingData",
  //     JSON.stringify(holdingData)
  //   );
  //   window.localStorage.setItem("holdingTitle", JSON.stringify(holdingTitle));
  //   window.localStorage.setItem("totalHolding", JSON.stringify(totalHolding));
  //   window.localStorage.setItem("totalReturn", JSON.stringify(totalReturn));
  //   window.localStorage.setItem(
  //     "totalInvestment",
  //     JSON.stringify(totalInvestment)
  //   );
  // }, [holdingData]);

  // console.log(JSON.parse(localStorage.getItem("holdingData")));

  //------------------stock Sell Handle-----------------

  const onSubmitStockSellHandle = (symbol, price, value, date) => {
    if (!holdingData[symbol]) return;
    let positionQuantity;
    positionQuantity = holdingData[symbol].quantity - value;
    if (positionQuantity < 0)
      return alert("You dont have enough stock to sell");

    console.log(symbol, price, value);
    console.log(futureData[symbol]);
    const currrentValue = stockData[symbol]?.LTP * value;
    const investment = price * value;

    const investreturn = currrentValue - investment;
    const temp = holdingTitle;

    const returnInvest = totalPositionReturn - investreturn;

    setTotalHolding(totalPositionHolding - currrentValue);
    setTotalReturn(returnInvest);
    setTotalInvestment(totalInvestment + investment);
    let postioninvestment;

    let avgPrice;
    if (holdingData[symbol]) {
      postioninvestment = holdingData[symbol].investment - investment;

      avgPrice = postioninvestment / positionQuantity;
    }
    //  else {
    //   postioninvestment = investment;
    //   positionQuantity = value;
    //   avgPrice = postioninvestment / positionQuantity;
    // }
    const data = {
      // 1. Quantity
      quantity: String(positionQuantity),
      // 2. type = equity as its stocks
      type: "Option",
      // 3. expiry has to be none as its stocks
      expiry: "none",
      // 4. no lots in stocks only quantity
      lot: "0",
      // 5,6 set SYMBOL AND ID FOR THE STOCK
      symbol: String(stockData[symbol].Symbol),
      symbolID: String(stockData[symbol].Symbol_ID),
      // 7. Invested Amount
      investedAmount: String(postioninvestment),
      // 8. Purchase Date
      purchaseDate: String(date),
      // 9. buyPrice
      buyPrice: String(avgPrice),
    };
    setHoldingData({
      ...holdingData,
      [symbol]: data,
    });
    if (positionQuantity == 0) {
      delete holdingData[symbol];
      temp.splice(temp.indexOf(symbol), 1);
    }
    setHoldingTitle(temp);
    window.localStorage.setItem(
      "holdingData",
      JSON.stringify({ ...holdingData })
    );
    window.localStorage.setItem("totalHolding", JSON.stringify(totalHolding));
    window.localStorage.setItem("totalReturn", JSON.stringify(totalReturn));
    window.localStorage.setItem(
      "totalInvestment",
      JSON.stringify(totalInvestment)
    );
    window.localStorage.setItem("holdingTitle", JSON.stringify(holdingTitle));
  };
  //-------------option Buy Handle---------------------------

  const onSubmitOptionHandle = (strike, price, value, date) => {
    console.log("option clicked", stockData);
    const currrentValue = portfolioData.Calls[strike]?.LTP * value;
    const investment = price * value;

    const investreturn = currrentValue - investment;
    const temp = positionTitle;
    if (temp.indexOf(strike) === -1) {
      temp.push(strike);
    }
    setPositionTitle(temp);
    setTotalPositionHolding(currrentValue);
    setTotalPositionReturn(investreturn);
    setTotalPositionInvestment(totalInvestment + investment);
    let postioninvestment;
    let positionQuantity;
    let avgPrice;
    if (positionData[strike]) {
      postioninvestment = positionData[strike].investment + investment;
      positionQuantity = positionData[strike].quantity + value;
      avgPrice = postioninvestment / positionQuantity;
    } else {
      postioninvestment = investment;
      positionQuantity = value;
      avgPrice = postioninvestment / positionQuantity;
    }
    const data = {
      // 1. Quantity
      quantity: String(positionQuantity),
      // 2. type = equity as its stocks
      type: "Option",
      // 3. expiry has to be none as its stocks
      expiry: "none",
      // 4. no lots in stocks only quantity
      lot: "0",
      // 5,6 set SYMBOL AND ID FOR THE STOCK
      symbol: String(portfolioData.Calls[strike]?.Symbol),
      symbolID: String(portfolioData.Calls[strike]?.Symbol_ID),
      // 7. Invested Amount
      investedAmount: String(postioninvestment),
      // 8. Purchase Date
      purchaseDate: String(date),
      // 9. buyPrice
      buyPrice: String(avgPrice),
    };
    // currentPrice: portfolioData?.Calls[strike]?.LTP,
    setPositionData({
      ...positionData,
      [strike]: data,
    });

    window.localStorage.setItem("positionTitle", JSON.stringify(positionTitle));
    window.localStorage.setItem(
      "totalPositionHolding",
      JSON.stringify(currrentValue)
    );
    window.localStorage.setItem(
      "totalPositionReturn",
      JSON.stringify(investreturn)
    );
  };

  //-------------option sell Handle---------------
  //------------------------------------------------------------------

  const onSubmitOptionSellHandle = (symbol, price, value, date) => {
    console.log(symbol, price, value);
    console.log(futureData[symbol]);
    const currrentValue = portfolioData.Calls[symbol]?.LTP * value * -1;
    const investment = price * value * -1;

    const investreturn = currrentValue - investment;
    const temp = positionTitle;
    if (temp.indexOf(symbol) === -1) {
      temp.push(symbol);
    }
    const returnInvest = totalPositionReturn - investreturn;
    setPositionTitle(temp);
    setTotalPositionHolding(totalPositionHolding - currrentValue);
    setTotalPositionReturn(returnInvest);
    setTotalPositionInvestment(totalInvestment + investment);
    let postioninvestment;
    let positionQuantity;
    let avgPrice;
    if (positionData[symbol]) {
      postioninvestment = positionData[symbol].investment - investment;
      positionQuantity = positionData[symbol].quantity - value;
      avgPrice = postioninvestment / positionQuantity;
    } else {
      postioninvestment = investment;
      positionQuantity = value * -1;
      avgPrice = postioninvestment / positionQuantity;
    }

    const data = {
      // 1. Quantity
      quantity: String(positionQuantity),
      // 2. type = equity as its stocks
      type: "Option",
      // 3. expiry has to be none as its stocks
      expiry: "none",
      // 4. no lots in stocks only quantity
      lot: "0",
      // 5,6 set SYMBOL AND ID FOR THE STOCK
      symbol: String(portfolioData.Calls[symbol]?.Symbol),
      symbolID: String(portfolioData.Calls[symbol]?.Symbol_ID),
      // 7. Invested Amount
      investedAmount: String(postioninvestment),
      // 8. Purchase Date
      purchaseDate: String(date),
      // 9. buyPrice
      buyPrice: String(avgPrice),
    };
    setPositionData({
      ...positionData,
      [symbol]: data,
    });
    function localset() {
      window.localStorage.setItem(
        "positionTitle",
        JSON.stringify(positionTitle)
      );
      window.localStorage.setItem(
        "totalPositionHolding",
        JSON.stringify(currrentValue)
      );
      window.localStorage.setItem(
        "totalPositionReturn",
        JSON.stringify(investreturn)
      );
    }
    localset();
  };

  // const onSubmitFutureHandle = (symbol, price, value) => {
  //   console.log(futureData[symbol]);
  //   const currrentValue = futureData[symbol]?.LTP * value;
  //   const investment = price * value;

  //   const investreturn = currrentValue - investment;
  //   const temp = positionTitle;
  //   if (temp.indexOf(symbol) === -1) {
  //     temp.push(symbol);
  //   }
  //   setPositionTitle(temp);
  //   setTotalPositionHolding(currrentValue);
  //   setTotalPositionReturn(investreturn);
  //   setTotalPositionInvestment(totalInvestment + investment);
  //   let postioninvestment;
  //   let positionQuantity;
  //   let avgPrice;
  //   if (positionData[symbol]) {
  //     postioninvestment = positionData[symbol].investment + investment;
  //     positionQuantity = positionData[symbol].quantity + value;
  //     avgPrice = postioninvestment / positionQuantity;
  //   } else {
  //     postioninvestment = investment;
  //     positionQuantity = value;
  //     avgPrice = postioninvestment / positionQuantity;
  //   }

  //   setPositionData({
  //     ...positionData,
  //     [symbol]: {
  //       investment: postioninvestment,
  //       avgPrice: avgPrice,
  //       quantity: positionQuantity,
  //       currentPrice: futureData[symbol].LTP,
  //     },
  //   });

  // };

  // const onSubmitFutureSellHandle = (symbol, price, value) => {
  //   console.log(symbol, price, value);
  //   console.log(futureData[symbol]);
  //   const currrentValue = futureData[symbol]?.LTP * value;
  //   const investment = price * value;

  //   const investreturn = currrentValue - investment;
  //   const temp = positionTitle;
  //   if (temp.indexOf(symbol) === -1) {
  //     temp.push(symbol);
  //   }
  //   const returnInvest = totalPositionReturn - investreturn;
  //   setPositionTitle(temp);
  //   setTotalPositionHolding(totalPositionHolding - currrentValue);
  //   setTotalPositionReturn(returnInvest);
  //   setTotalPositionInvestment(totalInvestment + investment);
  //   let postioninvestment;
  //   let positionQuantity;
  //   let avgPrice;
  //   if (positionData[symbol]) {
  //     postioninvestment = positionData[symbol].investment - investment;
  //     positionQuantity = positionData[symbol].quantity - value;
  //     avgPrice = postioninvestment / positionQuantity;
  //   }
  //   //  else {
  //   //   postioninvestment = investment;
  //   //   positionQuantity = value;
  //   //   avgPrice = postioninvestment / positionQuantity;
  //   // }

  //   setPositionData({
  //     ...positionData,
  //     [symbol]: {
  //       investment: postioninvestment,
  //       avgPrice: avgPrice,
  //       quantity: positionQuantity,
  //       currentPrice: futureData[symbol].LTP,
  //     },
  //   });
  // };

  console.log(stockData);
  // console.log(positionData);
  // console.log(futureData);
  //to center the tab in the middle and make it scrollable
  const theme = useTheme();
  // Inside your component
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  // modal style element
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    bgcolor: props.theme === "dark" ? "rgba(0, 4, 18, 1)" : "background.paper",
    overflow: "auto",
    boxShadow: 24,
    padding: "1rem",
    margin: "1rem",
    borderRadius: "6px",
    height: "100%",
  };
  console.log({ strikePrice });
  // ------------CURRENT USER INFO ----------------
  const { currentUser } = useAuth();
  // FUNC TO SAVE THE DATA IN FIREBASE
  const saveToFirebase = async (id, data) => {
    const rtDB = getDatabase(app);
    const dbRef = ref(rtDB, `Portfolio/${currentUser.uid}/${id}`);
    try {
      await set(dbRef, data);
      console.log(`Data ${data} saved`);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div style={{ marginBottom: "8px", padding: "1rem" }}>
      {/* <div className="table-info-icons">
        <div
          style={{
            cursor: "pointer",
            color: "#3f62d7",
            marginLeft: "auto",
          }}
          onClick={() => handleToggleFavourite(id)}
        >
          {favouritesToggle ? <StarIcon /> : <StarBorderIcon />}
        </div>
      </div> */}
      {(Object.keys(holdingData).length > 0 ||
        Object.keys(positionData).length > 0) && (
        <>
          <HoldingAndPosition
            totalHolding={totalHolding}
            totalReturn={totalReturn}
            totalInvestment={totalInvestment}
            totalPositionHolding={totalPositionHolding}
            totalPositionReturn={totalPositionReturn}
            totalPositionInvestment={totalPositionInvestment}
            theme={props.theme}
          />
          {Object.keys(holdingData).length > 0 && (
            <PortfolioHolding
              holdingData={holdingData}
              holdingTitle={holdingTitle}
              stockData={stockData}
              theme={props.theme}
            />
          )}
          {Object.keys(positionData).length > 0 && (
            <PortfolioPosition
              positionTitle={positionTitle}
              positionData={positionData}
              portfolioData={portfolioData}
              theme={props.theme}
            />
          )}
        </>
      )}

      <Button
        sx={{
          backgroundColor: props.theme === "light" ? "black" : "white",
          color: props.theme === "light" ? "white" : "black",
          fontWeight: "bold",
        }}
        onClick={handleOpen}
        variant="contained"
      >
        Add Portfolio
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {/* <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box> */}
        <Box sx={style}>
          <Tabs
            value={portfolioTab}
            onChange={(e, newValue) => {
              setPortfolioTab(newValue);
            }}
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
              label="Stock"
              className="muiTab"
              id="simple-tab-1"
              value="stock"
            />
            <Tab
              label="Option"
              className="muiTab"
              id="simple-tab-2"
              value="option"
            />
            {/* <Tab
                  label="Future"
                  className="muiTab"
                  id="simple-tab-3"
                  value="future"
                /> */}
          </Tabs>

          {portfolioTab === "stock" && (
            <PortfolioStock
              stockData={stockData}
              strikePrice={strikePrice}
              searchString={searchString}
              searchHandler={searchHandler}
              onSubmitHandle={onSubmitHandle}
              holdingData={holdingData}
              onSubmitStockSellHandle={onSubmitStockSellHandle}
              theme={props.theme}
            />
          )}
          {portfolioTab === "option" && (
            <PortfolioOption
              setPortfolioOptions={setPortfolioOptions}
              portfolioOptions={portfolioOptions}
              expiry={expiry}
              setExpiry={setExpiry}
              portfolioData={portfolioData}
              strikeArray={strikeArray}
              onSubmitOptionHandle={onSubmitOptionHandle}
              onSubmitOptionSellHandle={onSubmitOptionSellHandle}
              indexWiseExpiry={indexWiseExpiry}
              optionSearchString={optionSearchString}
              optionSearchHandler={optionSearchHandler}
              theme={props.theme}
              // index={index}
            />
          )}
          {/* {portfolioTab === "future" && (
              <PortfolioFuture
                futureTitle={futureTitle}
                futureData={futureData}
                onSubmitOptionHandle={onSubmitFutureHandle}
                onSubmitFutureSellHandle={onSubmitFutureSellHandle}
                // expiryDates={expiryDates}
                // portfolioData={portfolioData}
                // strikeArray={strikeArray}
                // // index={index}
              />
            )} */}
        </Box>
      </Modal>
    </div>
  );
}

export default Portfolio;
