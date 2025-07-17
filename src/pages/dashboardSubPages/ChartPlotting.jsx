import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { futureDB } from "../../firebase";
import { Line } from "react-chartjs-2";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";
import StarIcon from "@mui/icons-material/Star";

import { useFavourites } from "../../contexts/FavouritesContext";
function generateTimestampArray(timeGap) {
  const startTimestamp = new Date();
  startTimestamp.setHours(9, 15, 0, 0); // Set the start time to 9:15 AM
  const endTimestamp = new Date();
  endTimestamp.setHours(15, 30, 0, 0); // Set the end time to 3:30 PM

  const timestamps = [];
  let currentTimestamp = new Date(startTimestamp);

  while (currentTimestamp <= endTimestamp) {
    const hours = currentTimestamp.getHours();
    const minutes = currentTimestamp.getMinutes();

    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const amPm = hours < 12 ? "AM" : "PM";

    const formattedTimestamp = `${formattedHours}:${formattedMinutes} ${amPm}`;

    timestamps.push(formattedTimestamp);

    // Create a new Date object to avoid modifying the same object
    currentTimestamp = new Date(currentTimestamp.getTime() + timeGap * 60000);
  }

  return timestamps;
}

function ChartPlotting(props) {
  const {
    setChartPlottingOptions,
    chartPlottingOptions,
    expiryDates,
    strikeArray,
    theme,
    expiryDataObject,
  } = props;
  console.log(expiryDates);
  const [chartData, setChartData] = useState([]);
  const [timeGapStamps, setTimeGapStamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expiry, setExpiry] = useState("");
  // modal toggle
  const [toggleButton, setToggleButton] = useState(false);
  const strike = chartPlottingOptions.strikPrice;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color:
            props.theme === "dark" ? "rgba(228, 228, 228, 0.28)" : "#e0dfe4", // Initial color based on theme
        },
      },
      y: {
        grid: {
          color:
            props.theme === "dark" ? "rgba(228, 228, 228, 0.28)" : "#e0dfe4", // Initial color based on theme
        },
      },
    },
  };

  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: [],
  });
  // favourites options and functions
  const id = "chartplotting";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Chart Plotting";
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
  useEffect(() => {
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
  }, []);
  // ---------------- Function to load options from localStorage--------START--------

  const loadOptionsFromLocalStorage = () => {
    const savedOptions = JSON.parse(
      localStorage.getItem("chartPlottingOptions")
    );
    if (savedOptions) {
      setChartPlottingOptions(savedOptions);
    }
  };
  // ---------------- Function to load options from localStorage--------END--------
  // ----------------------UPDATE MODAL VALUES AND SAVE IT TO LOCAL STORAGE----START---
  const updateOptionChainOptions = (updatedOptions) => {
    setChartPlottingOptions(updatedOptions);
    localStorage.setItem(
      "chartPlottingOptions",
      JSON.stringify(updatedOptions)
    );
  };
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
    loadOptionsFromLocalStorage();
  }, [expiryDates]);
  // console.log(indexWiseExpiry);

  useEffect(() => {
    const date =
      chartPlottingOptions.index === "NIFTY"
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [chartPlottingOptions.index, indexWiseExpiry]);

  useEffect(() => {
    setChartPlottingOptions({
      ...chartPlottingOptions,
      strikPrice: strikeArray[5],
    });
  }, [strikeArray]);
  useEffect(() => {
    const timegap = chartPlottingOptions.minutes;
    const timestampsArray = generateTimestampArray(timegap);
    setTimeGapStamps(timestampsArray);
  }, [chartPlottingOptions]);
  useEffect(() => {
    let tempData = [];
    let downData = [];

    const index = chartPlottingOptions.index;
    console.log(`/recent data/${timeGapStamps[1]}/Option/${expiry}/${index}`);
    for (let i = 0; i < timeGapStamps.length; i++) {
      const dbRef = ref(
        futureDB,
        `/recent data/${timeGapStamps[i]}/Option/${expiry}/${index}`
      );
      onValue(dbRef, (snapshot) => {
        if (snapshot.val()) downData.push(snapshot.val());
        setChartData(downData);
      });
    }

    if (chartData.length !== timeGapStamps.length) {
      setLoading(!loading);
    }
  }, [chartPlottingOptions, timeGapStamps, expiry, loading]);
  // console.log(timeGapStamps.length);
  // console.log(chartData.length);
  console.log(expiry);
  const param = chartPlottingOptions.param;
  const prev_Close =
    chartPlottingOptions.param === "LTP" ? "Prev_Close" : "Prev_Open_Int_Close";
  // modal and dropdown
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
    <div data-theme={theme}>
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
          <div className="option-optionchain subpage">
            <div className="subpage-dropdowns-container">
              <div className="dropdown-container">
                <select
                  name="option-straddleandstrangle-index"
                  id="option-straddleandstrangle-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...chartPlottingOptions,
                      param: e.target.value,
                    });
                  }}
                  value={chartPlottingOptions.param}
                >
                  <option value="LTP">LTP</option>
                  <option value="OI">OI</option>
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
                      ...chartPlottingOptions,
                      index: e.target.value,
                    });
                  }}
                  value={chartPlottingOptions.index}
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
                      ...chartPlottingOptions,
                      strikPrice: e.target.value,
                    });
                  }}
                  value={chartPlottingOptions.strikPrice}
                >
                  {strikeArray.map((strike) => {
                    return (
                      <option value={strike} key={strike}>
                        {strike}
                      </option>
                    );
                  })}
                </select>
                <p>Select strike</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-straddleandstrangle-index"
                  id="option-straddleandstrangle-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...chartPlottingOptions,
                      minutes: e.target.value,
                    });
                  }}
                  value={chartPlottingOptions.minutes}
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                </select>
                <p>Select time</p>
              </div>
              <div className="dropdown-container">
                <select
                  name="option-straddleandstrangle-index"
                  id="option-straddleandstrangle-index"
                  className="subpage-dropdown"
                  onChange={(e) => {
                    updateOptionChainOptions({
                      ...chartPlottingOptions,
                      expiry: e.target.value,
                    });
                    setExpiry(e.target.value);
                  }}
                  value={chartPlottingOptions.expiry}
                >
                  {chartPlottingOptions.index === "NIFTY" ? (
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
                <p>expiry</p>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {!chartData ? (
        <>loading...</>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            // height: "30rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              position: "relative",
              width: "100%",
              minHeight: "30rem",
              height: "100%",
            }}
          >
            <Line
              redraw={true}
              data={{
                labels: timeGapStamps.map((time) => time),
                datasets: [
                  {
                    data: chartData.map((data) => {
                      return (
                        data.Calls?.[chartPlottingOptions.strikPrice]?.[param] -
                        data.Calls?.[chartPlottingOptions.strikPrice]?.[
                          prev_Close
                        ]
                      );
                    }),
                    label: `Call`,
                    borderColor: "blue",
                  },
                  {
                    data: chartData.map((data) => {
                      return (
                        data.Puts?.[chartPlottingOptions.strikPrice]?.[param] -
                        data.Puts?.[chartPlottingOptions.strikPrice]?.[
                          prev_Close
                        ]
                      );
                    }),
                    label: `Put`,
                    borderColor: "red",
                  },
                ],
              }}
              options={options}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartPlotting;
