import React, { useState, useEffect } from "react";
import "./Option.css";
import "./Future.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { app } from "../../firebase";

import FutureAnalysisTable from "./FutureAnalysisTable";
import IndexVolumeComparison from "./IndexVolumeComparison";
import Indices from "./Indices";
import { useMediaQuery, useTheme } from "@mui/material";
import { useFavourites } from "../../contexts/FavouritesContext";

export default function Future(props) {
  const [futureAnalysis, setfutureAnalysis] = useState(true);
  const [futureTab, setFutureTab] = useState("futureanalysis");
  const [futureStocks, setfutureStocks] = useState([]);
  const [FutureAnalysisData, setFutureAnalysisData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [titleList, setTitleList] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [futureExpiry, setFutureExpiry] = useState();

  useEffect(() => {
    try {
      setComponentLoading(true);
      const rtdb = getDatabase(app);
      const futureRef = ref(rtdb, `tick/Future`);

      var fetchIndicesData = async () => {
        const niftysnap = await get(futureRef);
        const niftyData = niftysnap.val();
        const expiry = Object.keys(niftyData);
        const rbt = expiry[0];
        setFutureExpiry(rbt);
      };
      fetchIndicesData();
    } catch (error) {
      console.log(error);
    }
  }, []);
  // FAVORITE CONTEXT
  const { selectedFavouriteTab } = useFavourites();
  useEffect(() => {
    const futureTabs = ["futureanalysis", "indexvolumecomparison", "indices"];

    if (selectedFavouriteTab) {
      if (futureTabs.includes(selectedFavouriteTab)) {
        setFutureTab(selectedFavouriteTab);
      } else {
        setFutureTab("futureanalysis");
      }
    }
  }, [selectedFavouriteTab]);
  useEffect(() => {
    if (futureAnalysis) {
      try {
        const rtdb = getDatabase(app);
        const futureRef = ref(rtdb, `tick/Future`);

        var fetchIndicesData = async () => {
          const niftysnap = await get(futureRef);
          const niftyData = niftysnap.val();
          const expiry = Object.keys(niftyData);
          const rbt = expiry[0];
          let tempfutureAnalysis = [];
          const arr = [];

          for (const rishi in niftyData[futureExpiry]) {
            const a = {
              name: rishi,
              price: niftyData[futureExpiry][rishi]["LTP"],
              vol: niftyData[futureExpiry][rishi]["Volume"],
              oi: niftyData[futureExpiry][rishi]["OI"],
            };
            tempfutureAnalysis.push(niftyData[futureExpiry]);
            arr.push(a);
          }

          setfutureStocks(arr);
          setFutureAnalysisData(tempfutureAnalysis);
          const title = [];
          const tempArray = [];
          for (const haris in tempfutureAnalysis[0]) {
            title.push(haris);
            tempArray.push(tempfutureAnalysis[0][haris]);
          }

          setTableData(tempArray);
          setTitleList(title);
        };
      } catch (error) {
        console.log("error!!!!!!");
      }

      fetchIndicesData();
    }

    // const interval = setInterval(fetchIndicesData, 2000);
  }, [futureExpiry]);
  console.log(tableData);
  //to center the tab in the middle and make it scrollable
  const theme = useTheme();
  // Inside your component
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div style={{ position: "relative", flexGrow: 1 }}>
      <Tabs
        fullWidth={true}
        value={futureTab}
        onChange={(e, newValue) => {
          setFutureTab(newValue);
        }}
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
          label="Future Analysis"
          className="muiTab"
          id="simple-tab-1"
          value="futureanalysis"
        />
        <Tab
          label="Index Volume Comparison"
          className="muiTab"
          id="simple-tab-2"
          value="indexvolumecomparison"
        />
        <Tab
          label="Indices"
          className="muiTab"
          id="simple-tab-3"
          value="indices"
        />
      </Tabs>

      {futureTab === "futureanalysis" && (
        <FutureAnalysisTable
          tableData={tableData}
          titleList={titleList}
          theme={props.theme}
        />
        // <>ftureananlisis</>
      )}
      {futureTab === "indexvolumecomparison" && (
        <IndexVolumeComparison theme={props.theme} />
        // <>ftureananlisis</>
      )}
      {futureTab === "indices" && (
        <Indices theme={props.theme} />
        // <>ftureananlisis</>
      )}
    </div>
  );
}
