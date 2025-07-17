import React, { useEffect, useState } from "react";
import style from "./IntradayOptionChain.module.css";

import StarBorderIcon from "@mui/icons-material/StarBorder";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { CastForEducation, Edit, EditNote } from "@mui/icons-material";

import StarIcon from "@mui/icons-material/Star";
import { useFavourites } from "../../contexts/FavouritesContext";
function IntradayOptionChain(props) {
  const { data, strikeArray, ivValue, futureOI, intradaySignalsOptions } =
    props;
  let number = 1;
  if (intradaySignalsOptions.index === "NIFTY") {
    number = intradaySignalsOptions.lotOrValue === "lot" ? 50 : 1;
  }
  if (intradaySignalsOptions.index === "BANKNIFTY") {
    number = intradaySignalsOptions.lotOrValue === "lot" ? 15 : 1;
  }
  const [callScore, setCallScore] = useState(0);
  const [putScore, setPutScore] = useState(0);
  const [resultLoad, setResultLoad] = useState(true);
  const [result, setResult] = useState(0);
  // Retrieve checkValue from local storage on initial load
  const initialCheckValue = JSON.parse(
    localStorage.getItem("checkValueIOC")
  ) || {
    futureoi: 20,
    premiumdecay: 20,
    coi: 20,
    volume: 20,
    iv: 20,
  };

  const [checkValue, setCheckValue] = useState(initialCheckValue);

  const [allchecked, setAllChecked] = useState({
    futureoi: true,
    premiumdecay: true,
    coi: true,
    volume: true,
    iv: true,
  });
  // favourites options and functions
  const id = "optionchainscore";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Option Chain Score";
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

  function handleClose() {
    setResultLoad(false);
  }
  function handleChange(e) {
    const { name, checked } = e.target;
    // remove the checked value from allchecked
    setAllChecked((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
    // make value in checkValue 0 if not checked
    setCheckValue((prevState) => ({
      ...prevState,
      [name]: checked && 0,
    }));
  }
  const coiReEvaluate = (val) => {
    if (val > 10000000) {
      return Number((val / 1000000).toFixed(2));
    } else if (val > 1000000) {
      return Number((val / 100000).toFixed(2));
    } else {
      return Number((val / 10000).toFixed(2));
    }
  };
  // console.log(checkValue);
  // Function to save checkValue to local storage
  const saveToLocalStorage = () => {
    localStorage.setItem("checkValueIOC", JSON.stringify(checkValue));
  };
  const handleSubmit = () => {
    saveToLocalStorage();
    let count = 0;
    for (let key in checkValue) {
      count = count + +checkValue[key];
    }
    console.log(checkValue);
    if (count > 100) {
      window.alert("100 exceeded");
      return;
    }

    // Calculate total for Calls
    const totalCallIV = totalIVCall * (+checkValue.iv / 100) || 0;
    const totalCallCOI =
      coiReEvaluate(totalCOICall) * (+checkValue.coi / 100) || 0;
    const totalCallPremiumDecay =
      totalPremiumDecayCall * (+checkValue.premiumdecay / 100) || 0;
    const totalCOIByVolumeCall =
      totalCOIByVolCall * (+checkValue.volume / 100) || 0;

    const totalCall = (
      totalCallIV +
      totalCallCOI +
      totalCallPremiumDecay +
      totalCOIByVolumeCall
    ).toFixed(2);

    // Calculate total for Puts
    const totalPutIV = totalIVPut * (+checkValue.iv / 100) || 0;

    const totalPutCOI =
      coiReEvaluate(totalCOIPut) * (+checkValue.coi / 100) || 0;
    const totalPutPremiumDecay =
      totalPremiumDecayPut * (+checkValue.premiumdecay / 100) || 0;
    const totalCOIByVolumePut =
      totalCOIByVolPut * (+checkValue.volume / 100) || 0;
    const totalPut = (
      totalPutIV +
      totalPutCOI +
      totalPutPremiumDecay +
      totalCOIByVolumePut
    ).toFixed(2);

    // Calculate future OI modification value
    const futureOImod =
      coiReEvaluate(futureOI.OI) * (+checkValue.futureoi / 100) || 0;

    // Calculate total result
    const totalSum = totalPut - totalCall + futureOImod;
    // Create an object to store all the values
    const dataToStore = {
      totalSumIOC: totalSum.toFixed(2).toString(),
      callScore: totalCall.toString(),
      putScore: totalPut.toString(),
    };

    // Convert the object to a JSON string and save it to local storage
    localStorage.setItem("scoreDataIOC", JSON.stringify(dataToStore));
    // Set state values
    setCallScore(totalCall);
    setPutScore(totalPut);
    setResult(totalSum.toFixed(2));
    setResultLoad(true);
  };
  // Calculate the default values for calls and puts
  useEffect(() => {
    handleSubmit();
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
  }, []);
  if (!data) return <>loading...</>;
  // TOTAL PREMIUM DECAY CALL
  const totalPremiumDecayCall = strikeArray
    .reduce((acc, curr) => {
      const change = Number(
        data.Calls[curr]?.LTP - data.Calls[curr]?.Prev_Close
      );

      return acc + change;
    }, 0)
    .toFixed(2);
  // TOTAL LTP CALL
  const totalLPTCall = strikeArray
    .reduce((acc, curr) => {
      return acc + data.Calls[curr]?.LTP;
    }, 0)
    .toFixed(2);
  // TOTAL LTP PUT
  const totalLTPPut = strikeArray
    .reduce((acc, curr) => {
      return acc + data.Puts[curr]?.LTP;
    }, 0)
    .toFixed(2);
  // TOTAL PREMIUM DECAY PUT
  const totalPremiumDecayPut = strikeArray
    .reduce((acc, curr) => {
      const change = Number(data.Puts[curr]?.LTP - data.Puts[curr]?.Prev_Close);
      return acc + change;
    }, 0)
    .toFixed(2);
  // Total COI CALL

  const totalCOICall = strikeArray.reduce((acc, curr) => {
    const change = Number(
      data?.Calls[curr]?.OI - data?.Calls[curr]?.Prev_Open_Int_Close
    );

    return acc + change;
  }, 0);
  // Total COI Put
  const totalCOIPut = strikeArray.reduce((acc, curr) => {
    const change = Number(
      data?.Puts[curr]?.OI - data?.Puts[curr]?.Prev_Open_Int_Close
    );

    return acc + change;
  }, 0);
  // Total volume CALL
  const totalVolumeCall = strikeArray.reduce((acc, curr) => {
    return acc + data.Calls[curr]?.Volume;
  }, 0);
  // Total volume Put
  const totalVolumePut = strikeArray.reduce((acc, curr) => {
    return acc + data.Puts[curr]?.Volume;
  }, 0);
  // Total IV Call
  const totalIVCall = strikeArray
    .reduce((acc, curr) => {
      return acc + ivValue?.Calls[curr]?.IV;
    }, 0)
    .toFixed(2);
  // Total IV Put
  const totalIVPut = strikeArray
    .reduce((acc, curr) => {
      return acc + ivValue?.Puts[curr]?.IV;
    }, 0)
    .toFixed(2);
  // Total COI/Volum
  const totalCOIByVolPut = strikeArray
    .reduce(
      (arr, curr) =>
        arr +
        (data.Puts[curr]?.OI - data.Puts[curr]?.Prev_Open_Int_Close) /
          data.Puts[curr]?.Volume,
      0
    )
    .toFixed(2);
  // Total COI/Volum
  const totalCOIByVolCall = strikeArray
    .reduce(
      (arr, curr) =>
        arr +
        (data.Calls[curr]?.OI - data.Calls[curr]?.Prev_Open_Int_Close) /
          data.Calls[curr]?.Volume,
      0
    )
    .toFixed(2);
  return (
    <div style={{ paddingBottom: "1rem " }}>
      <div
        className="overflowWrapper"
        style={{ margin: "0 2rem", paddingBottom: "2rem" }}
      >
        <div className="table-info-icons">
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
        <table
          className="info-table tableContainer"
          style={{ width: "100%" }}
          data-theme={props.theme}
        >
          <thead>
            <tr
              style={{
                border:
                  props.theme === "dark"
                    ? "1px solid rgba(0, 4, 18, 1)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <th colSpan={6} style={{ color: "green", border: "none" }}>
                Call
              </th>{" "}
              <th style={{ border: "none" }}></th>
              <th
                colSpan={6}
                style={{
                  color: "red",
                  border: "none",
                }}
              >
                Put
              </th>
            </tr>
            <tr>
              {/* call columns */}
              <th>COI/Volume</th>
              <th>IV</th>
              <th>Volume</th>
              <th>COI</th>
              <th>Premium Decay</th>
              <th>LTP</th>
              <th className="strike_prices textbold" data-theme={props.theme}>
                Strike Prices
              </th>
              {/* put columns */}
              <th>LTP</th> <th>Premium Decay</th> <th>COI</th>
              <th>Volume</th>
              <th>IV</th>
              <th>COI/Volume</th>
            </tr>
          </thead>
          <tbody>
            {strikeArray.map((strike, index) => {
              const callChange = (
                data.Calls[strike]?.LTP - data.Calls[strike]?.Prev_Close
              ).toFixed(2);
              const putChange = (
                data.Puts[strike]?.LTP - data.Puts[strike]?.Prev_Close
              ).toFixed(2);
              //Premium Decay Toatal

              return (
                <tr key={strike}>
                  {/* call columns */}
                  <td>
                    {(
                      (data.Calls[strike]?.OI -
                        data.Calls[strike]?.Prev_Open_Int_Close) /
                      data.Calls[strike]?.Volume
                    ).toFixed(2)}
                  </td>
                  <td>{ivValue?.Calls[strike]?.IV}</td>
                  <td>{data.Calls[strike]?.Volume}</td>
                  <td>
                    {(
                      (data?.Calls[strike]?.OI -
                        data?.Calls[strike]?.Prev_Open_Int_Close) /
                      number
                    ).toFixed(2)}
                  </td>
                  <td
                    style={{ color: `${callChange < 0 ? "red" : "green"}` }}
                    className="textbold"
                  >
                    {callChange}
                  </td>
                  <td
                    style={{ color: `${callChange < 0 ? "red" : "green"}` }}
                    className="textbold"
                  >
                    {data.Calls[strike]?.LTP}
                  </td>{" "}
                  <td
                    className="strike_prices textbold"
                    data-theme={props.theme}
                  >
                    <b
                      style={
                        index === strikeArray.length / 2 - 0.5
                          ? {
                              color: "rgb(30,64,186)",
                              backgroundColor:
                                props.theme === "dark" ? "#27293b" : "#D0D2DE",
                              padding: "4px",
                            }
                          : {}
                      }
                    >
                      {strike}
                    </b>
                  </td>
                  {/* put columns */}
                  <td
                    style={{ color: `${putChange < 0 ? "red" : "green"}` }}
                    className="textbold"
                  >
                    {data.Puts[strike]?.LTP}
                  </td>
                  <td
                    style={{ color: `${putChange < 0 ? "red" : "green"}` }}
                    className="textbold"
                  >
                    {putChange}
                  </td>
                  <td>
                    {data.Puts[strike]?.OI -
                      data.Puts[strike]?.Prev_Open_Int_Close}
                  </td>
                  <td>{data.Puts[strike]?.Volume}</td>
                  <td>{ivValue?.Puts[strike]?.IV}</td>{" "}
                  <td>
                    {(
                      (data.Puts[strike]?.OI -
                        data.Puts[strike]?.Prev_Open_Int_Close) /
                      data.Puts[strike]?.Volume
                    ).toFixed(2)}
                  </td>
                </tr>
              );
            })}
            <tr className="textbold">
              {/* COI / VOLUME CALL COLUMN */}
              <td>{totalCOIByVolCall}</td>
              {/* IV DATA CALL COLUMN */}
              <td>{totalIVCall}</td>
              {/* Volume of Calls */}
              <td>{totalVolumeCall}</td>
              {/* COI Column */}
              <td>{totalCOICall}</td>
              <td
                style={{ color: totalPremiumDecayCall < 0 ? "red" : "green" }}
              >
                {totalPremiumDecayCall}
              </td>
              {/* NEED TO FIND THE FORMULA  */}
              <td
                style={{ color: totalPremiumDecayCall < 0 ? "red" : "green" }}
              >
                {totalLPTCall}
              </td>
              <td className="strike_prices textbold" data-theme={props.theme}>
                TOTAL
              </td>
              <td style={{ color: totalPremiumDecayPut < 0 ? "red" : "green" }}>
                {totalLTPPut}
              </td>
              <td style={{ color: totalPremiumDecayPut < 0 ? "red" : "green" }}>
                {totalPremiumDecayPut}
              </td>
              {/* Total COI Put Column */}
              <td>{totalCOIPut}</td>
              {/* TOTAL VOLUME PUT COLUMN */}
              <td>{totalVolumePut}</td>
              {/* TOTAL IV PUT COLUMN */}
              <td>{totalIVPut}</td>
              {/* COI / VOLUME PUT COLUMN */}
              <td>{totalCOIByVolPut}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {resultLoad ? (
        <div
          style={{
            position: "relative",
            backgroundColor: "inherit",
            maxWidth: "300px",
            margin: "auto",
            textAlign: "center",
            paddingBottom: "1rem",
          }}
        >
          <h4>Final Score</h4>
          <table className={style.tableContainer} data-theme={props.theme}>
            <tr>
              <td>Call Score</td>
              <td>{callScore}</td>
            </tr>
            <tr>
              <td>Put Score</td>
              <td>{putScore}</td>
            </tr>
            <tr>
              <td>Final Score</td>
              <td style={{ color: result < 0 ? "red" : "green" }}>{result}</td>
            </tr>
          </table>

          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              color: "gray",
              backgroundColor: "inherit",
              cursor: "pointer",
            }}
            onClick={handleClose}
          >
            <ModeEditIcon />
          </div>
        </div>
      ) : (
        <div className={style.card_container} data-theme={props.theme}>
          {" "}
          <h1 className={style.item} data-theme={props.theme}>
            Parameter
          </h1>
          <div className={style.item_container} data-theme={props.theme}>
            <div className={style.item} data-theme={props.theme}>
              Future OI
            </div>
            <div className={style.items}>
              <div className={style.checkbox}>
                <input
                  data-theme={props.theme}
                  onChange={handleChange}
                  className={style.input_text}
                  value={allchecked.futureoi}
                  checked={allchecked.futureoi}
                  name="futureoi"
                  type="checkbox"
                />
              </div>
              <div className={style.weightage}>
                <input
                  data-theme={props.theme}
                  type="number"
                  className={style.input_text}
                  placeholder="Weightage"
                  value={checkValue.futureoi}
                  disabled={!allchecked.futureoi}
                  onChange={(e) => {
                    setCheckValue({
                      ...checkValue,
                      futureoi: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className={style.item_container}>
            <div className={style.item} data-theme={props.theme}>
              Premium Decay
            </div>
            <div className={style.items}>
              <div className={style.checkbox}>
                <input
                  data-theme={props.theme}
                  onChange={handleChange}
                  className={style.input_text}
                  value={allchecked.premiumdecay}
                  checked={allchecked.premiumdecay}
                  type="checkbox"
                  name="premiumdecay"
                />
              </div>
              <div className={style.weightage}>
                <input
                  data-theme={props.theme}
                  type="number"
                  className={style.input_text}
                  placeholder="Weightage"
                  value={checkValue.premiumdecay}
                  disabled={!allchecked.premiumdecay}
                  onChange={(e) => {
                    setCheckValue({
                      ...checkValue,
                      premiumdecay: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className={style.item_container}>
            <div className={style.item} data-theme={props.theme}>
              Change in OI
            </div>
            <div className={style.items}>
              <div className={style.checkbox}>
                <input
                  data-theme={props.theme}
                  onChange={handleChange}
                  className={style.input_text}
                  value={allchecked.coi}
                  checked={allchecked.coi}
                  type="checkbox"
                  name="coi"
                />
              </div>
              <div className={style.weightage}>
                <input
                  data-theme={props.theme}
                  type="number"
                  className={style.input_text}
                  placeholder="Weightage"
                  value={checkValue.coi}
                  disabled={!allchecked.coi}
                  onChange={(e) => {
                    setCheckValue({
                      ...checkValue,
                      coi: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className={style.item_container}>
            <div className={style.item} data-theme={props.theme}>
              COI/Volume
            </div>
            <div className={style.items}>
              <div className={style.checkbox}>
                <input
                  data-theme={props.theme}
                  onChange={handleChange}
                  value={allchecked.volume}
                  checked={allchecked.volume}
                  className={style.input_text}
                  type="checkbox"
                  name="volume"
                />
              </div>
              <div className={style.weightage}>
                <input
                  data-theme={props.theme}
                  type="number"
                  className={style.input_text}
                  placeholder="Weightage"
                  value={checkValue.volume}
                  disabled={!allchecked.volume}
                  onChange={(e) => {
                    setCheckValue({
                      ...checkValue,
                      volume: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className={style.item_container}>
            <div className={style.item} data-theme={props.theme}>
              IV
            </div>
            <div className={style.items}>
              <div className={style.checkbox}>
                <input
                  data-theme={props.theme}
                  onChange={handleChange}
                  value={allchecked.iv}
                  checked={allchecked.iv}
                  className={style.input_text}
                  type="checkbox"
                  name="iv"
                />
              </div>
              <div className={style.weightage}>
                <input
                  data-theme={props.theme}
                  type="number"
                  className={style.input_text}
                  placeholder="Weightage"
                  value={checkValue.iv}
                  disabled={!allchecked.iv}
                  onChange={(e) => {
                    setCheckValue({
                      ...checkValue,
                      iv: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <button
            className={style.saveBtn}
            type="button"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export default IntradayOptionChain;
