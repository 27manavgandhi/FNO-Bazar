import React, { useEffect, useState } from "react";
import style from "./OptionAnalysisBelowTable.module.css";
function OptionAnalysisBelowTable(props) {
  const { optionChainOptions, optionChainData, strikeArray } = props;

  const [componentLoading, setComponentLoading] = useState(false);
  const [oiDifference, setOiDifference] = useState();
  const [coiDifference, setCoiDifference] = useState();
  const [VolumeDifference, setvolumeDifference] = useState();
  const [LTPDifference, setLTPDifference] = useState();
  const [Bid_QtyDifference, setbid_QtyDifference] = useState();
  const [ask_QtyDifference, setAsk_QtyDifference] = useState();

  //-------------%calls&puts state------------------------------

  const [COIChangeCallsPuts, setCOIChangeCallsPuts] = useState();
  const [oiPercent, setOiPercent] = useState();
  const [coiPercent, setCoiPercent] = useState();
  const [volumePercent, setVolumePercent] = useState();
  const [ltpPercent, setLTPPercent] = useState();
  const [bid_QtyPercent, setbid_QtyPercent] = useState();
  const [ask_QtyPercent, setAsk_QtyPercent] = useState();
  //-------------%PCR state------------------------------
  const [oiPcr, setOiPcr] = useState();
  const [coiPcr, setCoiPcr] = useState();
  const [volumePcr, setVolumePcr] = useState();
  const [ltpPcr, setLtpPcr] = useState();
  const [bid_QtyPcr, setbid_QtyPcr] = useState();
  const [ask_QtyPcr, setAsk_QtyPcr] = useState();

  //-------%CallsPuts Function-------------------------

  useEffect(() => {
    setComponentLoading(false);
    function callsPutsPercentage(optionChainOptions, optionChainData, param) {
      if (optionChainData.Calls?.length <= 0) return;
      if (!optionChainData) return;
      const totalCallsParam = strikeArray.reduce((acc, currValue) => {
        return acc + optionChainData.Calls?.[currValue]?.[param];
      }, 0);
      const totalPutsParam = strikeArray.reduce((acc, currValue) => {
        return acc + optionChainData.Puts?.[currValue]?.[param];
      }, 0);
      const percentage =
        (totalCallsParam / (totalCallsParam + totalPutsParam)) * 100;

      return Math.floor(percentage);
    }
    const OIPercentage = callsPutsPercentage(
      optionChainOptions,
      optionChainData,
      "OI"
    );
    setOiPercent(OIPercentage);

    const volumePercentage = callsPutsPercentage(
      optionChainOptions,
      optionChainData,
      "Volume"
    );
    setVolumePercent(volumePercentage);

    const LTPpercentage = callsPutsPercentage(
      optionChainOptions,
      optionChainData,
      "LTP"
    );
    setLTPPercent(LTPpercentage);

    const Bid_QtyPercentage = callsPutsPercentage(
      optionChainOptions,
      optionChainData,
      "Bid_Qty"
    );
    setbid_QtyPercent(Bid_QtyPercentage);

    const Ask_QtyPercentage = callsPutsPercentage(
      optionChainOptions,
      optionChainData,
      "Ask_Qty"
    );
    setAsk_QtyPercent(Ask_QtyPercentage);

    const COIpercentage = callsPutsCOIPercentage(
      optionChainOptions,
      optionChainData
    );
    setCoiPercent(COIpercentage);

    setComponentLoading(true);
  }, [optionChainOptions, optionChainData]);

  //----------%callsPuts COI Function------------------

  function callsPutsCOIPercentage(optionChainOptions, optionChainData) {
    if (optionChainData.Calls?.length <= 0) return;
    if (!optionChainData) return;
    const totalCOICallsParam = strikeArray.reduce((acc, currValue) => {
      return (
        acc +
        (optionChainData.Calls?.[currValue]?.OI -
          optionChainData.Calls?.[currValue]?.Prev_Open_Int_Close)
      );
    }, 0);
    const totalCOIPutsParam = strikeArray.reduce((acc, currValue) => {
      return (
        acc +
        (optionChainData.Puts?.[currValue]?.OI -
          optionChainData.Puts?.[currValue]?.Prev_Open_Int_Close)
      );
    }, 0);
    const percentage =
      (totalCOICallsParam / (totalCOICallsParam + totalCOIPutsParam)) * 100;

    return Math.floor(percentage);
  }

  //----------------Percentage Variable data initializing----

  //--------------Differnce column Function-------------------
  useEffect(() => {
    function COIDifference(optionChainOptions, optionChainData) {
      if (!optionChainData) return;
      const DifferenceInCallsCOI = strikeArray.reduce((acc, currValue) => {
        return (
          acc +
          (optionChainData?.Calls?.[currValue]?.OI -
            optionChainData?.Calls?.[currValue]?.Prev_Open_Int_Close)
        );
      }, 0);
      const DifferenceInPutsCOI = strikeArray.reduce((acc, currValue) => {
        return (
          acc +
          (optionChainData?.Puts?.[currValue]?.OI -
            optionChainData?.Puts?.[currValue]?.Prev_Open_Int_Close)
        );
      }, 0);
      const changeInCOI = DifferenceInPutsCOI - DifferenceInCallsCOI;

      setCoiDifference(changeInCOI);
    }
    COIDifference(optionChainOptions, optionChainData);
  }, [optionChainOptions, optionChainData]);

  function OIDifference(optionChainOptions, optionChainData) {
    if (optionChainData.Calls?.length <= 0) return;
    const DifferenceInCallsOI = strikeArray.reduce((acc, currValue) => {
      return acc + optionChainData.Calls?.[currValue]?.OI;
    }, 0);
    const DifferenceInPutsOI = strikeArray.reduce((acc, currValue) => {
      return acc + optionChainData.Puts?.[currValue]?.OI;
    }, 0);
    const changeInOI = DifferenceInPutsOI - DifferenceInCallsOI;
    return changeInOI;
  }
  //-----------Resusable Difference calculate function------------
  useEffect(() => {
    setComponentLoading(false);
    function calculateDifference(
      optionChainOptions,
      optionChainData,
      dataName = ""
    ) {
      if (!optionChainData.Calls) return null;
      let name = dataName;

      const DifferenceInCallsOI = strikeArray.reduce((acc, currValue) => {
        return acc + optionChainData?.Calls?.[currValue]?.[name];
      }, 0);
      const DifferenceInPutsOI = strikeArray.reduce((acc, currValue) => {
        return acc + optionChainData.Puts?.[currValue]?.[name];
      }, 0);
      const changeInOI = DifferenceInPutsOI - DifferenceInCallsOI;
      return changeInOI;
    }

    //---------------------------------------------
    const Volumeresult = calculateDifference(
      optionChainOptions,
      optionChainData,
      "Volume"
    );
    setvolumeDifference(Volumeresult);

    //---------------------------------------------
    const Ltpresult = calculateDifference(
      optionChainOptions,
      optionChainData,
      "LTP"
    );
    setLTPDifference(Ltpresult);

    //---------------------------------------------
    const bid_Qty = calculateDifference(
      optionChainOptions,
      optionChainData,
      "Bid_Qty"
    );
    setbid_QtyDifference(bid_Qty);

    //---------------------------------------------
    const Ask_Qty = calculateDifference(
      optionChainOptions,
      optionChainData,
      "Ask_Qty"
    );
    setAsk_QtyDifference(Ask_Qty);
    setComponentLoading(true);
  }, [optionChainOptions, optionChainData]);

  const OIresult = OIDifference(optionChainOptions, optionChainData);
  // const COIresult = COIDifference(optionChainOptions, optionChainData);
  // ---------------PCR function------------
  useEffect(() => {
    function calculatePCR(optionChainOptions, optionChainData, param) {
      const sumofcalls = strikeArray.reduce((acc, currValue) => {
        return acc + optionChainData.Calls?.[currValue]?.[param];
      }, 0);
      const sumofputs = strikeArray.reduce((acc, currValue) => {
        return acc + optionChainData.Puts?.[currValue]?.[param];
      }, 0);
      const PCR = sumofputs / sumofcalls;
      return PCR?.toFixed(2);
    }
    const oiPCR = calculatePCR(optionChainOptions, optionChainData, "OI");
    setOiPcr(oiPCR);

    const coiPCR = calculatecoiPCR(optionChainOptions, optionChainData);
    setCoiPcr(coiPCR);
    const volumePCR = calculatePCR(
      optionChainOptions,
      optionChainData,
      "Volume"
    );
    setVolumePcr(volumePCR);

    const ltpPCR = calculatePCR(optionChainOptions, optionChainData, "LTP");
    setLtpPcr(ltpPCR);
    const bid_QtyPCR = calculatePCR(
      optionChainOptions,
      optionChainData,
      "Bid_Qty"
    );
    setbid_QtyPcr(bid_QtyPCR);

    const ask_QtyPCR = calculatePCR(
      optionChainOptions,
      optionChainData,
      "Ask_Qty"
    );
    setAsk_QtyPcr(ask_QtyPCR);
  }, [optionChainOptions, optionChainData]);

  //------------------PCR COI Function-----------------
  function calculatecoiPCR(optionChainOptions, optionChainData) {
    const sumofcalls = strikeArray.reduce((acc, currValue) => {
      return (
        acc +
        (optionChainData.Calls?.[currValue]?.OI -
          optionChainData.Calls?.[currValue]?.Prev_Open_Int_Close)
      );
    }, 0);
    const sumofputs = strikeArray.reduce((acc, currValue) => {
      return (
        acc +
        (optionChainData.Puts?.[currValue]?.OI -
          optionChainData.Puts?.[currValue]?.Prev_Open_Int_Close)
      );
    }, 0);
    const PCR = sumofputs / sumofcalls;
    return PCR?.toFixed(2);
  }

  if (!optionChainData) return <>loading...</>;

  // if (!componentLoading) return <>loading...</>;
  return (
    <div className={style.container}>
      <table className={style.tableContainer} data-theme={props.theme}>
        <thead>
          <tr>
            <th className={style.strike_prices} data-theme={props.theme}>
              Parameter
            </th>
            <th className={style.marginleft}>% Call Put</th>
            <th>Difference</th>
            <th>PCR</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className={`${style.strike_prices} ${style.paddingZero}`}
              data-theme={props.theme}
            >
              OI
            </td>
            <td className={style.marginleft}>
              {/* <div class={style.progress_bar}>
                  <div class={style.red}></div>
                  <div class={style.green}></div>
                </div> */}
              <ColoredProgressBar percentage={oiPercent} />
            </td>
            <td>{OIresult}</td>
            <td>{oiPcr}</td>
          </tr>
          <tr>
            <td className={style.strike_prices} data-theme={props.theme}>
              COI
            </td>
            <td className={style.marginleft}>
              <ColoredProgressBar percentage={coiPercent} />
            </td>
            <td>{coiDifference}</td>
            <td>{coiPcr}</td>
          </tr>
          <tr>
            <td
              className={`${style.strike_prices} ${style.paddingZero}`}
              data-theme={props.theme}
            >
              Volume
            </td>
            <td className={style.marginleft}>
              {" "}
              <ColoredProgressBar percentage={volumePercent} />
            </td>
            <td>{VolumeDifference}</td>
            <td>{volumePcr}</td>
          </tr>
          <tr>
            <td className={style.strike_prices} data-theme={props.theme}>
              LTP
            </td>
            <td className={style.marginleft}>
              {" "}
              <ColoredProgressBar percentage={ltpPercent} />
            </td>
            <td>{LTPDifference?.toFixed(2)}</td>
            <td>{ltpPcr}</td>
          </tr>
          <tr>
            <td className={style.strike_prices} data-theme={props.theme}>
              Bid Qty
            </td>
            <td className={style.marginleft}>
              <ColoredProgressBar percentage={bid_QtyPercent} />
            </td>
            <td>{Bid_QtyDifference}</td>
            <td>{bid_QtyPcr}</td>
          </tr>
          <tr>
            <td className={style.strike_prices} data-theme={props.theme}>
              Ask Qty
            </td>
            <td className={style.marginleft}>
              {" "}
              <ColoredProgressBar percentage={ask_QtyPercent} />
            </td>
            <td>{ask_QtyDifference}</td>
            <td>{ask_QtyPcr}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ColoredProgressBar({ percentage }) {
  const [greenWidth, setGreenWidth] = useState(percentage + "%");
  const [redWidth, setRedWidth] = useState(100 - percentage + "%");

  useEffect(() => {
    setGreenWidth(percentage > 100 ? "100%" : percentage + "%");
    setRedWidth(percentage > 100 ? "0%" : 100 - percentage + "%");
  }, [percentage]);

  const progressBarStyle = {
    position: "relative",
    width: "100%",
    // height: "20px",
    backgroundColor: "gray",
  };

  const greenStyle = {
    height: "100%",
    backgroundColor: "green",
    paddingTop: "1rem",
    paddingBottom: "1.1rem",
    paddingRight: "2px",
    width: greenWidth,
    transition: "width 0.5s",
  };

  const redStyle = {
    height: "100%",
    backgroundColor: "red",
    paddingTop: "1rem",
    paddingBottom: "1.1rem",
    paddingRight: "4px",
    float: "right",
    width: redWidth,
    transition: "width 0.5s",
  };

  const wrapper = {};
  const progresstextgreen = {
    position: "absolute",
    left: "20px",
    bottom: "8px",
  };
  const progresstextred = {
    position: "absolute",
    right: "20px",
    bottom: "8px",
  };

  return (
    <div style={progressBarStyle}>
      <div style={redStyle}>
        <span style={progresstextred}>{redWidth}</span>
      </div>
      <div style={greenStyle}>
        <span style={progresstextgreen}>{greenWidth}</span>
      </div>
    </div>
  );
}

export { ColoredProgressBar };

export default OptionAnalysisBelowTable;
