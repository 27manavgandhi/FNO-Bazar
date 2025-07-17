import React, { useEffect, useState } from "react";
import style from "./OrderFlowAnalysis.module.css";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { futureDB, app } from "../../firebase";
import TuneIcon from "@mui/icons-material/Tune";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Modal } from "@mui/material";
import FilterSVG from "../../components/FilterSVG";
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
function generateTimestampArray() {
  const startTimestamp = new Date();
  startTimestamp.setHours(9, 15, 0, 0); // Set the start time to 9:18 AM
  const endTimestamp = new Date();
  endTimestamp.setHours(15, 30, 0, 0); // Set the end time to 3:30 PM

  const timestamps = [];
  let currentTimestamp = new Date(startTimestamp);

  while (currentTimestamp <= endTimestamp) {
    const formattedTimestamp = currentTimestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    timestamps.push(formattedTimestamp);
    currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 1);
  }

  return timestamps;
}

export default function OrderFlowAnalysis(props) {
  const [toggleButton, setToggleButton] = useState(false);
  const [niftyData, setNiftyData] = useState([]);
  const [bankNiftyData, setBankNiftyData] = useState([]);
  const [oiNiftyData, setOiNiftyData] = useState([]);
  const [oiBankNiftyData, setOiBankNiftyData] = useState([]);
  const [orderFlowAnalysisOptions, setOrderFlowAnalysisOptions] = useState({
    index: "NIFTY 50",

    time: 0,
    lotOrValue: "value",
  });
  const [timestampsArray, setTimestampsArray] = useState(
    generateTimestampArray()
  );
  const currentDate = "23" + getMonth().slice(0, 3).toUpperCase();
  const [futureExpiry, setFutureExpiry] = useState();
  const [componentLoading, setComponentLoading] = useState(true);
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
    let unsubscribe1;
    let unsubscribe2;
    let unsubscribe3;
    let unsubscribe4;
    let tempData = [];
    let downData = [];
    let futureNiftyData = [];
    let futureBankNiftyData = [];
    let optionNifty = [];
    const index = orderFlowAnalysisOptions.index;
    for (let i = 0; i < timestampsArray.length; i++) {
      // const optionNiftyRef = ref(
      //   futureDB,
      //   `/recent data/${timestampsArray[i]}/Option/NIFTY 50`
      // );

      const dbRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Index/${index}`
      );
      const bankRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Index/NIFTY BANK`
      );
      const futureNiftyRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Future/${futureExpiry}/NIFTY FUT`
      );
      const futureBankNiftyRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Future/${futureExpiry}/BANKNIFTY FUT`
      );
      unsubscribe1 = onValue(dbRef, (snapshot) => {
        downData.push(snapshot.val());
        setNiftyData(downData);
        if (i == timestampsArray.length - 1) console.log("haris");
      });
      unsubscribe2 = onValue(bankRef, (snapshot) => {
        tempData.push(snapshot.val());
      });
      unsubscribe3 = onValue(futureNiftyRef, (snapshot) => {
        futureNiftyData.push(snapshot.val());

        setOiNiftyData(futureNiftyData);
      });
      unsubscribe4 = onValue(futureBankNiftyRef, (snapshot) => {
        futureBankNiftyData.push(snapshot.val());
        setOiBankNiftyData(futureBankNiftyData);
      });
    }

    return () => {
      if (unsubscribe1) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe1();
      }
      if (unsubscribe2) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe2();
      }
      if (unsubscribe3) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe3();
      }
      if (unsubscribe4) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe4();
      }
    };
  }, [orderFlowAnalysisOptions, futureExpiry, timestampsArray]);
  console.log(niftyData);

  let number = 1;
  if (orderFlowAnalysisOptions.index === "NIFTY 50") {
    number = orderFlowAnalysisOptions.lotOrValue === "lot" ? 50 : 1;
  }
  if (orderFlowAnalysisOptions.index === "NIFTY BANK") {
    number = orderFlowAnalysisOptions.lotOrValue === "lot" ? 15 : 1;
  }

  if (!niftyData) return <>loading...</>;
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
      <div className="option-orderflowanalysis">
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
          >
            <StarBorderIcon />
          </div>{" "}
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
                    name="option-orderflowanalysis-index"
                    id="option-orderflowanalysis-index"
                    className="subpage-dropdown"
                    onChange={(e) => {
                      setOrderFlowAnalysisOptions({
                        ...orderFlowAnalysisOptions,
                        index: e.target.value,
                      });
                    }}
                    value={orderFlowAnalysisOptions.index}
                  >
                    <option value="NIFTY 50">Nifty 50</option>
                    <option value="NIFTY BANK">Nifty Bank</option>
                  </select>
                  <p>Select Indices</p>
                </div>
                <div className="dropdown-container">
                  <select
                    name="option-orderflowanalysis-time"
                    id="option-orderflowanalysis-time"
                    className="subpage-dropdown"
                    onChange={(e) => {
                      setOrderFlowAnalysisOptions({
                        ...orderFlowAnalysisOptions,
                        time: e.target.value,
                      });
                    }}
                  >
                    <option value={0}>Live</option>
                    <option value={0.5}>30 Seconds</option>
                    <option value={1}>1 Minute</option>
                    <option value={2}>2 Minutes</option>
                    <option value={3}>3 Minutes</option>
                    <option value={4}>4 Minutes</option>
                    <option value={5}>5 Minutes</option>
                  </select>
                  <p>Time</p>
                </div>

                <div className="dropdown-container">
                  <select
                    name="option-orderflowanalysis-lotorvalue"
                    id="option-orderflowanalysis-lotorvalue"
                    className="subpage-dropdown"
                    onChange={(e) => {
                      setOrderFlowAnalysisOptions({
                        ...orderFlowAnalysisOptions,
                        lotOrValue: e.target.value,
                      });
                    }}
                  >
                    <option value="lot">Lot Wise</option>
                    <option value="value">Value Wise</option>
                  </select>
                  <p>Lot Wise/Value Wise</p>
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      <div className={style.container}>
        {" "}
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              {/* call columns */}
              <th
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Time
              </th>
              <th>Index</th> <th>Changed over the period</th>{" "}
              <th>Nifty Future</th> <th>Nifty Future Change</th>{" "}
              <th>Nifty Future OI</th> <th>Nifty Future OI Change</th>
              <th>Total Buying Order</th>
              <th>Total Selling Order</th>
              <th>Difference</th>
              <th>Pressure of Buyer/Seller</th>
              <th>Total Buying Quantity</th>
              <th>Total Selling Quantity</th>
              <th>Difference</th>
              <th>Pressure of Buyer and Seller</th>
            </tr>
          </thead>
          <tbody>
            {timestampsArray.map((time, i) => {
              if (!oiNiftyData[i]) return null;
              return (
                <tr key={time}>
                  {/* call columns */}
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    {time}
                  </td>
                  <td>{niftyData[i]?.LTP}</td> <td>Changed </td>{" "}
                  <td>{oiNiftyData[i]?.LTP?.toFixed(0)}</td>{" "}
                  <td>
                    {" "}
                    {(oiNiftyData[i]?.LTP - oiNiftyData[i]?.Prev_Close).toFixed(
                      2
                    )}
                  </td>{" "}
                  <td>{oiNiftyData[i]?.OI?.toFixed(0) / number}</td>{" "}
                  <td>
                    {(oiBankNiftyData[i]?.OI - oiBankNiftyData[i]?.Prev_Close) /
                      number}
                  </td>
                  <td>TBD</td>
                  <td>Order</td>
                  <td>Difference</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>Difference</td>
                  <td>TBD</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
