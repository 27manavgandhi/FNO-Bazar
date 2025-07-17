import React from "react";
import style from "./HoldingAndPosition.module.css";
function PortfolioPosition(props) {
  const { positionData, portfolioData } = props;
  // {
  //     301633767: {
  //       buyPrice: '222.0',
  //       expiry: '28-03-24',
  //       investedAmount: '11100.0',
  //       lot: '1',
  //       purchaseDate: '28-3-2024',
  //       quantity: '-50',
  //       symbol: 'NIFTY24032821600CE',
  //       symbolID: '301633767',
  //       type: 'Option'
  //     },}
  console.log(positionData, portfolioData);
  return (
    <div className={style.container} data-theme={props.theme}>
      <div className={style.margin_left}>
        {" "}
        <h4>Position</h4>
      </div>
      {Object.values(positionData)?.map((title) => {
        const symbol = title?.symbol.slice(-7, -2);
        console.log(portfolioData?.Calls[symbol]);
        return (
          <div
            className={style.holding_container}
            data-theme={props.theme}
            key={title.symbolID}
          >
            <div>
              <div className={style.holding_title}>{title.symbol}</div>
              <div className={style.holding_price}>
                {portfolioData?.Calls?.[symbol]?.LTP}
              </div>
            </div>
            <div className={style.item_container}>
              <div className={style.holding_profit}>
                {/* {avgPrice * positionData?.[title]?.currentPrice -
                  avgPrice * positionData?.[title]?.quantity} */}
              </div>
              <div className={style.second_item}>
                <div className={style.avgPrice}>
                  Avg. Price ₹{title?.buyPrice}
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

export default PortfolioPosition;
