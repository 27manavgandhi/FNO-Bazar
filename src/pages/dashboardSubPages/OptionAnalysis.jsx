import React, { useEffect, useState } from "react";
import style from "./OptionAnalysis.module.css";
import OptionChainBelowTable from "./OptionChainBelowTable";
import OptionAnalysisTable from "./OptionAnalysisTable";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { db, futureDB } from "../../firebase";
import { app } from "../../firebase";
import { buildStrikePricesArray } from "../../utils/MathAndArrayCreators";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const calculateStartTime = (interval) => {
  const currentTime = new Date();
  const intervalInMinutes = parseInt(interval, 10);

  // Calculate the start time by subtracting the selected interval in minutes
  const startTime = new Date(
    currentTime.getTime() - intervalInMinutes * 60 * 1000
  );

  // Format the start time to display in "10:00 AM" format
  const formattedStartTime = startTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return formattedStartTime;
};
function OptionAnalysis(props) {
  const {
    // optionChainOptions,
    // optionChainData,
    // setOptionChainOptions,
    // expiryDates,
  } = props;

  const [optionChainOptions, setOptionChainOptions] = useState({
    index: "NIFTY",
    lotOrValue: "lot",

    numStrikePrice: 5,
    time: 0,
    strikePrices: [],
    count: 0,
  });
  const [optionChainData, setOptionChainData] = useState({
    Calls: [],
    Puts: [],
  });
  const id = 'optionanalysis';
  const [componentLoading, setComponentLoading] = useState(true);
  const [expiryDates, setExpiryDates] = useState([]);
  const [time, setTime] = useState(0);
  const [timeGap, setTimeGap] = useState(calculateStartTime(time));
  const [expiry, setExpiry] = useState('');
  const [strikeArray, setStrikeArray] = useState([]);
  const [expiryDataObject, setExpiryDataObject] = useState([]);
  const [indexWiseExpiry, setIndexWiseExpiry] = useState({
    nifty: [],
    banknifty: []
  });
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const { addFavourite, removeFavourite, favourites } = useFavourites();

  const handleToggleFavourite = (id) => {
    const label = 'Option Analysis';
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
    setComponentLoading(true);
    const rtdb = getDatabase(app);
    // get list of expiries from realtime database first

    const expiryRef = ref(rtdb, 'tick/Option');

    // Attach a listener to the "expiry" reference to listen for changes in the data
    const dateFetchOption = async () => {
      const callsSnapshot = await get(expiryRef);
      const expiryData = callsSnapshot.val();
      setExpiryDataObject(expiryData);
      var expiryArray = expiryData ? Object.keys(expiryData) : [];
      // var NiftDate=
      // remove all dates before today from expiryArray
      const currentDate = new Date();

      // Set the time to the beginning of the day for both dates
      const currentDateStartOfDay = new Date(currentDate);
      currentDateStartOfDay.setHours(0, 0, 0, 0);

      expiryArray = expiryArray.filter((dateString) => {
        const [dd, mm, yy] = dateString.split('-').map(Number);
        const fullYear = yy >= 50 ? 1900 + yy : 2000 + yy;
        const expiryDate = new Date(fullYear, mm - 1, dd); // Adjust year to 4-digit format

        // Include dates on or after the current date (ignoring time)
        return expiryDate >= currentDateStartOfDay;
      });

      setExpiryDates(expiryArray);
    };
    dateFetchOption();

    setComponentLoading(false);

    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }

    return () => {
      // Detach the listener when the component unmounts
      // off(expiryRef, "value", onExpiryValueChange);
    };
  }, []);

  useEffect(() => {
    let bankNiftyDate = [];
    let niftyDate = [];
    expiryDates.forEach((expiry) => {
      if (expiry) {
        if (expiryDataObject[expiry].BANKNIFTY) {
          bankNiftyDate.push(expiry);
        }
        if (expiryDataObject[expiry].NIFTY) {
          niftyDate.push(expiry);
        }
      }
    });

    setIndexWiseExpiry({
      nifty: niftyDate,
      banknifty: bankNiftyDate
    });
  }, [expiryDates]);

  useEffect(() => {
    console.log('-------expiry date keeps running');
    const date =
      optionChainOptions.index === 'NIFTY'
        ? indexWiseExpiry.nifty[0]
        : indexWiseExpiry.banknifty[0];
    setExpiry(date);
  }, [optionChainOptions.index, indexWiseExpiry]);

  useEffect(() => {
    let unsubscribe;
    const dbRef = optionChainOptions['index'] === 'NIFTY' ? 'NIFTY' : 'BANKNIFTY';

    const rtdb = getDatabase(app);

    const optionTimeChainCallRef = ref(
      rtdb,
      `recent data/${timeGap}/Option/${expiry}/${dbRef}/Calls`
    );
    const optionTimeChainPutRef = ref(
      rtdb,
      `recent data/${timeGap}/Option/${expiry}/${dbRef}/Puts`
    );
    const fetchOptionChainHistoricData = async () => {
      try {
        const callsSnapshot = await get(optionTimeChainCallRef);
        const putsSnapshot = await get(optionTimeChainPutRef);

        const callsData = callsSnapshot.val();
        const putsData = putsSnapshot.val();

        if (callsData && putsData) {
          setOptionChainData({ Calls: callsData, Puts: putsData });
          console.log(`tick/${timeGap}/Option/${expiry}/${dbRef}/Calls`);
        }
      } catch (error) {
        // Handle the error if necessary
        console.error('Error fetching option chain data:', error);
      }
    };

    const fetchOptionChainData = async () => {
      try {
        const optionChainCallRef = ref(futureDB, `tick/Option/${expiry}/${dbRef}`);
        console.log(`tick/Option/${expiry}/${dbRef}`);
        unsubscribe = onValue(optionChainCallRef, (snapshot) => {
          const callsSnapshot = snapshot.val();
          // const callsData = callsSnapshot.Calls;
          // const putsData = callsSnapshot.Puts;
          if (callsSnapshot) {
            const callsData = callsSnapshot.Calls;
            const putsData = callsSnapshot.Puts;
            setOptionChainData(callsSnapshot);
          }
        });
      } catch (error) {
        // Handle the error if necessary
        console.error('Error fetching option chain data:', error);
      }
    };

    if (time > 0) {
      fetchOptionChainHistoricData();
      console.log(`${time} time data run here`);
    } else {
      fetchOptionChainData();
      console.log('live data runn here---------');
    }

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [expiry, optionChainOptions, time, indexWiseExpiry]);

  useEffect(() => {
    console.log(optionChainOptions['numStrikePrice']);
    const index = optionChainOptions['index'] === 'NIFTY' ? 'NIFTY 50' : 'NIFTY BANK';
    const niftyLTPRef = ref(futureDB, `tick/Index/${index}/LTP`);
    let strikePriceArray = [];
    const unsubscribe = onValue(niftyLTPRef, (snapshot) => {
      const niftyLTPData = snapshot.val();

      if (niftyLTPData) {
        strikePriceArray = buildStrikePricesArray(
          niftyLTPData,
          optionChainOptions['numStrikePrice'] || 5,
          optionChainOptions['index'] === 'NIFTY' ? 50 : 100
        );

        strikePriceArray.sort();
      }
    });
    setStrikeArray(strikePriceArray);

    return () => {
      if (unsubscribe) {
        // Detach the listener when the component unmounts
        // off(expiryRef, "value", onExpiryValueChange);
        unsubscribe();
      }
    };
  }, [optionChainOptions['index'], optionChainOptions['numStrikePrice']]);
  return (
    <div className={style.container}>
      <div
        style={{
          cursor: 'pointer',
          color: '#3f62d7'
        }}
        className={style.favouritesIcon}
        onClick={() => handleToggleFavourite(id)}>
        {favouritesToggle ? <StarIcon /> : <StarBorderIcon />}
      </div>
      <OptionAnalysisTable
        optionChainData={optionChainData}
        optionChainOptions={optionChainOptions}
        setOptionChainOptions={setOptionChainOptions}
        expiryDates={expiryDates}
        theme={props.theme}
        number={1}
      />
      <OptionAnalysisTable
        optionChainData={optionChainData}
        optionChainOptions={optionChainOptions}
        setOptionChainOptions={setOptionChainOptions}
        theme={props.theme}
        number={2}
      />
      <OptionAnalysisTable
        optionChainData={optionChainData}
        optionChainOptions={optionChainOptions}
        setOptionChainOptions={setOptionChainOptions}
        expiryDates={expiryDates}
        theme={props.theme}
        number={3}
      />
      <OptionAnalysisTable
        optionChainData={optionChainData}
        optionChainOptions={optionChainOptions}
        setOptionChainOptions={setOptionChainOptions}
        theme={props.theme}
        number={4}
      />
    </div>
  );
  //   const [componentLoading, setComponentLoading] = useState(false);
  //   const [oiDifference, setOiDifference] = useState();
  //   const [coiDifference, setCoiDifference] = useState();
  //   const [VolumeDifference, setvolumeDifference] = useState();
  //   const [LTPDifference, setLTPDifference] = useState();
  //   const [Bid_QtyDifference, setbid_QtyDifference] = useState();
  //   const [ask_QtyDifference, setAsk_QtyDifference] = useState();

  //   //-------------%calls&puts state------------------------------

  //   const [COIChangeCallsPuts, setCOIChangeCallsPuts] = useState();
  //   const [oiPercent, setOiPercent] = useState();
  //   const [coiPercent, setCoiPercent] = useState();
  //   const [volumePercent, setVolumePercent] = useState();
  //   const [ltpPercent, setLTPPercent] = useState();
  //   const [bid_QtyPercent, setbid_QtyPercent] = useState();
  //   const [ask_QtyPercent, setAsk_QtyPercent] = useState();
  //   //-------------%PCR state------------------------------
  //   const [oiPcr, setOiPcr] = useState();
  //   const [coiPcr, setCoiPcr] = useState();
  //   const [volumePcr, setVolumePcr] = useState();
  //   const [ltpPcr, setLtpPcr] = useState();
  //   const [bid_QtyPcr, setbid_QtyPcr] = useState();
  //   const [ask_QtyPcr, setAsk_QtyPcr] = useState();

  //   //-------%CallsPuts Function-------------------------

  //   useEffect(() => {
  //     setComponentLoading(false);
  //     function callsPutsPercentage(optionChainOptions, optionChainData, param) {
  //       if (optionChainData.calls.length <= 0) return;
  //       if (!optionChainData) return;
  //       const totalCallsParam = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return acc + optionChainData.calls[currValue]?.[param];
  //         },
  //         0
  //       );
  //       const totalPutsParam = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return acc + optionChainData.puts[currValue]?.[param];
  //         },
  //         0
  //       );
  //       const percentage =
  //         (totalCallsParam / (totalCallsParam + totalPutsParam)) * 100;

  //       return Math.floor(percentage);
  //     }
  //     const OIPercentage = callsPutsPercentage(
  //       optionChainOptions,
  //       optionChainData,
  //       "OI"
  //     );
  //     setOiPercent(OIPercentage);

  //     const volumePercentage = callsPutsPercentage(
  //       optionChainOptions,
  //       optionChainData,
  //       "Volume"
  //     );
  //     setVolumePercent(volumePercentage);

  //     const LTPpercentage = callsPutsPercentage(
  //       optionChainOptions,
  //       optionChainData,
  //       "LTP"
  //     );
  //     setLTPPercent(LTPpercentage);

  //     const Bid_QtyPercentage = callsPutsPercentage(
  //       optionChainOptions,
  //       optionChainData,
  //       "Bid_Qty"
  //     );
  //     setbid_QtyPercent(Bid_QtyPercentage);

  //     const Ask_QtyPercentage = callsPutsPercentage(
  //       optionChainOptions,
  //       optionChainData,
  //       "Ask_Qty"
  //     );
  //     setAsk_QtyPercent(Ask_QtyPercentage);

  //     const COIpercentage = callsPutsCOIPercentage(
  //       optionChainOptions,
  //       optionChainData
  //     );
  //     setCoiPercent(COIpercentage);

  //     setComponentLoading(true);
  //   }, [optionChainOptions, optionChainData]);

  //   //----------%callsPuts COI Function------------------

  //   function callsPutsCOIPercentage(optionChainOptions, optionChainData) {
  //     if (optionChainData.calls.length <= 0) return;
  //     if (!optionChainData) return;
  //     const totalCOICallsParam = optionChainOptions["strikePrices"].reduce(
  //       (acc, currValue) => {
  //         return (
  //           acc +
  //           (optionChainData.calls[currValue]?.OI -
  //             optionChainData.calls[currValue]?.Prev_Open_Int_Close)
  //         );
  //       },
  //       0
  //     );
  //     const totalCOIPutsParam = optionChainOptions["strikePrices"].reduce(
  //       (acc, currValue) => {
  //         return (
  //           acc +
  //           (optionChainData.puts[currValue]?.OI -
  //             optionChainData.puts[currValue]?.Prev_Open_Int_Close)
  //         );
  //       },
  //       0
  //     );
  //     const percentage =
  //       (totalCOICallsParam / (totalCOICallsParam + totalCOIPutsParam)) * 100;

  //     return Math.floor(percentage);
  //   }

  //   //----------------Percentage Variable data initializing----

  //   //--------------Differnce column Function-------------------
  //   useEffect(() => {
  //     function COIDifference(optionChainOptions, optionChainData) {
  //       if (!optionChainData) return;
  //       const DifferenceInCallsCOI = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return (
  //             acc +
  //             (optionChainData?.calls[currValue]?.OI -
  //               optionChainData?.calls[currValue]?.Prev_Open_Int_Close)
  //           );
  //         },
  //         0
  //       );
  //       const DifferenceInPutsCOI = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return (
  //             acc +
  //             (optionChainData?.puts[currValue]?.OI -
  //               optionChainData?.puts[currValue]?.Prev_Open_Int_Close)
  //           );
  //         },
  //         0
  //       );
  //       const changeInCOI = DifferenceInPutsCOI - DifferenceInCallsCOI;

  //       setCoiDifference(changeInCOI);
  //     }
  //     COIDifference(optionChainOptions, optionChainData);
  //   }, [optionChainOptions, optionChainData]);

  //   function OIDifference(optionChainOptions, optionChainData) {
  //     if (optionChainData.calls.length <= 0) return;
  //     const DifferenceInCallsOI = optionChainOptions["strikePrices"].reduce(
  //       (acc, currValue) => {
  //         return acc + optionChainData.calls[currValue]?.OI;
  //       },
  //       0
  //     );
  //     const DifferenceInPutsOI = optionChainOptions["strikePrices"].reduce(
  //       (acc, currValue) => {
  //         return acc + optionChainData.puts[currValue]?.OI;
  //       },
  //       0
  //     );
  //     const changeInOI = DifferenceInPutsOI - DifferenceInCallsOI;
  //     return changeInOI;
  //   }
  //   //-----------Resusable Difference calculate function------------
  //   useEffect(() => {
  //     setComponentLoading(false);
  //     function calculateDifference(
  //       optionChainOptions,
  //       optionChainData,
  //       dataName = ""
  //     ) {
  //       if (!optionChainData.calls) return null;
  //       let name = dataName;

  //       const DifferenceInCallsOI = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return acc + optionChainData?.calls[currValue]?.[name];
  //         },
  //         0
  //       );
  //       const DifferenceInPutsOI = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return acc + optionChainData.puts[currValue]?.[name];
  //         },
  //         0
  //       );
  //       const changeInOI = DifferenceInPutsOI - DifferenceInCallsOI;
  //       return changeInOI;
  //     }

  //     //---------------------------------------------
  //     const Volumeresult = calculateDifference(
  //       optionChainOptions,
  //       optionChainData,
  //       "Volume"
  //     );
  //     setvolumeDifference(Volumeresult);

  //     //---------------------------------------------
  //     const Ltpresult = calculateDifference(
  //       optionChainOptions,
  //       optionChainData,
  //       "LTP"
  //     );
  //     setLTPDifference(Ltpresult);

  //     //---------------------------------------------
  //     const bid_Qty = calculateDifference(
  //       optionChainOptions,
  //       optionChainData,
  //       "Bid_Qty"
  //     );
  //     setbid_QtyDifference(bid_Qty);

  //     //---------------------------------------------
  //     const Ask_Qty = calculateDifference(
  //       optionChainOptions,
  //       optionChainData,
  //       "Ask_Qty"
  //     );
  //     setAsk_QtyDifference(Ask_Qty);
  //     setComponentLoading(true);
  //   }, [optionChainOptions, optionChainData]);

  //   const OIresult = OIDifference(optionChainOptions, optionChainData);
  //   // const COIresult = COIDifference(optionChainOptions, optionChainData);
  //   // ---------------PCR function------------
  //   useEffect(() => {
  //     function calculatePCR(optionChainOptions, optionChainData, param) {
  //       const sumofcalls = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return acc + optionChainData.calls[currValue]?.[param];
  //         },
  //         0
  //       );
  //       const sumofputs = optionChainOptions["strikePrices"].reduce(
  //         (acc, currValue) => {
  //           return acc + optionChainData.puts[currValue]?.[param];
  //         },
  //         0
  //       );
  //       const PCR = sumofputs / sumofcalls;
  //       return PCR.toFixed(2);
  //     }
  //     const oiPCR = calculatePCR(optionChainOptions, optionChainData, "OI");
  //     setOiPcr(oiPCR);

  //     const coiPCR = calculatecoiPCR(optionChainOptions, optionChainData);
  //     setCoiPcr(coiPCR);
  //     const volumePCR = calculatePCR(
  //       optionChainOptions,
  //       optionChainData,
  //       "Volume"
  //     );
  //     setVolumePcr(volumePCR);

  //     const ltpPCR = calculatePCR(optionChainOptions, optionChainData, "LTP");
  //     setLtpPcr(ltpPCR);
  //     const bid_QtyPCR = calculatePCR(
  //       optionChainOptions,
  //       optionChainData,
  //       "Bid_Qty"
  //     );
  //     setbid_QtyPcr(bid_QtyPCR);

  //     const ask_QtyPCR = calculatePCR(
  //       optionChainOptions,
  //       optionChainData,
  //       "Ask_Qty"
  //     );
  //     setAsk_QtyPcr(ask_QtyPCR);
  //   }, [optionChainOptions, optionChainData]);

  //   //------------------PCR COI Function-----------------
  //   function calculatecoiPCR(optionChainOptions, optionChainData) {
  //     const sumofcalls = optionChainOptions["strikePrices"].reduce(
  //       (acc, currValue) => {
  //         return (
  //           acc +
  //           (optionChainData.calls[currValue]?.OI -
  //             optionChainData.calls[currValue]?.Prev_Open_Int_Close)
  //         );
  //       },
  //       0
  //     );
  //     const sumofputs = optionChainOptions["strikePrices"].reduce(
  //       (acc, currValue) => {
  //         return (
  //           acc +
  //           (optionChainData.puts[currValue]?.OI -
  //             optionChainData.puts[currValue]?.Prev_Open_Int_Close)
  //         );
  //       },
  //       0
  //     );
  //     const PCR = sumofputs / sumofcalls;
  //     return PCR.toFixed(2);
  //   }

  //   if (!componentLoading) return <>loading...</>;
  //   return (
  //     <>
  //       <div className={style.container}>
  //         <table className={style.tableContainer}>
  //           <thead>
  //             <tr>
  //               <th className={style.strike_prices}>Parameter</th>
  //               <th className={style.marginleft}>% Call Put</th>
  //               <th>Difference</th>
  //               <th>PCR</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 OI
  //               </td>
  //               <td className={style.marginleft}>
  //                 {/* <div class={style.progress_bar}>
  //                   <div class={style.red}></div>
  //                   <div class={style.green}></div>
  //                 </div> */}
  //                 <ColoredProgressBar percentage={oiPercent} />
  //               </td>
  //               <td>{OIresult}</td>
  //               <td>{oiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>COI</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={coiPercent} />
  //               </td>
  //               <td>{coiDifference}</td>
  //               <td>{coiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 Volume
  //               </td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={volumePercent} />
  //               </td>
  //               <td>{VolumeDifference}</td>
  //               <td>{volumePcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>LTP</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ltpPercent} />
  //               </td>
  //               <td>{LTPDifference.toFixed(2)}</td>
  //               <td>{ltpPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Bid Qty</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={bid_QtyPercent} />
  //               </td>
  //               <td>{Bid_QtyDifference}</td>
  //               <td>{bid_QtyPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Ask Qty</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ask_QtyPercent} />
  //               </td>
  //               <td>{ask_QtyDifference}</td>
  //               <td>{ask_QtyPcr}</td>
  //             </tr>
  //           </tbody>
  //         </table>
  //         <table className={style.tableContainer}>
  //           <thead>
  //             <tr>
  //               <th className={style.strike_prices}>Parameter</th>
  //               <th className={style.marginleft}>% Call Put</th>
  //               <th>Difference</th>
  //               <th>PCR</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 OI
  //               </td>
  //               <td className={style.marginleft}>
  //                 {/* <div class={style.progress_bar}>
  //                   <div class={style.red}></div>
  //                   <div class={style.green}></div>
  //                 </div> */}
  //                 <ColoredProgressBar percentage={oiPercent} />
  //               </td>
  //               <td>{OIresult}</td>
  //               <td>{oiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>COI</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={coiPercent} />
  //               </td>
  //               <td>{coiDifference}</td>
  //               <td>{coiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 Volume
  //               </td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={volumePercent} />
  //               </td>
  //               <td>{VolumeDifference}</td>
  //               <td>{volumePcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>LTP</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ltpPercent} />
  //               </td>
  //               <td>{LTPDifference.toFixed(2)}</td>
  //               <td>{ltpPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Bid Qty</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={bid_QtyPercent} />
  //               </td>
  //               <td>{Bid_QtyDifference}</td>
  //               <td>{bid_QtyPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Ask Qty</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ask_QtyPercent} />
  //               </td>
  //               <td>{ask_QtyDifference}</td>
  //               <td>{ask_QtyPcr}</td>
  //             </tr>
  //           </tbody>
  //         </table>
  //       </div>
  //       <div className={style.container}>
  //         <table className={style.tableContainer}>
  //           <thead>
  //             <tr>
  //               <th className={style.strike_prices}>Parameter</th>
  //               <th className={style.marginleft}>% Call Put</th>
  //               <th>Difference</th>
  //               <th>PCR</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 OI
  //               </td>
  //               <td className={style.marginleft}>
  //                 {/* <div class={style.progress_bar}>
  //                   <div class={style.red}></div>
  //                   <div class={style.green}></div>
  //                 </div> */}
  //                 <ColoredProgressBar percentage={oiPercent} />
  //               </td>
  //               <td>{OIresult}</td>
  //               <td>{oiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>COI</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={coiPercent} />
  //               </td>
  //               <td>{coiDifference}</td>
  //               <td>{coiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 Volume
  //               </td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={volumePercent} />
  //               </td>
  //               <td>{VolumeDifference}</td>
  //               <td>{volumePcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>LTP</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ltpPercent} />
  //               </td>
  //               <td>{LTPDifference.toFixed(2)}</td>
  //               <td>{ltpPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Bid Qty</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={bid_QtyPercent} />
  //               </td>
  //               <td>{Bid_QtyDifference}</td>
  //               <td>{bid_QtyPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Ask Qty</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ask_QtyPercent} />
  //               </td>
  //               <td>{ask_QtyDifference}</td>
  //               <td>{ask_QtyPcr}</td>
  //             </tr>
  //           </tbody>
  //         </table>
  //         <table className={style.tableContainer}>
  //           <thead>
  //             <tr>
  //               <th className={style.strike_prices}>Parameter</th>
  //               <th className={style.marginleft}>% Call Put</th>
  //               <th>Difference</th>
  //               <th>PCR</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 OI
  //               </td>
  //               <td className={style.marginleft}>
  //                 {/* <div class={style.progress_bar}>
  //                   <div class={style.red}></div>
  //                   <div class={style.green}></div>
  //                 </div> */}
  //                 <ColoredProgressBar percentage={oiPercent} />
  //               </td>
  //               <td>{OIresult}</td>
  //               <td>{oiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>COI</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={coiPercent} />
  //               </td>
  //               <td>{coiDifference}</td>
  //               <td>{coiPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={`${style.strike_prices} ${style.paddingZero}`}>
  //                 Volume
  //               </td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={volumePercent} />
  //               </td>
  //               <td>{VolumeDifference}</td>
  //               <td>{volumePcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>LTP</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ltpPercent} />
  //               </td>
  //               <td>{LTPDifference.toFixed(2)}</td>
  //               <td>{ltpPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Bid Qty</td>
  //               <td className={style.marginleft}>
  //                 <ColoredProgressBar percentage={bid_QtyPercent} />
  //               </td>
  //               <td>{Bid_QtyDifference}</td>
  //               <td>{bid_QtyPcr}</td>
  //             </tr>
  //             <tr>
  //               <td className={style.strike_prices}>Ask Qty</td>
  //               <td className={style.marginleft}>
  //                 {" "}
  //                 <ColoredProgressBar percentage={ask_QtyPercent} />
  //               </td>
  //               <td>{ask_QtyDifference}</td>
  //               <td>{ask_QtyPcr}</td>
  //             </tr>
  //           </tbody>
  //         </table>
  //       </div>
  //     </>
  //   );
  // }

  // function ColoredProgressBar({ percentage }) {
  //   const [greenWidth, setGreenWidth] = useState(percentage + "%");
  //   const [redWidth, setRedWidth] = useState(100 - percentage + "%");

  //   useEffect(() => {
  //     setGreenWidth(percentage + "%");
  //     setRedWidth(100 - percentage + "%");
  //   }, [percentage]);

  //   const progressBarStyle = {
  //     position: "relative",
  //     width: "100%",
  //     // height: "20px",
  //     backgroundColor: "gray",
  //   };

  //   const greenStyle = {
  //     height: "100%",
  //     backgroundColor: "green",
  //     paddingTop: "1rem",
  //     paddingBottom: "1.1rem",
  //     paddingRight: "2px",
  //     width: greenWidth,
  //     transition: "width 0.5s",
  //   };

  //   const redStyle = {
  //     height: "100%",
  //     backgroundColor: "red",
  //     paddingTop: "1rem",
  //     paddingBottom: "1.1rem",
  //     paddingRight: "4px",
  //     float: "right",
  //     width: redWidth,
  //     transition: "width 0.5s",
  //   };

  //   const wrapper = {};
  //   const progresstextgreen = {
  //     position: "absolute",
  //     left: "20px",
  //     bottom: "8px",
  //   };
  //   const progresstextred = {
  //     position: "absolute",
  //     right: "20px",
  //     bottom: "8px",
  //   };

  //   return (
  //     <div style={progressBarStyle}>
  //       <div style={redStyle}>
  //         <span style={progresstextred}>{redWidth}</span>
  //       </div>
  //       <div style={greenStyle}>
  //         <span style={progresstextgreen}>{greenWidth}</span>
  //       </div>
  //     </div>
  //   );
}

// export { ColoredProgressBar };
export default OptionAnalysis;
