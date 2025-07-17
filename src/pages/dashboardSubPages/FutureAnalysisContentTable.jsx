import React, { useEffect, useState } from "react";
import style from "./FutureAnalysisContentTable.module.css";
function FutureAnalysisContentTable({ tableData, titleList, theme }) {
  console.log({ tableData });
  return (
    <div className={style.container}>
      Intraday Future Dashboard
      <table className={style.tableContainer} data-theme={theme}>
        <thead>
          <tr>
            <th className="textbold strike_prices" data-theme={theme}>
              Future
            </th>
            <th>LTP</th>
            <th>Price</th>
            <th>Change</th>
            <th>Cash Price</th>
            <th>Change</th>
            <th>Volume</th>
            <th>Change</th>
            <th>OI</th>
            <th>Change in OI</th>
            <th>IV</th>
            <th>Change</th>
            <th>% of Gain on Price</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, i) => {
            return (
              <tr key={i}>
                <td className="textbold strike_prices" data-theme={theme}>
                  {titleList[i]}
                </td>
                <td>{data.LTP}</td>
                <td>2</td>
                <td>307</td>
                <td>4</td>
                <td>2652146</td>
                <td>{data.Volume}</td>
                <td>34521231</td>
                <td>{data.OI}</td>
                <td>33</td>
                <td>16</td>
                <td></td>
                <td></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FutureAnalysisContentTable;
