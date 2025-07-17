import React from "react";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import style from "./DownTable.module.css";
function DownTable({
  downFutureList15,
  downFutureList30,
  downFutureList45,
  downFutureList60,
  futureExpiry,
}) {
  return (
    <div className={style.downcontainer}>
      <h6 style={{ color: "black", fontSize: "1rem", fontWeight: "700" }}>
        Losers-In Last
      </h6>
      <div className={style.container}>
        <div>
          <svg
            fill="#FC7F7F"
            width="32px"
            height="32px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z" />
          </svg>
        </div>
        <div>
          <div className={style.updatedtime}>15 minutes</div>

          <div className={style.stocklisting}>
            <table>
              <tbody>
                {downFutureList15.map((data, i) => {
                  console.log(data);
                  if (i >= 5) return null;
                  return (
                    <tr key={i}>
                      <td>{data.Symbol.replace(futureExpiry, " ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className={style.updatedtime}>30 minutes</div>

          <div className={style.stocklisting}>
            {" "}
            <table>
              <tbody>
                {downFutureList30.map((data, i) => {
                  console.log(data);
                  if (i >= 5) return null;
                  return (
                    <tr key={i}>
                      <td>{data.Symbol.replace(futureExpiry, " ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className={style.updatedtime}>45 minutes</div>

          <div className={style.stocklisting}>
            {" "}
            <table>
              <tbody>
                {downFutureList45.map((data, i) => {
                  console.log(data);
                  if (i >= 5) return null;
                  return (
                    <tr key={i}>
                      <td>{data.Symbol.replace(futureExpiry, " ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className={style.updatedtime}>60 minutes</div>

          <div className={style.stocklisting}>
            <table>
              <tbody>
                {downFutureList60.map((data, i) => {
                  console.log(data);
                  if (i >= 5) return null;
                  return (
                    <tr key={i}>
                      <td>{data.Symbol.replace(futureExpiry, " ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownTable;
