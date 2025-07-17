import React, { useEffect, useState } from "react";
import "./Option.css";
function StrikePricewiseTable(props) {
  const {
    optionChainData,
    strikeArray,
    strikeData,
    viData,
    strikePriceWiseDataOptions,
    strikePriceData,
  } = props;

  // const [strikePriceData, setOptionChainData] = useState();
  const param = strikePriceWiseDataOptions.parameter;
  // useEffect(() => {
  //   setOptionChainData(optionChainData);
  // }, [optionChainData, strikeArray]);

  // if (!optionChainTable?.Calls || !optionChainTable?.Puts) return <>loading</>;
  let number = 1;
  if (strikePriceWiseDataOptions.index === "NIFTY") {
    number = strikePriceWiseDataOptions.lotOrValue === "lot" ? 50 : 1;
  }
  if (strikePriceWiseDataOptions.index === "BANKNIFTY") {
    number = strikePriceWiseDataOptions.lotOrValue === "lot" ? 15 : 1;
  }
  if (!strikePriceData) return <>loading...</>;
  // console.log(strikeData.calls[strikePrice]["IV"]);
  return (
    <div className={`overflowWrapper containerPadding`}>
      <table
        className="info-table"
        // style={{ width: "95%", marginLeft: "1rem", marginRight: "1rem" }}
        data-theme={props.theme}
      >
        <thead>
          <tr>
            <th colSpan={7}>Call</th>{" "}
            <th className="strike_prices" data-theme={props.theme}>
              Strike Prices
            </th>{" "}
            <th colSpan={7}>Put</th>
          </tr>
          <tr>
            {/* call columns */}
            <th>OI</th> <th>COI</th> <th>Volume</th> <th>IV</th>{" "}
            <th>IV Change</th> <th>LTP</th>
            <th>Probable Outcome</th>
            <th className="strike_prices" data-theme={props.theme}></th>
            {/* put columns */}
            <th>Probable Outcome</th>
            <th>LTP</th> <th>IV Change</th> <th>IV</th> <th>Volume</th>{" "}
            <th>COI</th> <th>OI</th>
          </tr>
        </thead>
        <tbody>
          {strikeArray?.map((strikePrice, index) => {
            // console.log(strikeArray.length / 2 - 0.5);
            // console.log(strikeData.Calls[strikePrice]["IV"]);
            const probableOutcome =
              strikePriceData.Puts[strikePrice]["LTP"] -
              strikePriceData.Calls[strikePrice]["LTP"];
            const ltpChangeCall = (
              strikePriceData.Calls[strikePrice][param] -
              strikePriceData.Calls[strikePrice]["Prev_Close"]
            ).toFixed(2);
            const ltpChangePuts = (
              strikePriceData.Calls[strikePrice][param] -
              strikePriceData.Calls[strikePrice]["Prev_Close"]
            ).toFixed(2);
            let callOutcome = "Bearish";
            let putOutcome = "Bullish";
            if (probableOutcome < 0) {
              callOutcome = "Bullish";
              putOutcome = "Bearish";
            }
            return (
              strikePriceData.Calls[strikePrice] &&
              strikePriceData.Puts[strikePrice] && (
                <tr key={index}>
                  <td>{strikePriceData.Calls[strikePrice]["OI"] / number}</td>
                  <td>
                    {(strikePriceData.Calls[strikePrice]["OI"] -
                      strikePriceData.Calls[strikePrice][
                        "Prev_Open_Int_Close"
                      ]) /
                      number}
                  </td>
                  <td>
                    {strikePriceData.Calls[strikePrice]["Volume"] / number}
                  </td>
                  <td>{strikeData?.Calls?.[strikePrice]?.["IV"]}</td>
                  <td>
                    {(
                      viData?.Calls?.[strikePrice]?.["IV"] -
                      strikeData?.Calls?.[strikePrice]?.["IV"]
                    ).toFixed(4)}
                  </td>
                  <td
                    style={{ color: `${ltpChangeCall < 0 ? "red" : "green"}` }}
                    className="textbold"
                  >
                    {/* ACTUAL LTP VALUE IN TABLE */}
                    {`${strikePriceData?.Calls[strikePrice]["LTP"]} (${ltpChangeCall})`}
                  </td>{" "}
                  {/* OUT COME  */}
                  {ltpChangeCall > 0 ? (
                    <td
                      style={{
                        backgroundColor:
                          callOutcome === "Bullish" ? "green" : "red",
                      }}
                    >
                      {callOutcome}
                    </td>
                  ) : (
                    <td>Neutral</td>
                  )}
                  {/* strike_prices */}
                  <td className="strike_prices" data-theme={props.theme}>
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
                      {strikePrice}
                    </b>
                  </td>
                  {/* OUT COME  */}
                  {ltpChangePuts > 0 ? (
                    <td
                      style={{
                        backgroundColor:
                          putOutcome === "Bullish" ? "green" : "red",
                      }}
                    >
                      {putOutcome}
                    </td>
                  ) : (
                    <td>Neutral</td>
                  )}
                  <td
                    style={{ color: `${ltpChangePuts < 0 ? "red" : "green"}` }}
                    className="textbold"
                  >
                    {/* ACTUAL LTP VALUE IN TABLE */}
                    {`${strikePriceData?.Puts[strikePrice]["LTP"]} (${ltpChangePuts})`}
                  </td>
                  <td>
                    {" "}
                    {(
                      viData?.Puts?.[strikePrice]?.["IV"] -
                      strikeData?.Puts?.[strikePrice]?.["IV"]
                    ).toFixed(4)}
                  </td>
                  <td>{strikeData?.Puts?.[strikePrice]?.["IV"]}</td>
                  <td>
                    {strikePriceData.Puts[strikePrice]["Volume"] / number}
                  </td>
                  <td>
                    {(strikePriceData.Puts[strikePrice]["OI"] -
                      strikePriceData.Puts[strikePrice][
                        "Prev_Open_Int_Close"
                      ]) /
                      number}
                  </td>
                  <td>{strikePriceData.Puts[strikePrice]["OI"] / number}</td>
                </tr>
              )
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StrikePricewiseTable;
