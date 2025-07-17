import React, { useEffect, useState } from "react";
import "./Option.css";
function OptionChainTable(props) {
  const { optionChainData, optionChainOptions, strikeArray, viData } = props;
  // const [optionChainData, setOptionChainData] = useState();
  let number = 1;
  if (optionChainOptions.index === "NIFTY") {
    number = optionChainOptions.lotOrValue === "lot" ? 50 : 1;
  }
  if (optionChainOptions.index === "BANKNIFTY") {
    number = optionChainOptions.lotOrValue === "lot" ? 15 : 1;
  }
  // useEffect(() => {
  //   setOptionChainData(optionChainData);
  // }, [optionChainData, optionChainOptions]);
  console.log(viData);

  return (
    <div className={"overflowWrapper containerPadding"}>
      <table className="info-table" data-theme={props.theme}>
        <thead>
          <tr>
            <th colSpan={10}>Call</th>{" "}
            <th className="strike_prices " data-theme={props.theme}>
              Strike Prices
            </th>{" "}
            <th colSpan={10}>Put</th>
          </tr>
          <tr>
            {/* call columns */}
            <th>OI</th>
            <th>COI</th>
            <th>Volume</th>
            <th>Change Vol</th> <th>IV</th>
            <th>LTP</th>
            <th>Bid Quantity</th>
            <th>Bid Price</th>
            <th>Ask Price</th> <th>Ask Quantity</th>
            <th className="strike_prices" data-theme={props.theme}></th>
            {/* put columns */}
            <th className="askQuantity">Ask Quantity</th>
            <th>Ask Price</th> <th>Bid Price</th>
            <th>Bid Quantity</th>
            <th>LTP</th> <th>IV</th>
            <th>Change Vol</th>
            <th>Volume</th> <th>COI</th>
            <th>OI</th>
          </tr>
        </thead>
        <tbody>
          {strikeArray.map((strikePrice, index) => {
            // console.log(strikeArray.length / 2 - 0.5);
            const callChange = (
              optionChainData.Calls[strikePrice]?.LTP -
              optionChainData.Calls[strikePrice]?.Prev_Close
            ).toFixed(2);
            const putChange = (
              optionChainData.Puts[strikePrice]?.LTP -
              optionChainData.Puts[strikePrice]?.Prev_Close
            ).toFixed(2);
            return (
              <React.Fragment key={index}>
                {optionChainData.Calls[strikePrice] &&
                  optionChainData.Puts[strikePrice] && (
                    <tr key={index}>
                      <td>
                        {optionChainData.Calls[strikePrice]["OI"] / number}
                      </td>
                      <td>
                        {(optionChainData.Calls[strikePrice]["OI"] -
                          optionChainData.Calls[strikePrice][
                            "Prev_Open_Int_Close"
                          ]) /
                          number}
                      </td>
                      <td>
                        {optionChainData.Calls[strikePrice]["Volume"] / number}
                      </td>
                      <td>
                        {(optionChainData.Calls[strikePrice]["Volume"] -
                          optionChainData.Calls[strikePrice]["LTQ"]) /
                          number}
                      </td>
                      <td>{viData?.Calls?.[strikePrice]?.["IV"]}</td>

                      <td
                        style={{
                          color: `${callChange < 0 ? "red" : "green"}`,
                          minWidth: "125px",
                        }}
                        className="textbold"
                      >
                        {/* ACTUAL LTP VALUE IN TABLE */}
                        {`${optionChainData.Calls[strikePrice]["LTP"]} (${callChange})`}
                      </td>

                      <td>{optionChainData.Calls[strikePrice]["Bid_Qty"]}</td>
                      <td>{optionChainData.Calls[strikePrice]["Bid"]}</td>
                      <td>{optionChainData.Calls[strikePrice]["Ask"]}</td>
                      <td>{optionChainData.Calls[strikePrice]["Ask_Qty"]}</td>
                      <td
                        className="strike_prices textbold"
                        data-theme={props.theme}
                      >
                        <b
                          style={
                            index === strikeArray.length / 2 - 0.5
                              ? {
                                  color: "#284091",
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

                      <td>{optionChainData.Puts[strikePrice]["Ask_Qty"]}</td>
                      <td>{optionChainData.Puts[strikePrice]["Ask"]}</td>
                      <td>{optionChainData.Puts[strikePrice]["Bid"]}</td>
                      <td>{optionChainData.Puts[strikePrice]["Bid_Qty"]}</td>
                      <td
                        style={{
                          color: `${putChange < 0 ? "red" : "green"}`,
                          minWidth: "125px",
                        }}
                        className="textbold"
                      >
                        {/* ACTUAL LTP VALUE IN TABLE */}
                        {/* LTP CHANGE FORMULA  */}
                        {`${optionChainData.Puts[strikePrice]["LTP"]} (${putChange})`}
                      </td>
                      <td>{viData?.Puts?.[strikePrice]?.["IV"]}</td>

                      <td>
                        {(optionChainData.Puts[strikePrice]["Volume"] -
                          optionChainData.Puts[strikePrice]["LTQ"]) /
                          number}
                      </td>
                      <td>
                        {optionChainData.Puts[strikePrice]["Volume"] / number}
                      </td>
                      <td>
                        {(optionChainData.Puts[strikePrice]["OI"] -
                          optionChainData.Puts[strikePrice][
                            "Prev_Open_Int_Close"
                          ]) /
                          number}
                      </td>
                      <td>
                        {optionChainData.Puts[strikePrice]["OI"] / number}
                      </td>
                    </tr>
                  )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OptionChainTable;
