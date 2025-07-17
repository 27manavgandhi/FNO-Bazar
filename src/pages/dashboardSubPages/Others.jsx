import React, { useState, useEffect } from "react";
import "./Option.css";
import "./Others.css";
import { ref, onValue } from "firebase/database";
import { getDatabase, off, get } from "firebase/database";
import { app } from "../../firebase";
import { futureDB } from "../../firebase";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import OthersScanner from "./OthersScanner";
import ChartPlotting from "./ChartPlotting";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import StrategyBuilder from "./StrategyBuilder";
import StrategyBuilderModal from "./StrategyBuilderModal";
import { useAuth } from "../../contexts/AuthContext";
import { useMediaQuery, useTheme } from "@mui/material";
function getMonth() {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const d = new Date();
  let name = month[d.getMonth()];
  return name;
}

export default function Others(props) {
  const [othersTab, setOthersTab] = useState("strategybuilder");

  // console.log(data);
  //to center the tab in the middle and make it scrollable
  const theme = useTheme();
  // Inside your component
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <div>
        <Tabs
          value={othersTab}
          onChange={(e, newValue) => {
            setOthersTab(newValue);
          }}
          aria-label=""
          data-theme={props.theme}
          variant={isSmallScreen ? "scrollable" : "standard"}
          centered
          scrollButtons={isSmallScreen ? "auto" : "true"}
          allowScrollButtonsMobile
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
            label="Strategy Builder"
            className="muiTab"
            id="simple-tab-1"
            value="strategybuilder"
          />
          <Tab
            label="Chart Plotting"
            className="muiTab"
            id="simple-tab-2"
            value="chartplotting"
          />

          <Tab
            label="Scanner"
            className="muiTab"
            id="simple-tab-4"
            value="scanner"
          />
        </Tabs>
      </div>
      {othersTab === "scanner" && (
        <OthersScanner
        // scannerData={scannerData}
        // titleList={titleList}
        // setScannerOptions={setScannerOptions}
        // scannerOptions={scannerOptions}
        // expiryDates={expiryDates}
        // theme={props.theme}
        // indexWiseExpiry={indexWiseExpiry}
        // setOptionTab={setOptionTab}
        // optionTab={optionTab}
        // setExpiry={setExpiry}
        />
      )}
      {othersTab === "chartplotting" && (
        <>
          <ChartPlotting />
        </>
      )}
      {othersTab === "strategybuilder" && (
        <>
          <StrategyBuilderModal
          // strikeArray={strikeArray}
          // expiryDates={expiryDates}
          // theme={props.theme}
          // data={data}
          />
        </>
      )}
    </>
  );
}
