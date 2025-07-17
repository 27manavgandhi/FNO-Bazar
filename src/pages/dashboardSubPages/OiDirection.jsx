import React, { useEffect, useState } from "react";
import style from "./IntradayOptionChain.module.css";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import StarIcon from "@mui/icons-material/Star";
import { useFavourites } from "../../contexts/FavouritesContext";
function OiDirection(props) {
  const { data, strikeArray, intradaySignalsOptions } = props;
  // favourites options and functions
  const id = "oidirection";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "OI Direction";
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

  let number = 1;
  if (intradaySignalsOptions.index === "NIFTY") {
    number = intradaySignalsOptions.lotOrValue === "lot" ? 50 : 1;
  }
  if (intradaySignalsOptions.index === "BANKNIFTY") {
    number = intradaySignalsOptions.lotOrValue === "lot" ? 15 : 1;
  }
  if (!data) return <>loading...</>;
  const putTotal = strikeArray.reduce((acc, curr) => {
    const change = Number(
      data.Puts[curr].OI - data.Puts[curr].Prev_Open_Int_Close
    );

    return acc + change;
  }, 0);

  const callTotal = strikeArray
    .reduce((acc, curr) => {
      const change = Number(
        data.Calls[curr].OI - data.Calls[curr].Prev_Open_Int_Close
      );

      return acc + change;
    }, 0)
    .toFixed(2);
  const PCR = Math.abs(putTotal) / Math.abs(callTotal);
  const Outcome =
    callPercent() >= 60
      ? "Selling Pressure"
      : callPercent() >= 40
      ? "Range Bound"
      : "Buying Pressure";
  function callPercent() {
    const sumOfCallPut = Math.abs(callTotal) + Math.abs(putTotal);
    return ((Math.abs(callTotal) / sumOfCallPut) * 100).toFixed(2);
  }
  function putPercent() {
    const sumOfCallPut = Math.abs(callTotal) + Math.abs(putTotal);
    return ((Math.abs(putTotal) / sumOfCallPut) * 100).toFixed(2);
  }
  return (
    <div
      className={style.container}
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
        className="info-table"
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
            <th colSpan={2} style={{ color: "green", border: "none" }}>
              Call
            </th>{" "}
            <th style={{ border: "none" }}></th>
            <th
              colSpan={2}
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
            <th>OI</th> <th>Change</th>
            <th className="strike_prices textbold" data-theme={props.theme}>
              {" "}
              Strike Prices
            </th>
            {/* put columns */}
            <th>Change</th> <th>OI</th>
          </tr>
        </thead>

        <tbody>
          {strikeArray.map((strike, index) => {
            const callChange = (
              data.Calls[strike].OI - data.Calls[strike].Prev_Open_Int_Close
            ).toFixed(2);
            const putChange = (
              data.Puts[strike].OI - data.Puts[strike].Prev_Open_Int_Close
            ).toFixed(2);
            return (
              <tr key={strike}>
                {/* call columns */}
                <td>{data.Calls[strike].OI / number}</td>{" "}
                <td
                  style={{ color: `${callChange < 0 ? "red" : "green"}` }}
                  className="textbold"
                >
                  {callChange / number}
                </td>
                <td className="strike_prices textbold" data-theme={props.theme}>
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
                  {putChange / number}
                </td>{" "}
                <td>{data.Puts[strike].OI / number}</td>
              </tr>
            );
          })}

          <tr
            style={{
              border:
                props.theme === "dark"
                  ? "1px solid rgba(0, 4, 18, 1)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {" "}
            <td style={{ border: "none" }}></td>
            <td style={{ border: "none" }}>
              {strikeArray
                .reduce((acc, curr) => {
                  const change = Number(
                    (
                      data.Calls[curr].OI - data.Calls[curr].Prev_Open_Int_Close
                    ).toFixed(2)
                  );

                  return acc + change;
                }, 0)
                .toFixed(2) / number}
            </td>
            <td style={{ border: "none" }}></td>
            <td style={{ border: "none" }}>
              {strikeArray
                .reduce((acc, curr) => {
                  const change = Number(
                    (
                      data.Puts[curr].OI - data.Puts[curr].Prev_Open_Int_Close
                    ).toFixed(2) / number
                  );

                  return acc + change;
                }, 0)
                .toFixed(2) / number}
            </td>
            <td style={{ border: "none" }}></td>
          </tr>
        </tbody>
      </table>
      <div
        style={{
          position: "relative",
          backgroundColor: "inherit",
          maxWidth: "300px",
          margin: "auto",
          textAlign: "center",
          padding: ".5rem",
        }}
      >
        <h4>Outcome</h4>
        <table className={style.tableContainer} data-theme={props.theme}>
          <tr>
            <td>Call Side</td>
            <td>{callPercent()}%</td>
          </tr>
          <tr>
            <td>Put Side</td>
            <td>{putPercent()}%</td>
          </tr>
          <tr>
            <td>PCR</td>
            <td style={{ color: PCR < 1 ? "red" : "green" }}>
              {PCR.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>Outcome</td>
            <td
              style={{
                color:
                  Outcome === "Buying Pressure"
                    ? "green"
                    : Outcome === "Selling Pressure"
                    ? "red"
                    : "black",
              }}
            >
              {Outcome}
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
}

export default OiDirection;
