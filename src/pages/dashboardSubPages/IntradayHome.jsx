import React, { useState } from "react";
import FilterSVG from "../../components/FilterSVG";
import { Box, Button, Modal } from "@mui/material";
import style from "./intradayhome.module.css";
import StarBorderIcon from "@mui/icons-material/StarBorder";
const IntradayHome = (props) => {
  const [toggleButton, setToggleButton] = useState(false);
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
    <div className={style.intradayContainer}>
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
          <h6>Intraday Data Dashboard</h6>
          <Button
            style={{ width: "max-content" }}
            // onClick={() =>
            //   updateOptionChainOptions({
            //     ...snsOptions,
            //     option:
            //       snsOptions.option === "Straddle" ? "Strangle" : "Straddle",
            //   })
            // }
            variant="outlined"
          >
            Nifty 50
          </Button>
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
                    name="option-straddleandstrangle-index"
                    id="option-straddleandstrangle-index"
                    className="subpage-dropdown"
                    // onChange={(e) => {
                    //   updateOptionChainOptions({
                    //     ...snsOptions,
                    //     index: e.target.value,
                    //   });
                    // }}
                    // value={snsOptions.index}
                  >
                    <option value="NIFTY">Nifty 50</option>
                    <option value="BANKNIFTY">Nifty Bank</option>
                  </select>
                  <p>Select Indices</p>
                </div>
                <div className="dropdown-container">
                  <button
                    // onClick={lockAllStrikePrice}
                    style={{
                      backgroundColor:
                        props.theme === "dark"
                          ? "rgba(38, 40, 47, 0.6)"
                          : "rgba(224, 224, 228, 1)",
                      borderRadius: "1.25rem",
                      padding: "1rem 2rem 1rem 1rem",
                      color: props.theme === "dark" ? "white" : "black",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: "1.15rem",
                    }}
                  >
                    {/* {lockAll ? "Unlock" : "Lock"} All Strike Price */}
                  </button>
                  <p>Toggle All Strike Price</p>
                </div>
                <div className="dropdown-container">
                  <select
                    name="option-optionchain-expiry"
                    id="option-optionchain-expiry"
                    className="subpage-dropdown"
                    // onChange={(e) => {
                    //   updateOptionChainOptions({
                    //     ...snsOptions,
                    //     expiry: e.target.value,
                    //   });
                    //   setExpiry(e.target.value);
                    // }}
                    // value={snsOptions.expiry}
                  >
                    {/* {snsOptions.index === "NIFTY" ? (
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
                    )} */}
                  </select>
                  <p>Expiry</p>
                </div>
                <div className="dropdown-container">
                  <select
                    name="option-optionchain-numstrikeprice"
                    id="option-optionchain-numstrikeprice"
                    className="subpage-dropdown"
                    // onChange={(e) => {
                    //   updateOptionChainOptions({
                    //     ...snsOptions,
                    //     numStrikePrice: e.target.value,
                    //   });
                    // }}
                    // value={snsOptions.numStrikePrice}
                  >
                    <option value={"3"}>3</option>
                    <option value={"5"}>5</option>
                    <option value={"7"}>7</option>
                  </select>
                  <p>Strike Prices</p>
                </div>
                <div className="dropdown-container">
                  <select
                    name="option-straddleandstrangle-time"
                    id="option-straddleandstrangle-time"
                    className="subpage-dropdown"
                    // onChange={(e) => {
                    //   updateOptionChainOptions({
                    //     ...snsOptions,
                    //     time: e.target.value,
                    //   });
                    //   setTime(e.target.value);
                    // }}
                    // value={snsOptions.time}
                  >
                    <option value={"0"}>Live</option>
                    <option value={"1"}>1 Minute</option>
                    <option value={"2"}>2 Minutes</option>
                    <option value={"3"}>3 Minutes</option>
                    <option value={"4"}>4 Minutes</option>
                    <option value={"5"}>5 Minutes</option>
                  </select>
                  <p>Time</p>
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
      <div className={style.container}>
        <div className={style.tablewrapper}>
          <table className={style.tableContainer} data-theme={props.theme}>
            <thead>
              <tr>
                {/* call columns */}
                <th
                  className={`${style.strike_prices} textbold`}
                  data-theme={props.theme}
                >
                  Parameter
                </th>
                <th style={{ color: "green" }}>Call</th>{" "}
                <th style={{ color: "red" }}>Put</th> <th>PCR</th>{" "}
                <th>Trend</th>{" "}
              </tr>
            </thead>
            <tbody>
              {/* First ROW CHANGE IN OI  */}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Change In OI
                </td>
                <td>61523</td>
                <td>15234</td>
                <td style={{ color: "green" }}>101</td>
                <td style={{ color: "green" }}>Positive</td>
              </tr>
              {/* PREMIUM DECAY  */}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Premium Decay
                </td>
                <td>61523</td>
                <td>15234</td>
                <td style={{ color: "red" }}>99</td>
                <td style={{ color: "red" }}>Negative</td>
              </tr>
              {/* Volume  */}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Volume
                </td>
                <td>61523</td>
                <td>15234</td>
                <td style={{ color: "red" }}>99</td>
                <td style={{ color: "red" }}>Negative</td>
              </tr>
              {/* Highest OI*/}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Change In OI
                </td>
                <td>
                  61523
                  <hr />
                  123123
                </td>
                <td>
                  61523
                  <hr />
                  123123
                </td>
                <td style={{ color: "green" }}>101</td>
                <td style={{ color: "green" }}>Positive</td>
              </tr>
              {/*A/D Ratio*/}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  A/D Ratio
                </td>

                <td style={{ color: "green" }}>
                  Positive <br /> 12321
                </td>
                <td style={{ color: "red" }}>
                  Negative <br /> 2121
                </td>
                <td colSpan={2} style={{ color: "red" }}>
                  Negative
                </td>
              </tr>
              {/*Previous Closing*/}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Previous Closing
                </td>

                <td style={{ color: "green" }}>Positive</td>
                <td style={{ color: "red" }}>Negative</td>
                <td colSpan={2} style={{ color: "red" }}>
                  Negative
                </td>
              </tr>
              {/*Future OI Change*/}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Future OI Change
                </td>
                <td colSpan={4}>-8675</td>
              </tr>
              {/*Future Price*/}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Future Price
                </td>
                <td colSpan={4} style={{ color: "red" }}>
                  -8675
                </td>
              </tr>
              {/*Future Price*/}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Future Up
                </td>
                <td colSpan={2}>HDFC FUT</td>
                <td>HDFC FUT</td>
                <td>HDFC FUT</td>
              </tr>
              {/*Future Price*/}
              <tr>
                <td className={style.strike_prices} data-theme={props.theme}>
                  Future Down
                </td>
                <td colSpan={2}>HDFC FUT</td>
                <td>HDFC FUT</td>
                <td>HDFC FUT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IntradayHome;
