import style from "./HoldingAndPosition.module.css";
import React from "react";

function HoldingAndPosition(props) {
  const {
    totalHolding,
    totalReturn,
    totalInvestment,
    totalPositionHolding,
    totalPositionReturn,
    totalPositionInvestment,
  } = props;

  return (
    <div className={style.holdingcontainer}>
      <div className={style.card_container}>
        <div className={style.card}>
          <div className={style.heading}>Holding</div>₹
          {totalHolding?.toFixed(2)}
          <div className={style.title}>Invested Amount</div>
          <div className={style.value}>₹{totalInvestment?.toFixed(2)}</div>
          <div className={style.title}>Total Profit/Loss</div>
          <div className={style.value}>₹{totalReturn?.toFixed(2)}</div>
          <div className={style.title}>Day Change</div>
          <div className={style.value}>+163.60</div>
        </div>
        <div className={style.card}>
          <div className={style.heading}>Position</div>
          {totalPositionHolding?.toFixed(2)}
          <div className={style.title}>Total Profit/Loss</div>
          <div className={style.value}>{totalPositionReturn?.toFixed(2)}</div>
          <div className={style.title}>Day Change</div>
          <div className={style.value}>+163.60</div>
        </div>
      </div>
    </div>
  );
}

export default HoldingAndPosition;
