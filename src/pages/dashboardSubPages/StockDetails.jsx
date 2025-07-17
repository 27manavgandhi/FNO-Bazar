import React, { useEffect, useState } from "react";
import style from "./StockDetails.module.css";
import { db, futureDB } from "../../firebase";
import { onValue, ref } from "firebase/database";
import TextField from "@mui/material/TextField";
import { Search } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
function StockDetails(props) {
  const { searchString, strikePrice, stockData, searchHandler, theme } = props;
  console.log(stockData);
  console.log(strikePrice);
  // favourites options and functions
  const id = "stockdetails";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Stock Details";
    const index = favourites.findIndex((component) => component.id === id);
    console.log({ favourites });

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
  if (strikePrice.length === 0) return <>loading...</>;
  return (
    <div className={style.stockDetailsContainer} data-theme={theme}>
      <div className="table-info-icons">
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
      <div className={style.searchBarContainer}>
        <TextField
          className={style.searchBar}
          id="fullWidth"
          onChange={searchHandler}
          value={searchString}
          focused={false}
          placeholder="ADANIPOWERS, RELIANCE, ITC, INFY, TCS, TATASTEEL, ..."
          sx={{
            "& .MuiInputBase-input": {
              color: props.theme === "dark" ? "white" : "black",
              backgroundColor:
                props.theme === "dark" ? "#181a26" : "rgba(224, 224, 228, 1)",
              borderRadius: "15px",
            },
            borderRadius: "15px",
            backgroundColor:
              props.theme === "dark" ? "#181a26" : "rgba(224, 224, 228, 1)",
            color: props.theme === "dark" ? "white" : "black",
            fontSize: "1.2rem",
            border: "none",
            "& fieldset": { border: "none" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                disableUnderline="true"
                sx={{
                  color: "gray",
                }}
              >
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </div>{" "}
      <div className={style.stocktableContainer}>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              {/* call columns */}
              <th className={style.strike_prices} data-theme={props.theme}>
                Strike Price
              </th>
              <th>ATP</th> <th>LTP</th> <th>High</th> <th>Low</th> <th>Open</th>{" "}
              <th>Volume</th>
              <th>LTQ</th>
            </tr>
          </thead>
          <tbody>
            {strikePrice
              .filter((item) => {
                return searchString === ""
                  ? item
                  : item.toLowerCase().includes(searchString.toLowerCase());
              })
              .map((strike, i) => {
                const callChange = (
                  stockData[strike]?.LTP - stockData[strike]?.Prev_Close
                )?.toFixed(2);
                return (
                  <tr key={strike}>
                    {/* call columns */}
                    <td
                      className={`${style.strike_prices} textbold`}
                      data-theme={props.theme}
                    >
                      {strike}
                    </td>
                    <td>{stockData[strike].ATP}</td>{" "}
                    <td
                      style={{
                        color: `${callChange < 0 ? "red" : "green"}`,
                        minWidth: "125px",
                      }}
                      className="textbold"
                    >
                      {/* ACTUAL LTP VALUE IN TABLE */}
                      {`${stockData[strike]["LTP"]} (${callChange})`}
                    </td>
                    <td>{stockData[strike].High}</td>{" "}
                    <td>{stockData[strike].Low}</td>{" "}
                    <td>{stockData[strike].Open}</td>{" "}
                    <td>{stockData[strike].Volume}</td>
                    <td>{stockData[strike].LTQ}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockDetails;
