import React, { useState } from "react";
import style from "./PortfolioStock.module.css";
import TextField from "@mui/material/TextField";
import { Search } from "@mui/icons-material";
import { Button, InputAdornment } from "@mui/material";
function PortfolioOption(props) {
  const {
    setPortfolioOptions,
    portfolioOptions,
    setExpiry,
    portfolioData,
    strikeArray,
    onSubmitOptionHandle,
    onSubmitOptionSellHandle,
    expiry,
    optionSearchString,
    optionSearchHandler,

    indexWiseExpiry,
  } = props;
  const [loading, setLoading] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [inputPrice, setInputPrice] = useState(0);
  const [inputDate, setInputDate] = useState("");
  const submitHandle = (strike) => {
    console.log(strike, inputValue, inputPrice);
    onSubmitOptionHandle(strike, inputPrice, inputValue, inputDate);
    setLoading(null);
  };
  const submitHandleSell = (symbol) => {
    onSubmitOptionSellHandle(symbol, inputPrice, inputValue, inputDate);
    setLoading(null);
  };
  function extractOptionDetails(symbol) {
    // Extract underlying index, last 5 digits, and option type using substring method
    const underlyingIndex = symbol.substring(0, 5);
    const lastFiveDigits = symbol.substring(5, 10);
    const optionType = symbol.substring(symbol.length - 2);

    // Check if the underlying index is either NIFTY or BANKNIFTY
    if (underlyingIndex === "NIFTY" || underlyingIndex === "BANKNIFTY") {
      // Check if the lastFiveDigits consist of digits
      if (/^\d+$/.test(lastFiveDigits)) {
        // Check if the option type is either CE or PE
        if (optionType === "CE" || optionType === "PE") {
          return ` ${underlyingIndex} ${lastFiveDigits} ${optionType} `;
        }
      }
    }

    return null; // Return null if the symbol format doesn't match
  }

  // console.log(portfolioData?.Calls["21850"]);
  if (!portfolioData) return <>loading...</>;
  return (
    <div style={{ width: "100%", padding: "1rem" }}>
      {/* // not in the app version  */}
      {/* <div className="option-optionchain subpage">
        <div className="subpage-dropdowns-container">
          <div className="dropdown-container">
            <select
              name="option-straddleandstrangle-index"
              id="option-straddleandstrangle-index"
              className="subpage-dropdown"
              onChange={(e) => {
                setExpiry(e.target.value);
              }}
              value={expiry}
            >
              {portfolioOptions.index === "NIFTY" ? (
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
            <p>Select Expiry</p>
          </div>
          <div className="dropdown-container">
            <select
              name="option-straddleandstrangle-index"
              id="option-straddleandstrangle-index"
              className="subpage-dropdown"
              onChange={(e) => {
                setPortfolioOptions({
                  ...portfolioOptions,
                  index: e.target.value,
                });
              }}
              value={portfolioOptions.index}
            >
              <option value="NIFTY">Nifty</option>
              <option value="BANKNIFTY">BankNifty</option>
            </select>
            <p>Select Index</p>
          </div>
        </div>
      </div> */}
      <div className={style.searchBarContainer}>
        <TextField
          style={{ width: "47%" }}
          label=""
          id="fullWidth"
          onChange={optionSearchHandler}
          value={optionSearchString}
          focused={false}
          placeholder="Search Options, NIFTY, BANKNIFTY..."
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
        />
      </div>

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
          {strikeArray
            ?.filter((item) => {
              return optionSearchString === ""
                ? item
                : item.toString().includes(optionSearchString.toString());
            })
            .map((strike, i) => {
              const callChange = (
                portfolioData?.Calls[strike]?.LTP -
                portfolioData?.Calls[strike]?.Prev_Close
              )?.toFixed(2);
              return (
                <React.Fragment key={strike}>
                  <tr>
                    {/* call columns */}
                    <td
                      className={style.strike_prices}
                      data-theme={props.theme}
                    >
                      {extractOptionDetails(
                        portfolioData?.Calls[strike]?.Symbol
                      )}
                    </td>
                    <td>{portfolioData?.Calls[strike]?.ATP}</td>
                    <td
                      style={{
                        color: `${callChange < 0 ? "red" : "green"}`,
                        minWidth: "125px",
                      }}
                      className="textbold"
                    >
                      {/* ACTUAL LTP VALUE IN TABLE */}
                      {`${portfolioData.Calls[strike]["LTP"]} (${callChange})`}
                    </td>
                    <td>{portfolioData.Calls[strike].High}</td>
                    <td>{portfolioData.Calls[strike].Low}</td>
                    <td>{portfolioData.Calls[strike].Open}</td>
                    <td>{portfolioData.Calls[strike].Volume}</td>
                    <td>{portfolioData.Calls[strike].LTQ}</td>
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
                                    props.theme === "dark" ? "white" : "black",
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
                            Total Amount
                          </div>
                          <div>
                            <div className={style.quantity}>
                              <div
                                onClick={(e) =>
                                  setInputValue(
                                    inputValue < 1 ? 0 : inputValue - 1
                                  )
                                }
                                className={style.value_button}
                                id={style.decrease}
                              >
                                -
                              </div>
                              <TextField
                                type="number"
                                onChange={(e) => setInputValue(e.target.value)}
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
                                    props.theme === "dark" ? "white" : "black",
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
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => submitHandleSell(strike)}
                          >
                            Sell
                          </Button>
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
  );
}

export default PortfolioOption;
