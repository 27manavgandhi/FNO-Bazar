import React, { useState } from "react";
import style from "./PortfolioStock.module.css";
import TextField from "@mui/material/TextField";
import { Search } from "@mui/icons-material";
import { Button, InputAdornment } from "@mui/material";
function PortfolioStock(props) {
  const {
    searchString,
    strikePrice,
    stockData,
    searchHandler,
    onSubmitHandle,
    holdingData,
    onSubmitStockSellHandle,
  } = props;
  const [loading, setLoading] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [inputPrice, setInputPrice] = useState(0);
  const [inputDate, setInputDate] = useState("");
  // strikePrice.length===0 ????????????
  console.log(Object.values(stockData));
  if (Object.values(stockData).length === 0) return <>loading...</>;
  const submitHandle = (strike) => {
    console.log(stockData[strike].LTP, inputValue, inputPrice);
    onSubmitHandle(strike, Number(inputPrice), Number(inputValue), inputDate);
    setLoading(null);
  };

  return (
    <div className={style.stockDetailsContainer}>
      <div className={style.searchBarContainer}>
        <TextField
          className={style.searchBar}
          label=""
          id="fullWidth"
          onChange={searchHandler}
          value={searchString}
          focused={false}
          placeholder="ADANIPOWERS, RELIANCE, ITC, INFY, TCS, TATASTEEL, ..."
          sx={{
            "& .MuiInputBase-input": {
              color: props.theme === "dark" ? "white" : "black",
              backgroundColor: props.theme === "dark" ? "#181a26" : "white",
              borderRadius: "20px",
            },

            borderRadius: "20px",
            backgroundColor: props.theme === "dark" ? "#181a26" : "white",
            color: props.theme === "dark" ? "white" : "black",
            fontSize: "1.2rem",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{
                  color: "gray",
                }}
              >
                <Search />
              </InputAdornment>
            ),
          }}
        />{" "}
      </div>{" "}
      <div className={style.stocktableContainer}>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              {/* call columns */}
              <th className={style.strike_prices} data-theme={props.theme}>
                Strike Price
              </th>
              <th>ATP</th> <th>LTP</th> <th>High</th> <th>Low</th> <th>Open</th>{" "}
              <th>Volume</th>
              <th>LTQ</th>
              <th>Buy/Sell</th>
            </tr>
          </thead>
          <tbody>
            {strikePrice
              .filter((item) => {
                return searchString === ""
                  ? item
                  : item.toLowerCase().includes(searchString.toLowerCase());
              })
              .map((strike, i) => {
                const callChange = (
                  stockData[strike]?.LTP - stockData[strike]?.Prev_Close
                )?.toFixed(2);
                let condition = false;
                return (
                  <React.Fragment key={strike}>
                    <tr>
                      {/* call columns */}
                      <td
                        className={style.strike_prices}
                        data-theme={props.theme}
                      >
                        {strike}
                      </td>
                      <td>{stockData[strike].ATP}</td>{" "}
                      <td
                        style={{
                          color: `${callChange < 0 ? "red" : "green"}`,
                          minWidth: "125px",
                        }}
                        className="textbold"
                      >
                        {/* ACTUAL LTP VALUE IN TABLE */}
                        {`${stockData[strike]["LTP"]} (${callChange})`}
                      </td>
                      <td>{stockData[strike].High}</td>{" "}
                      <td>{stockData[strike].Low}</td>{" "}
                      <td>{stockData[strike].Open}</td>{" "}
                      <td>{stockData[strike].Volume}</td>
                      <td>{stockData[strike].LTQ}</td>
                      <td>
                        <Button
                          type="button"
                          className="buy-sell-button"
                          variant="contained"
                          onClick={(e) => setLoading(i)}
                        >
                          Buy/Sell
                        </Button>
                      </td>
                    </tr>
                    {loading === i && ( // Conditionally render additional row below clicked row
                      <tr
                        className={style.table_wrapper}
                        data-theme={props.theme}
                      >
                        <td colSpan={9}>
                          <div className={style.item_container}>
                            <div className={style.option_price}>
                              <TextField
                                value={inputPrice}
                                type="number"
                                onChange={(e) => setInputPrice(e.target.value)}
                                focused={false}
                                placeholder={`
                              Buy/Sell Price`}
                                sx={{
                                  "& .MuiInputBase-input": {
                                    color:
                                      props.theme === "dark"
                                        ? "white"
                                        : "black",
                                    backgroundColor:
                                      props.theme === "dark"
                                        ? "#181a26"
                                        : "rgba(224, 224, 228, 1)",
                                    borderRadius: "15px",
                                    padding: " .51rem  1.5rem",
                                  },
                                  width: "200px",

                                  borderRadius: "15px",
                                  backgroundColor:
                                    props.theme === "dark"
                                      ? "#181a26"
                                      : "rgba(224, 224, 228, 1)",
                                  color:
                                    props.theme === "dark" ? "white" : "black",
                                  fontSize: "1rem",
                                  border: "none",
                                  "& fieldset": { border: "none" },
                                }}
                              />
                              <span>Total Amount</span>
                            </div>
                            <div>
                              <div className={style.quantity}>
                                <div
                                  onClick={() =>
                                    setInputValue((pre) =>
                                      pre <= 0 ? 0 : pre - 1
                                    )
                                  }
                                  className={style.value_button}
                                  id={style.decrease}
                                >
                                  -
                                </div>
                                <TextField
                                  type="number"
                                  onChange={(e) =>
                                    setInputValue(e.target.value)
                                  }
                                  // className={style.input_number}
                                  value={inputValue}
                                  focused={false}
                                  placeholder={`
                              Buy/Sell Price`}
                                  sx={{
                                    "& .MuiInputBase-input": {
                                      color:
                                        props.theme === "dark"
                                          ? "white"
                                          : "black",
                                      backgroundColor:
                                        props.theme === "dark"
                                          ? "#181a26"
                                          : "rgba(224, 224, 228, 1)",
                                      borderRadius: "15px",
                                      padding: " .51rem  1.5rem",
                                      width: "20px",
                                    },

                                    borderRadius: "15px",
                                    backgroundColor:
                                      props.theme === "dark"
                                        ? "#181a26"
                                        : "rgba(224, 224, 228, 1)",
                                    color:
                                      props.theme === "dark"
                                        ? "white"
                                        : "black",
                                    fontSize: "1rem",
                                    border: "none",
                                    "& fieldset": { border: "none" },
                                  }}
                                />

                                <div
                                  onClick={(e) => setInputValue(inputValue + 1)}
                                  className={style.value_button}
                                  id="increase"
                                >
                                  +
                                </div>
                              </div>
                              Total Quantity
                            </div>
                            <div className={style.date}>
                              <input
                                type="date"
                                value={inputDate}
                                onChange={(e) => setInputDate(e.target.value)}
                                style={{
                                  width: "100%",
                                  backgroundColor:
                                    props.theme === "dark"
                                      ? "#181a26"
                                      : "rgba(224, 224, 228, 1)",
                                  color:
                                    props.theme === "dark" ? "white" : "black",
                                }}
                              />
                              <span>Purchase Date</span>
                            </div>
                            {/* <Button
                              variant="contained"
                              color="error"
                              onClick={() => submitHandleSell(strike)}
                            >
                              Sell
                            </Button> */}
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => submitHandle(strike)}
                            >
                              Buy
                            </Button>
                            <Button
                              onClick={() => setLoading(null)}
                              variant="outlined"
                            >
                              Close
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PortfolioStock;
