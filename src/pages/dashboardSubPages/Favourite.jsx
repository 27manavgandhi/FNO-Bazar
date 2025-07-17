import React, { useEffect, useState } from "react";
import "./favourite.css";
import { useFavourites } from "../../contexts/FavouritesContext";
import Button from "@mui/material/Button";
import IntradayHome from "./IntradayHome";
function Favourite(props) {
  const [isTrue, setIsTrue] = useState(false);
  const { favourites, setSelectedFavouriteTab } = useFavourites();
  // const favourites = ["FNO", "NIFTY", "BANKNIFTY", "CHART PLOTTING"];
  // console.log(favourites);
  console.log(isTrue);
  useEffect(() => {
    setSelectedFavouriteTab("");
  }, []);
  const totalInvestment =
    JSON.parse(localStorage.getItem("totalInvestment")) || 0;
  const totalReturn = JSON.parse(localStorage.getItem("totalReturn")) || 0;
  const totalPositionReturn =
    JSON.parse(localStorage.getItem("totalPositionReturn")) || 0;
  return (
    <div className="home_container" data-theme={props.theme}>
      <h6 style={{ paddingInline: "1rem" }}>Portfolio and Position</h6>
      <div className="portfolio_and_position_container">
        <div className="holding" data-theme={props.theme}>
          <h6>Holding</h6>
          <table className={`tableContainer`} data-theme={props.theme}>
            <tr>
              <td>P&L</td>
              <td style={{ color: "red" }}>₹ {totalReturn.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Day Change</td>
              <td>55.55</td>
            </tr>
            <tr>
              <td>Invested Amount</td>
              <td>₹ {totalInvestment.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        <div className="profit_and_loss" data-theme={props.theme}>
          <span style={{ color: "red" }}>P&L</span>
          <span style={{ color: "red" }}>₹ -1986.50</span>
        </div>
        <div className="position" data-theme={props.theme}>
          <h6>Positions</h6>
          <table className={"tableContainer"} data-theme={props.theme}>
            <tr>
              <td>P&L</td>
              <td style={{ color: "red" }}>
                ₹ {totalPositionReturn.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td>Day Change</td>
              <td>55.55</td>
            </tr>
          </table>
        </div>
      </div>
      <div className="intraday_and_favourites">
        <div className="intrady_container">
          <IntradayHome theme={props.theme} />
        </div>
        <div className="favourite_container">
          <h6>Your Favourites </h6>
          <div className="favourites_items">
            {favourites.map((favourite) => {
              return (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedFavouriteTab(favourite.id)}
                  key={favourite.id}
                  className="favourites_items_button"
                  data-theme={props.theme}
                >
                  {favourite.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Favourite;
