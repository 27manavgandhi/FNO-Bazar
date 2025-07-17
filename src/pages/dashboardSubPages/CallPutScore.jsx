import React, { useEffect, useState } from "react";
import style from "./IntradayOptionChain.module.css";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarIcon from "@mui/icons-material/Star";
function CallPutScore(props) {
  const { strikeArray, data } = props;
  // favourites options and functions
  const id = "callputscore";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Call Put Score";
    const index = favourites.findIndex((component) => component.id === id);
    // console.log({ favourites });

    if (index !== -1) {
      removeFavourite({ id, label });
      setFavouritesToggle(false);
    } else {
      addFavourite({ id, label });
      setFavouritesToggle(true);
    }
  };
  useEffect(() => {
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
  }, []);
  // Retrieve the data from local storage
  const { totalSumIOC, callScore, putScore } = JSON.parse(
    localStorage.getItem("scoreDataIOC")
  );
  // console.log(storedData);
  return (
    <div
      className={style.container}
      style={{ margin: "0 2rem", paddingBottom: "2rem" }}
    >
      <div className="table-info-icons" style={{ width: "100%" }}>
        <div
          style={{
            cursor: "pointer",
            color: "#3f62d7",
            marginLeft: "auto",
          }}
          onClick={() => handleToggleFavourite(id)}
        >
          {favouritesToggle ? <StarIcon /> : <StarBorderIcon />}
        </div>
      </div>
      <table className={"info-table"} data-theme={props.theme}>
        <thead>
          <tr
            style={{
              border:
                props.theme === "dark"
                  ? "1px solid rgba(0, 4, 18, 1)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <th colSpan={12} style={{ color: "green", border: "none" }}>
              Call
            </th>{" "}
            <th style={{ border: "none" }} colSpan={3}></th>
            <th
              colSpan={12}
              style={{
                color: "red",
                border: "none",
              }}
            >
              Put
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="textbold">Strike</td>
            {strikeArray.map((strike) => {
              return <td key={strike}>{strike}</td>;
            })}
            <td
              rowSpan={2}
              className={`${style.strike_prices} textbold`}
              data-theme={props.theme}
            >
              Call score
              <div>{callScore}</div>
            </td>
            <td
              rowSpan={2}
              className={`${style.strike_prices} textbold`}
              data-theme={props.theme}
            >
              O/C score
              <div>{totalSumIOC}</div>
            </td>
            <td
              rowSpan={2}
              className={`${style.strike_prices} textbold`}
              data-theme={props.theme}
            >
              Put score
              <div>{putScore}</div>
            </td>
            <td className="textbold">Strike</td>
            {strikeArray.map((strike) => {
              return <td key={strike}>{strike}</td>;
            })}
          </tr>

          <tr>
            <td className="textbold">LTP</td>
            {strikeArray.map((strike) => {
              return <td key={strike}>{data.Calls[strike].LTP}</td>;
            })}
            <td className="textbold">LTP</td>
            {strikeArray.map((strike) => {
              return <td key={strike}>{data.Puts[strike].LTP}</td>;
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CallPutScore;
