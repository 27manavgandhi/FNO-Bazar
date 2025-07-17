import React, { useEffect, useState } from "react";
import style from "./StrategyBuilder.module.css";
import StrategyBuilderTable from "./StrategyBuilderTable";
import { getDatabase, ref, set, onValue, get } from "firebase/database";
import { db, futureDB, app } from "../../firebase";

import { useAuth } from "../../contexts/AuthContext";
import { uid } from "uid";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
function StrategyBuilder(props) {
  // const { expiryDates, strikeArray } = props;
  const { currentUser } = useAuth();
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [segment, setSegment] = useState("option");
  const [nifty, setNifty] = useState();
  const [inputValue, setInputValue] = useState(1);
  const [buySell, setBuySell] = useState("Buy");
  const [strategyBuilderOptions, setStrategyBuilderOptions] = useState({
    segment: "option",
    index: "nifty50",
    expiry: 0,
    strikePrices: 0,
    option: "Calls",
    tradeOption: "buy",
    lot: 1,
    optionPrice: 0,
  });
  const [componentLoading, setComponentLoading] = useState(true);
  const [expiryDates, setExpiryDates] = useState([]);
  const [strikePrice, setStrikePrice] = useState();
  const [strategyName, setStrategyName] = useState();
  const [expiry, setExpiry] = useState("");
  function writeUserData(name, email, imageUrl) {
    const index =
      strategyBuilderOptions.index === "nifty50" ? "NIFTY" : "BANKNIFTY";
    const uuid = uid();
    const db = getDatabase();
    const callsorputs = strategyBuilderOptions.option;
    const ceOrpe = strategyBuilderOptions.option === "Calls" ? "CE" : "PE";
    set(ref(db, `Strategies/${currentUser.uid}/${uuid}`), {
      id: uuid,
      strategyName: strategyName,
      index: strategyBuilderOptions.index,
      expiry: expiry,
      lot: inputValue,
      price: nifty[callsorputs][strikePrice].LTP,
      buysell: buySell,
      trade: index + strikePrice + ceOrpe,
    });
  }
  // const index =
  //   strategyBuilderOptions.index === "nifty50" ? "NIFTY" : "BANKNIFTY";
  // const ceOrpe = strategyBuilderOptions.option === "Calls" ? "CE" : "PE";
  // console.log(index + strikePrice + ceOrpe);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [strikeArray, setStrikeArray] = useState([]);
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
    dateFetchOption();

    setComponentLoading(false);

    return () => {
      // Detach the listener when the component unmounts
      // off(expiryRef, "value", onExpiryValueChange);
    };
  }, []);

  useEffect(() => {
    const strike = strikeArray[0];
    setStrikePrice(strike);
    console.log(strike);
  }, [strikeArray]);

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
            }
            if (temp.NIFTY) {
              niftyDate.push(expiryDates[i]);
            }
          }
        })
      );

      setIndexWiseExpiry({
        ...indexWiseExpiry,
        nifty: niftyDate,
        banknifty: bankNiftyDate,
      });
      setStrategyBuilderOptions({
        ...strategyBuilderOptions,
        expiry: niftyDate[0],
      });
    }
    const id = setTimeout(() => {
      setLoading(true);
    }, 400);

    return () => {
      clearTimeout(id);
      unsubscribe.forEach((u) => u());
    };
  }, [loading]);

  useEffect(() => {
    const date =
      strategyBuilderOptions.index === "nifty50"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [strategyBuilderOptions.index, indexWiseExpiry]);

  useEffect(() => {
    const index =
      strategyBuilderOptions.index === "nifty50" ? "NIFTY" : "BANKNIFTY";
    // const expiry = strategyBuilderOptions.expiry;
    // console.log(`tick/Option/${expiry}/${index}`);
    const dbRef = ref(futureDB, `tick/Option/${expiry}/${index}`);
    onValue(dbRef, (snapshot) => {
      const temp = snapshot.val();
      setNifty(temp);
    });

    // const id = setTimeout(() => {
    //   setDataLoading(true);
    // }, 700);

    // return () => {
    //   clearTimeout(id);
    // };
  }, [strategyBuilderOptions, expiry]);
  useEffect(() => {
    const index =
      strategyBuilderOptions["index"] === "nifty50" ? "NIFTY 50" : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        console.log(niftyLTPData);
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          5,
          strategyBuilderOptions["index"] === "nifty50" ? 50 : 100
        );

        strikePriceArray.sort();
        // setChartPlottingOptions({
        //   ...chartPlottingOptions,
        //   strikPrice: strikePriceArray[0],
        // });
      }
    });
    setStrikeArray(strikePriceArray);
  }, [strategyBuilderOptions["index"]]);
  const callsorputs = strategyBuilderOptions.option;

  // console.log(
  //   nifty[callsorputs][strikePrices]
  //     .LTP
  // );
  // console.log(nifty);
  console.log(strikePrice);
  console.log(strategyBuilderOptions);

  if (!nifty) return <>loading...</>;
  return (
    <div className={style.strategy_container}>
      <div>
        <input
          onChange={(e) => setStrategyName(e.target.value)}
          className={style.input_box}
          type="text"
          placeholder=" My strategy"
        />
      </div>
      <div className="dropdown-container">
        <select
          name="option-straddleandstrangle-index"
          id="option-straddleandstrangle-index"
          className="subpage-dropdown"
          onChange={(e) => {
            setSegment(e.target.value);
          }}
          value={segment}
        >
          <option value="option">Option</option>
          <option value="future">Future</option>
        </select>
        <p>Select Indices</p>
      </div>
      <div className={style.container}>
        {segment === "option" ? (
          <>
            <div className={style.flex_column_center}>
              <div className="dropdown-container">
                <select
                  name="option-straddleandstrangle-index"
                  id="option-straddleandstrangle-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    setStrategyBuilderOptions({
                      ...strategyBuilderOptions,
                      index: e.target.value,
                    });
                  }}
                >
                  <option value="nifty50">Nifty 50</option>
                  <option value="niftybank">Nifty Bank</option>
                </select>
                <p>Select Indices</p>
              </div>{" "}
              <div className="dropdown-container">
                <select
                  name="option-optionchain-numstrikeprice"
                  id="option-optionchain-numstrikeprice"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    setStrategyBuilderOptions({
                      ...strategyBuilderOptions,
                      strikePrices: e.target.value,
                    });
                  }}
                >
                  {strikeArray.map((strike, index) => {
                    return (
                      <option key={strike} value={strike}>
                        {strike}
                      </option>
                    );
                  })}
                </select>
                <p>Strike Prices</p>
              </div>
            </div>
            <div className={style.flex_column_center}>
              <div className="dropdown-container">
                <select
                  name="option-optionchain-expiry"
                  id="option-optionchain-expiry"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    setExpiry(e.target.value);
                  }}
                >
                  {strategyBuilderOptions.index === "nifty50" ? (
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
                  name="option-straddleandstrangle-time"
                  id="option-straddleandstrangle-time"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    setStrategyBuilderOptions({
                      ...strategyBuilderOptions,
                      option: e.target.value,
                    });
                  }}
                >
                  <option value="Calls">Calls</option>
                  <option value="Puts">Puts</option>
                </select>
                <p>Call or Put</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {" "}
            <div className="dropdown-container">
              <select
                name="option-straddleandstrangle-index"
                id="option-straddleandstrangle-index"
                className="subpage-dropdown"
                onChange={(e) => {
                  setStrategyBuilderOptions({
                    ...strategyBuilderOptions,
                    index: e.target.value,
                  });
                }}
              >
                <option value="23nov">23NOV</option>
                <option value="23dec">23DEC</option>
              </select>
              <p>Select Indices</p>
            </div>
          </>
        )}
      </div>
      <div className={style.item_container}>
        <div className={style.flex_column_center}>
          <div className="dropdown-container">
            <select
              name="option-straddleandstrangle-time"
              id="option-straddleandstrangle-time"
              className="subpage-dropdown"
              onChange={(e) => setBuySell(e.target.value)}
            >
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
            <p>Buy or Sell</p>
          </div>
          <div className={style.option_price}>
            Option Price:
            {nifty[callsorputs][strikePrice].LTP}
          </div>
        </div>
        <div className={style.flex_column_center}>
          <div className={style.inputlot_container}>
            {/* lot */}
            <div
              className={style.value_button}
              id={style.decrease}
              onClick={(e) => setInputValue(inputValue - 1)}
            >
              -
            </div>
            <input
              className={style.input_number}
              type="number"
              id="number"
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
            />
            <div
              className={style.value_button}
              id="increase"
              onClick={(e) => setInputValue(inputValue + 1)}
            >
              +
            </div>
          </div>
          <button className={style.btn} onClick={writeUserData}>
            Add Position
          </button>
        </div>
      </div>

      {/* <StrategyBuilderTable /> */}
    </div>
  );
}

export default StrategyBuilder;
