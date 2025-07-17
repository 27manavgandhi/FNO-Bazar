import React, { useEffect, useState } from "react";
import style from "./BuyingSellingPressure.module.css";
import { db, futureDB, app } from "../../firebase";
import { onValue, ref, off, getDatabase } from "firebase/database";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";

import StarIcon from "@mui/icons-material/Star";
import { useFavourites } from "../../contexts/FavouritesContext";
function BuyingSellinPressure(props) {
  const {
    optionChainData,
    optionChainOptions,
    buyingSellingPressureOptions,
    setBuyingSellingPressureOptions,
  } = props;

  const [toggleButton, setToggleButton] = useState(false);
  const [buyingSellingData, setBuyingSellingData] = useState();
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
  const id = "buyingsellingpressure";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Buying Selling Pressure";
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
      localStorage.getItem("buyingSellingPressureOptions")
    );
    if (savedOptions) {
      setBuyingSellingPressureOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setBuyingSellingPressureOptions(updatedOptions);
    localStorage.setItem(
      "buyingSellingPressureOptions",
      JSON.stringify(updatedOptions)
    );
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
    loadOptionsFromLocalStorage();
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
      // setExpiry(niftyDate[0]);
    }

    niftyDate = [];
    bankNiftyDate = [];

    // const id = setTimeout(() => {
    //   setLoading(true);
    // }, 1000);

    return () => {
      // clearTimeout(id);
      unsubscribe.forEach((u) => u());
    };
  }, [expiryDates]);

  useEffect(() => {
    const date =
      buyingSellingPressureOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [buyingSellingPressureOptions["index"], indexWiseExpiry]);
  // console.log(expiry, indexWiseExpiry);

  useEffect(() => {
    // setLoading(false);
    console.log("runned option portfolio");
    function fetchData() {
      let currentcount = expiry;
      let currentindex = buyingSellingPressureOptions["index"];
      console.log(`tick/Option/${currentcount}/${currentindex}`);
      let index = "";
      let temp = [];
      const dbRef = ref(
        futureDB,
        `tick/Option/${currentcount}/${currentindex}`
      );
      onValue(dbRef, (snapshot) => {
        // let option = portfolioOptions["optionChain"];

        temp = snapshot.val();
        setBuyingSellingData(temp);

        console.log(temp);
        // setTitleList(strikeNumber);
      });
    }
    fetchData();
    // const timeToken = setTimeout(fetchData, 1000);

    // return () => {
    //   clearTimeout(timeToken);
    // };
  }, [buyingSellingPressureOptions, indexWiseExpiry, expiry]);

  useEffect(() => {
    console.log(buyingSellingPressureOptions["numStrikePrice"]);
    const index =
      buyingSellingPressureOptions["index"] === "NIFTY"
        ? "NIFTY 50"
        : "NIFTY BANK";
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          buyingSellingPressureOptions["numStrikePrice"] || 5,
          buyingSellingPressureOptions["index"] === "NIFTY" ? 50 : 100
        );

        strikePriceArray.sort();
        // setportfolioOptions({
        //   ...portfolioOptions,
        //   strikPrice: strikePriceArray[0],
        // });
      }
    });
    setStrikeArray(strikePriceArray);
  }, [buyingSellingPressureOptions]);
  console.log(optionChainData, buyingSellingData);
  if (!buyingSellingData) return <>loading...</>;
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
      <div className="option-buyingsellingpressure">
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
            <div
              className="subpage-dropdowns-container"
              data-theme={props.theme}
            >
              <div className="dropdown-container">
                <select
                  name="option-buyingsellingpressure-index"
                  id="option-buyingsellingpressure-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...buyingSellingPressureOptions,
                      index: e.target.value,
                    });
                  }}
                  value={buyingSellingPressureOptions.index}
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
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...buyingSellingPressureOptions,
                      expiry: e.target.value,
                    });
                    setExpiry(e.target.value);
                  }}
                  value={buyingSellingPressureOptions.expiry}
                >
                  {buyingSellingPressureOptions.index === "NIFTY" ? (
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
                      ...buyingSellingPressureOptions,
                      numStrikePrice: e.target.value,
                    });
                  }}
                  value={buyingSellingPressureOptions.numStrikePrice}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                </select>
                <p>Strike Prices</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-buyingsellingpressure-time"
                  id="option-buyingsellingpressure-time"
                  className="subpage-dropdown"
                  value={buyingSellingPressureOptions.option}
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...buyingSellingPressureOptions,
                      option: e.target.value,
                    });
                  }}
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
                <p>select</p>
              </div>
            </div>
          </Box>
        </Modal>

        {/* SUBPAGE DROPDOWN CONTAINERS CLOSE FOR BUYING SELLING PRESSURE */}
      </div>
      <div className={style.container}>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              {/* call columns */}
              <th className={style.strike_prices} data-theme={props.theme}>
                Strike Price
              </th>
              <th>Buy Pressure</th> <th>Sell Pressure</th> <th>LTP</th>{" "}
              <th>Change</th>
              <th>Probable Outcome</th>
            </tr>
          </thead>
          <tbody>
            {buyingSellingPressureOptions.option === "put" ? (
              <>
                {strikeArray.map((strike, index) => {
                  let bgcolour = "";
                  let outcome = "Neutral";
                  const buyPressure = Math.round(
                    (buyingSellingData?.Puts?.[strike]?.["Ask_Qty"] /
                      (buyingSellingData?.Puts?.[strike]?.["Ask_Qty"] +
                        buyingSellingData?.Puts?.[strike]?.["Bid_Qty"])) *
                      100
                  );
                  const sellPressure = 100 - buyPressure;
                  const changeInLtp = (
                    buyingSellingData?.Puts?.[strike]?.["LTP"] -
                    buyingSellingData.Puts?.[strike]?.["Prev_Close"]
                  ).toFixed(2);
                  if (buyPressure > sellPressure && changeInLtp > 0) {
                    outcome = "Bullish";
                    bgcolour = "green";
                  }
                  if (buyPressure < sellPressure && changeInLtp < 0) {
                    outcome = "Bearish";
                    bgcolour = "red";
                  }

                  return (
                    <tr key={strike}>
                      {/* call columns */}
                      <td
                        className="textbold strike_prices"
                        data-theme={props.theme}
                      >
                        {strike}
                      </td>
                      <td>{buyPressure}%</td> <td>{sellPressure}%</td>
                      <td
                        style={{
                          color: `${changeInLtp < 0 ? "red" : "green"}`,
                        }}
                      >
                        {buyingSellingData?.Puts?.[strike]?.["LTP"]}
                      </td>{" "}
                      <td
                        style={{
                          color: `${changeInLtp < 0 ? "red" : "green"}`,
                        }}
                      >
                        {changeInLtp}
                      </td>
                      <td style={{ backgroundColor: bgcolour }}>{outcome}</td>
                    </tr>
                  );
                })}
              </>
            ) : (
              <>
                {strikeArray.map((strike, index) => {
                  let bgcolour = "";
                  let outcome = "Neutral";
                  const buyPressure = Math.round(
                    (buyingSellingData?.Calls?.[strike]?.["Ask_Qty"] /
                      (buyingSellingData?.Calls?.[strike]?.["Ask_Qty"] +
                        buyingSellingData?.Calls?.[strike]?.["Bid_Qty"])) *
                      100
                  );
                  const sellPressure = 100 - buyPressure;
                  const changeInLtp = (
                    buyingSellingData?.Calls?.[strike]?.["LTP"] -
                    buyingSellingData.Calls?.[strike]?.["Prev_Close"]
                  ).toFixed(2);
                  if (buyPressure > sellPressure && changeInLtp > 0) {
                    outcome = "Bullish";
                    bgcolour = "green";
                  }
                  if (buyPressure < sellPressure && changeInLtp < 0) {
                    outcome = "Bearish";
                    bgcolour = "red";
                  }

                  return (
                    <tr key={strike}>
                      {/* call columns */}
                      <td
                        className="textbold strike_prices"
                        data-theme={props.theme}
                      >
                        {strike}
                      </td>
                      <td>{buyPressure}%</td> <td>{sellPressure}%</td>
                      <td
                        style={{
                          color: `${changeInLtp < 0 ? "red" : "green"}`,
                        }}
                      >
                        {buyingSellingData?.Calls?.[strike]?.["LTP"]}
                      </td>{" "}
                      <td
                        style={{
                          color: `${changeInLtp < 0 ? "red" : "green"}`,
                        }}
                      >
                        {changeInLtp}
                      </td>
                      <td style={{ backgroundColor: bgcolour }}>{outcome}</td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default BuyingSellinPressure;
