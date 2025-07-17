import React from "react";

import style from "./UpTable.module.css";
function UpTable({
  topFutureList15,
  topFutureList30,
  topFutureList45,
  topFutureList60,
  futureExpiry,
}) {
  console.log(topFutureList15);

  if (!topFutureList15) return <>loading...</>;
  return (
    <div className={style.downcontainer}>
      <h6 style={{ color: "black", fontSize: "1rem", fontWeight: "700" }}>
        Gainers-In Last
      </h6>
      <div className={style.container}>
        <div>
          <svg
            fill="#A4CC5D"
            width="32px"
            height="32px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 19h18a1.002 1.002 0 0 0 .823-1.569l-9-13c-.373-.539-1.271-.539-1.645 0l-9 13A.999.999 0 0 0 3 19z" />
          </svg>
        </div>
        <div>
          <div className={style.updatedtime}>15 minutes</div>

          <div className={style.stocklisting}>
            <table>
              <tbody>
                {topFutureList15.map((data, i) => {
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
                {topFutureList30.map((data, i) => {
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
                {topFutureList45.map((data, i) => {
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
                {topFutureList60.map((data, i) => {
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

export default UpTable;
