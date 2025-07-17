import React, { useState, useEffect } from "react";
import "./Option.css";
import "./Stock.css";
import { db, futureDB } from "../../firebase";
import { onValue, ref } from "firebase/database";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import StockDetails from "./StockDetails";
import GainerAndLoserStocks from "./GainerAndLoserStocks";
import AdvanceDeclineRatio from "./AdvanceDeclineRatio";
import Portfolio from "./Portfolio";
import { useMediaQuery, useTheme } from "@mui/material";
import { useFavourites } from "../../contexts/FavouritesContext";

export default function Stock(props) {
  const [stockTab, setStockTab] = useState("stockdetails");
  const [stockData, setStockData] = useState([]);
  const [strikePrice, setStrikePrice] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let tempData = {};
    let downData = [];
    let strikePriceArray = [];
    const dbRef = ref(futureDB, `/tick/Stocks`);
    onValue(dbRef, (snapshot) => {
      // snapshot.forEach((snapshot) => {
      //   tempData.push(snapshot.val());
      //   downData.push(snapshot.val());
      // });
      tempData = snapshot.val();

      setStockData(tempData);

      setLoading(true);
    });
    for (let key in stockData) {
      strikePriceArray.push(key);
    }
    setStrikePrice(strikePriceArray);
  }, [loading]);
  // FAVORITE CONTEXT
  const { selectedFavouriteTab } = useFavourites();
  useEffect(() => {
    const dailyActivityTabs = [
      "stockdetails",
      "topgainersandlosers",
      "advancedeclineratio",
    ];

    if (selectedFavouriteTab) {
      if (dailyActivityTabs.includes(selectedFavouriteTab)) {
        setStockTab(selectedFavouriteTab);
      } else {
        setStockTab("stockdetails");
      }
    }
  }, [selectedFavouriteTab]);
  const searchHandler = (e) => {
    setSearchString(e.target.value);
  };
  //to center the tab in the middle and make it scrollable
  const theme = useTheme();
  // Inside your component
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Tabs
        value={stockTab}
        onChange={(e, newValue) => {
          setStockTab(newValue);
        }}
        data-theme={props.theme}
        variant={isSmallScreen ? "scrollable" : "standard"}
        centered
        scrollButtons={isSmallScreen ? "auto" : "true"}
        allowScrollButtonsMobile
        aria-label="simple tabs example"
        sx={{
          "& .MuiTabScrollButton-root": {
            color: "#3f62d7",
          },
        }}
        TabIndicatorProps={{
          style: {
            backgroundColor: "#3f62d7",
          },
        }}
      >
        <Tab
          label="Stock Details"
          className="muiTab"
          id="simple-tab-1"
          value="stockdetails"
        />
        <Tab
          label="Top Gainers and Losers"
          className="muiTab"
          id="simple-tab-2"
          value="topgainersandlosers"
        />

        <Tab
          label="Advance Decline Ratio"
          className="muiTab"
          id="simple-tab-4"
          value="advancedeclineratio"
        />
      </Tabs>

      <div>
        {stockTab === "stockdetails" && (
          <StockDetails
            stockData={stockData}
            strikePrice={strikePrice}
            searchString={searchString}
            searchHandler={searchHandler}
            theme={props.theme}
          />
        )}
        {stockTab === "topgainersandlosers" && (
          <GainerAndLoserStocks
            stockData={stockData}
            strikePrice={strikePrice}
            searchString={searchString}
            theme={props.theme}
          />
        )}
        {/* {stockTab === "portfolioposition" && (
          <Portfolio
            stockData={stockData}
            strikePrice={strikePrice}
            searchString={searchString}
            searchHandler={searchHandler}
          />
        )} */}
        {stockTab === "advancedeclineratio" && (
          <AdvanceDeclineRatio
            stockData={stockData}
            strikePrice={strikePrice}
            theme={props.theme}
          />
        )}
      </div>
    </>
  );
}
