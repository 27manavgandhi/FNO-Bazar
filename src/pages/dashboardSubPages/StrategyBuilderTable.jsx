import React from "react";
import style from "./StockDetails.module.css";
function StrategyBuilderTable(props) {
  const { data } = props;
  console.log(data);
  if (!data || data.length === 0) return <></>;
  return (
    <div>
      <table className={style.tableContainer}>
        <thead>
          <tr>
            {/* call columns */}
            <th>My Strategy</th>
            <th>Index</th>
            <th className={style.strike_prices}>
              Trade
              <br />
            </th>
            <th>BUY/SELL</th> <th>Quantity</th> <th>buy/sell price</th>{" "}
            <th>Point Gain/Loss</th>
            <th>Action</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            console.log(item);
            if (index < 1) return null;
            return (
              <tr key={index}>
                {/* call columns */}
                <td>{item.strategyName}</td>
                <td>{item.index}</td>
                <td className={style.strike_prices}>
                  {item.trade}
                  <br />
                </td>
                <td>{item.buysell}</td> <td>{item.lot * 50}</td>{" "}
                <td>{item.price}</td> <td>0.00</td>
                <td>
                  <button>Modify</button>
                </td>
                <td>
                  <button>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StrategyBuilderTable;
