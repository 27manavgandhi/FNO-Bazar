import React, { useState } from "react";
import style from "./PortfolioStock.module.css";
function PortfolioFuture(props) {
  const {
    futureTitle,
    futureData,
    onSubmitOptionHandle,
    onSubmitFutureSellHandle,
  } = props;
  const [loading, setLoading] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [inputPrice, setInputPrice] = useState(0);

  const submitHandle = (symbol) => {
    console.log(symbol, inputValue, inputPrice);
    onSubmitOptionHandle(symbol, inputPrice, inputValue);
  };
  const submitHandleSell = (symbol) => {
    onSubmitFutureSellHandle(symbol, inputPrice, inputValue);
  };
  return (
    <div>
      <table className={style.tableContainer}>
        <thead>
          <tr>
            {/* call columns */}
            <th className={style.strike_prices}>Symbol</th>
            <th>ATP</th> <th>LTP</th> <th>High</th> <th>Low</th> <th>Open</th>{" "}
            <th>Volume</th>
            <th>LTQ</th>
            <th>Buy/Sell</th>
          </tr>
        </thead>
        <tbody>
          {futureTitle.map((symbol, i) => {
            return (
              <React.Fragment key={symbol}>
                <tr>
                  {/* call columns */}
                  <td className={style.strike_prices}>{symbol}CE</td>
                  <td>{futureData[symbol].ATP}</td>{" "}
                  <td>{futureData[symbol].LTP}</td>{" "}
                  <td>{futureData[symbol].High}</td>{" "}
                  <td>{futureData[symbol].Low}</td>{" "}
                  <td>{futureData[symbol].Open}</td>{" "}
                  <td>{futureData[symbol].Volume}</td>
                  <td>{futureData[symbol].LTQ}</td>
                  <td>
                    <button type="button" onClick={(e) => setLoading(i)}>
                      button
                    </button>
                  </td>
                </tr>
                {loading === i ? (
                  <div>
                    <div className={style.item_container}>
                      <div className={style.option_price}>
                        <input
                          type="number"
                          onChange={(e) => setInputPrice(e.target.value)}
                        />
                        Buy/Sell Price
                      </div>
                      <div>
                        <div className={style.quantity}>
                          <div
                            onClick={(e) => setInputValue(inputValue - 1)}
                            className={style.value_button}
                            id={style.decrease}
                          >
                            -
                          </div>
                          <input
                            onChange={(e) => setInputValue(e.target.value)}
                            className={style.input_number}
                            type="number"
                            id="number"
                            value={inputValue}
                          />
                          <div
                            onClick={(e) => setInputValue(inputValue + 1)}
                            className={style.value_button}
                            id="increase"
                          >
                            +
                          </div>
                        </div>
                        total quantity
                      </div>
                      <div className={style.date}>
                        <input type="date" />
                      </div>
                      <button
                        className={style.btn}
                        onClick={() => submitHandleSell(symbol)}
                      >
                        Sell
                      </button>
                      <button
                        className={style.btn}
                        onClick={() => submitHandle(symbol)}
                      >
                        Buy
                      </button>
                      <button onClick={() => setLoading(null)}>Close</button>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PortfolioFuture;
