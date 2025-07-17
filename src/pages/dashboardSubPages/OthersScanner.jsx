import React, { useEffect, useState } from "react";
import style from "./OthersScanner.module.css";
import { cloneDeep } from "lodash";
import { ref, onValue } from "firebase/database";
import { getDatabase, off, get } from "firebase/database";
import { app } from "../../firebase";
import { futureDB } from "../../firebase";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarIcon from "@mui/icons-material/Star";
function OthersScanner(props) {
  // const {
  // titleList,
  // scannerData,
  // scannerOptions,
  // setScannerOptions,
  // indexWiseExpiry,
  // expiry,
  // setExpiry,
  // setOptionTab,
  // optionTab,
  // } = props;
  const [scannerOptions, setScannerOptions] = useState({
    index: "NIFTY",
    optionChain: "Calls",
    option: "Future",
    parameter: "LTP",
    order: "Ascending",
    count: 0,
    date: [],
  });
  const [componentLoading, setComponentLoading] = useState(true);
  const [dump, setDump] = useState([]);
  const [futureExpiry, setFutureExpiry] = useState();
  const [optionTab, setOptionTab] = useState("Future");
  const [sortedTitle, setSortedTitle] = useState([]);
  const [scannerData, setScannerData] = useState([]);
  const [titleList, setTitleList] = useState([]);
  const param = scannerOptions.parameter;
  const option = scannerOptions.optionChain === "Calls" ? "CE" : "PE";
  const [expiry, setExpiry] = useState("");
  const [expiryDates, setExpiryDates] = useState([]);
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  // modal toggle
  const [toggleButton, setToggleButton] = useState(false);
  // favourites options and functions
  const id = "scanner";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Scanner";
    const index = favourites.findIndex((component) => component.id === id);
    // console.log({ favourites });

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
    const savedOptions = JSON.parse(localStorage.getItem("scannerOptions"));
    if (savedOptions) {
      setScannerOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setScannerOptions(updatedOptions);
    localStorage.setItem("scannerOptions", JSON.stringify(updatedOptions));
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
    const tempTitle = cloneDeep(titleList);

    if (param === "LTP") {
      if (scannerOptions.order === "Descending") {
        const tempTitle = cloneDeep(titleList);
        tempTitle.sort((a, b) => {
          return (
            scannerData[b][param] -
            scannerData[b]["Prev_Close"] -
            (scannerData[a][param] - scannerData[a]["Prev_Close"])
          );
        });
        setSortedTitle(tempTitle);
      }
      if (scannerOptions.order === "Ascending") {
        const tempTitle = cloneDeep(titleList);
        tempTitle.sort((a, b) => {
          return (
            scannerData[a][param] -
            scannerData[a]["Prev_Close"] -
            (scannerData[b][param] - scannerData[b]["Prev_Close"])
          );
        });
        setSortedTitle(tempTitle);
      }
    } else {
      if (scannerOptions.order === "Descending") {
        const tempTitle = cloneDeep(titleList);
        tempTitle.sort((a, b) => {
          return scannerData[b][param] - scannerData[a][param];
        });
        setSortedTitle(tempTitle);
      }
      if (scannerOptions.order === "Ascending") {
        const tempTitle = cloneDeep(titleList);
        tempTitle.sort((a, b) => {
          return scannerData[a][param] - scannerData[b][param];
        });
        setSortedTitle(tempTitle);
      }
    }
  }, [optionTab, scannerOptions, titleList]);

  if (!scannerData) return <>loading..</>;
  // STYLE FOR MODAL
  const styleBox = {
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
        </div>
        <Modal
          open={toggleButton}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={styleBox}>
            <div className="subpage-dropdowns-container">
              {scannerOptions.option === "Option" && (
                <>
                  <div className="dropdown-container">
                    <select
                      name="option-optionchain-expiry"
                      id="option-optionchain-expiry"
                      className="subpage-dropdown"
                      onChange={(e) => {
                        updateOptionChainOptions({
                          ...scannerOptions,
                          index: e.target.value,
                        });
                        setExpiry(e.target.value);
                      }}
                      value={scannerOptions.index}
                    >
                      {scannerOptions.index === "NIFTY" ? (
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
                          {indexWiseExpiry.banknifty.map(
                            (expiryDate, index) => {
                              return (
                                <option key={index} value={expiryDate}>
                                  {expiryDate}
                                </option>
                              );
                            }
                          )}
                        </>
                      )}
                    </select>
                    <p>Select Expiry</p>
                  </div>
                  <div className="dropdown-container">
                    <select
                      name="option-straddleandstrangle-index"
                      id="option-straddleandstrangle-index"
                      className="subpage-dropdown"
                      onChange={(e) => {
                        updateOptionChainOptions({
                          ...scannerOptions,
                          index: e.target.value,
                        });
                      }}
                      value={scannerOptions.index}
                    >
                      <option value="NIFTY">Nifty</option>
                      <option value="BANKNIFTY">BankNifty</option>
                    </select>
                    <p>Select Index</p>
                  </div>
                  <div className="dropdown-container">
                    <select
                      name="option-straddleandstrangle-index"
                      id="option-straddleandstrangle-index"
                      className="subpage-dropdown"
                      onChange={(e) => {
                        updateOptionChainOptions({
                          ...scannerOptions,
                          optionChain: e.target.value,
                        });
                      }}
                      value={scannerOptions.optionChain}
                    >
                      <option value="Calls">Calls</option>
                      <option value="Puts">Puts</option>
                    </select>
                    <p>Select Call or Put</p>
                  </div>
                </>
              )}

              <div className="dropdown-container">
                <select
                  name="option-straddleandstrangle-index"
                  id="option-straddleandstrangle-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...scannerOptions,
                      option: e.target.value,
                    });
                    setOptionTab(e.target.value);
                  }}
                  value={scannerOptions.option}
                >
                  <option value="Future">Future</option>
                  <option value="Option">Option</option>
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
                      ...scannerOptions,
                      parameter: e.target.value,
                    });
                  }}
                  value={scannerOptions.parameter}
                >
                  <option value="LTP">LTP</option>
                  <option value="Volume">Volume</option>
                  <option value="OI">OI</option>
                </select>
                <p>Select Parameter</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-straddleandstrangle-index"
                  id="option-straddleandstrangle-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...scannerOptions,
                      order: e.target.value,
                    });
                  }}
                  value={scannerOptions.order}
                >
                  <option value="Ascending">Ascending</option>
                  <option value="Descending">Descending</option>
                </select>
                <p>Select Parameter</p>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      <div className={style.container}>
        {sortedTitle.map((title) => {
          const change = (
            scannerData[title]?.[param] - scannerData[title]?.Prev_Close
          ).toFixed(2);

          return (
            <div
              className={style.card_Container}
              key={title}
              data-theme={props.theme}
            >
              <div className={style.title_Container}>
                <div className={style.title}>{title + " " + option}</div>
                <div className={style.card_Details}>
                  <div className={style.nfo}>NFO</div>
                  <div className={style.date}>23NOV</div>
                </div>
              </div>
              <div
                className={`${style.card_Value} ${
                  change < 0 ? style.red : style.green
                }`}
              >
                <div className={style.number}>
                  {scannerData[title]?.[param]}
                </div>
                <div className={style.percentage}>
                  {change}
                  (1.39%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default OthersScanner;
