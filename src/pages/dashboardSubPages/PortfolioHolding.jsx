import React from "react";
import style from "./HoldingAndPosition.module.css";
function PortfolioHolding(props) {
  const { holdingData, holdingTitle, stockData } = props;
  if (!holdingTitle) return <>loading...</>;
  console.log(holdingData);
  return (
    <div className={style.container} data-theme={props.theme}>
      <div className={style.margin_left}>
        {" "}
        {holdingTitle?.length > 0 && <h4>Holdings</h4>}
      </div>

      {Object.values(holdingData).map((title) => {
        console.log(title);
        return (
          <div
            className={style.holding_container}
            data-theme={props.theme}
            key={title.symbolID}
          >
            <div>
              <div className={style.holding_title}>{title.symbol}</div>
              <div className={style.holding_price}>
                {stockData?.[title.symbol]?.LTP}
              </div>
            </div>
            <div className={style.item_container}>
              <div className={style.holding_profit}>
                {(+title?.buyPrice * +title?.quantity)?.toFixed(2)}
              </div>
              <div className={style.second_item}>
                <div className={style.avgPrice}>
                  Avg. Price ₹ {title?.buyPrice}
                </div>
                <div className={style.holding}>Quantity {title?.quantity}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PortfolioHolding;
