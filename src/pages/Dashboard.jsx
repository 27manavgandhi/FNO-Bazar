import React, { useState, useEffect, useMemo } from "react";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import {
  getDoc,
  setDoc,
  getFirestore,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app, futureDB } from "../firebase";

import "./DashBoard.css";

import Offcanvas from "react-bootstrap/Offcanvas";

import DashBoardHeader from "../components/DashboardHeader";
import { useAuth } from "../contexts/AuthContext";
import Option from "./dashboardSubPages/Option";
import Future from "./dashboardSubPages/Future";
import Others from "./dashboardSubPages/Others";
import Stock from "./dashboardSubPages/Stock";
import DailyActivities from "./dashboardSubPages/DailyActivities";
import DummyTable from "../components/DummyTable";

import offCanvasButton from "../assets/dashboard-show-offcanvas.svg";
import { CircularProgress } from "@mui/material";
import Portfolio from "./dashboardSubPages/Portfolio";
import { Favorite } from "@mui/icons-material";
import Favourite from "./dashboardSubPages/Favourite";
import { useFavourites } from "../contexts/FavouritesContext";

export default function Dashboard(props) {
  const [userPrefsLoaded, setUserPrefsLoaded] = useState(false);
  const [curTab, setCurTab] = useState("home");
  const [offcanvasShow, setOffcanvasShow] = useState(false);

  const [tableData, setTableData] = useState({
    nifty: {
      current: 0,
      change: 0,
      prevclose: 0,
      todaysLow: 0,
      todaysHigh: 0,
    },
    bankNifty: {
      current: 0,
      change: 0,
      prevclose: 0,
      todaysLow: 0,
      todaysHigh: 0,
    },
    niftyfut: {
      current: 0,
      change: 0,
    },
    bankNiftyFut: {
      current: 0,
      change: 0,
    },
  });
  const rtdb = getDatabase(app);
  const { currentUser } = useAuth();
  const { themeSwitcher } = props;
  // USE FAV CONTEXT
  const { selectedFavouriteTab } = useFavourites();
  useEffect(() => {
    const dailyActivityTabs = [
      "scanner",
      "chartplotting",
      "dailyjournal",
      "morningbreakfast",
      "strategybuilder",
    ];
    const stockTabs = [
      "stockdetails",
      "topgainersandlosers",
      "advancedeclineratio",
    ];
    const futureTabs = ["futureanalysis", "indexvolumecomparison", "indices"];

    if (selectedFavouriteTab) {
      if (dailyActivityTabs.includes(selectedFavouriteTab)) {
        setCurTab("dailyactivities");
      } else if (stockTabs.includes(selectedFavouriteTab)) {
        setCurTab("stock");
      } else if (futureTabs.includes(selectedFavouriteTab)) {
        setCurTab("future");
      } else if ("portfolio" === selectedFavouriteTab) {
        setCurTab("portfolio");
      } else {
        setCurTab("option");
      }
    }
  }, [selectedFavouriteTab]);

  // theme useeffect for user wise theme
  useEffect(() => {


    if (currentUser) {
      const db = getFirestore();
      const docRef = doc(db, "users_settings", currentUser.uid);

      // if doc exists then switch theme in firestore
      // else create doc with default theme

      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // console.log(userData)
            if (userData && userData.hasOwnProperty("theme")) {
              themeSwitcher(null, userData.theme === "0" ? "light" : "dark");
            } else {
              setDoc(docRef, {
                theme: "0",
              });
              themeSwitcher(null, "light");
            }
          } else {
            setDoc(docRef, {
              theme: "0",
            });
            themeSwitcher(null, "light");
          }

          setUserPrefsLoaded(true);
        })
        .catch((error) => {
          window.alert(
            "Error loading user preferences. Please refresh the page. " + error
          );
        });
    }
  }, [currentUser]);

  // useEffect(() => {
  //   const nifty50Ref = ref(rtdb, "tick/Index/NIFTY 50");

  //   const niftyBankRef = ref(rtdb, "tick/Index/NIFTY BANK");
  //   let niftyFutOnVal;
  //   let niftyBankOnVal;
  //   const futRef = ref(rtdb, "tick/Future");
  //   //get object and its first key from futRef
  //   get(futRef).then((snapshot) => {
  //     if (snapshot.exists()) {
  //       const data = snapshot.val();
  //       const keys = Object.keys(data);
  //       const niftyFutRef = ref(rtdb, "tick/Future/" + keys[0] + "/NIFTY FUT");
  //       const niftyBankFutRef = ref(
  //         rtdb,
  //         "tick/Future/" + keys[0] + "/BANKNIFTY FUT"
  //       );
  //       niftyFutOnVal = onValue(niftyFutRef, (snapshot) => {
  //         if (snapshot.val()) {
  //           const { LTP, Prev_Close } = snapshot.val();
  //           setTableData((prev) => {
  //             return {
  //               ...prev,
  //               niftyfut: {
  //                 ...prev.niftyfut,
  //                 current: LTP.toFixed(2),
  //                 change: (LTP - Prev_Close).toFixed(2),
  //               },
  //             };
  //           });
  //         }
  //       });
  //       niftyBankOnVal = onValue(niftyBankFutRef, (snapshot) => {
  //         if (snapshot.val()) {
  //           const { LTP, Prev_Close } = snapshot.val();
  //           setTableData((prev) => {
  //             return {
  //               ...prev,
  //               bankNiftyFut: {
  //                 ...prev.bankNiftyFut,
  //                 current: LTP.toFixed(2),
  //                 change: (LTP - Prev_Close).toFixed(2),
  //               },
  //             };
  //           });
  //         }
  //       });
  //     }
  //   });

  //   onValue(nifty50Ref, (snapshot) => {
  //     if (snapshot.val()) {
  //       const { LTP, Prev_Close, Low, High } = snapshot.val();
  //       setTableData((prev) => {
  //         return {
  //           ...prev,
  //           nifty: {
  //             ...prev.nifty,
  //             current: LTP.toFixed(2),
  //             change: (LTP - Prev_Close).toFixed(2),
  //             todaysHigh: High.toFixed(2),
  //             todaysLow: Low.toFixed(2),
  //           },
  //         };
  //       });
  //     }
  //   });
  //   onValue(niftyBankRef, (snapshot) => {
  //     if (snapshot.val()) {
  //       const { LTP, Prev_Close, Low, High } = snapshot.val();
  //       setTableData((prev) => {
  //         return {
  //           ...prev,
  //           bankNifty: {
  //             ...prev.bankNifty,
  //             current: LTP.toFixed(2),
  //             change: (LTP - Prev_Close).toFixed(2),
  //             todaysHigh: High.toFixed(2),
  //             todaysLow: Low.toFixed(2),
  //           },
  //         };
  //       });
  //     }
  //   });
  //   // Clean up the listener when the component unmounts
  //   return () => {
  //     // Detach the listener when the component unmounts
  //     off(nifty50Ref);
  //     off(niftyBankRef);
  //     // off(niftyFutOnVal)
  //     // off(niftyBankOnVal)
  //   };
  // }, []);

  const handleOffCanvasClose = () => setOffcanvasShow(false);
  const handleOffCanvasShow = () => setOffcanvasShow(true);
  const handleThemeSwitch = (e, theme = null) => {
    // console.log(e.target.checked)
    // console.log(theme)
    setUserPrefsLoaded(false);
    const db = getFirestore();
    const docRef = doc(db, "users_settings", currentUser.uid);

    // update doc in firestore
    updateDoc(docRef, {
      theme: props.theme === "light" ? "1" : "0",
    })
      .then(() => {
        themeSwitcher(null, props.theme === "light" ? "dark" : "light");
        setUserPrefsLoaded(true);
      })
      .catch((error) => {
        window.alert(
          "Error updating user preferences. Please refresh the page. " + error
        );
      });
  };

  return (
    <>
      {userPrefsLoaded ? (
        <div className="dashboard-container">
          <DashBoardHeader
            theme={props.theme}
            themeSwitcher={handleThemeSwitch}
            tabSwitcher={setCurTab}
            curTab={curTab}
            liveData={tableData}
          />

          <Offcanvas
            className="dashboard-offcanvas"
            show={offcanvasShow}
            onHide={handleOffCanvasClose}
            placement="end"
            name="end"
          >
            <Offcanvas.Header>
              <Offcanvas.Title>Text</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Pariatur, distinctio! Enim amet doloremque ipsa?
            </Offcanvas.Body>
          </Offcanvas>

          {curTab === "option" && <Option theme={props.theme} />}
          {curTab === "future" && <Future theme={props.theme} />}
          {curTab === "stock" && <Stock theme={props.theme} />}
          {curTab === "others" && <Others theme={props.theme} />}
          {curTab === "portfolio" && (
            <Portfolio
              // stockData={stockData}
              // strikePrice={strikePrice}
              // searchString={searchString}
              // searchHandler={searchHandler}
              theme={props.theme}
            />
          )}
          {curTab === "home" && (
            <Favourite
              // stockData={stockData}
              // strikePrice={strikePrice}
              // searchString={searchString}
              // searchHandler={searchHandler}
              theme={props.theme}
            />
          )}
          {curTab === "dailyactivities" && (
            <DailyActivities theme={props.theme} />
          )}
        </div>
      ) : (
        <div className="loading-dashboard-page">
          <CircularProgress />
          <p>Preparing your dashboard...</p>
        </div>
      )}
    </>
  );
}
