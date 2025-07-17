import React, { useEffect, useState } from "react";
import style from "./IndexVolumeComparison.module.css";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { app } from "../../firebase";
import { futureDB } from "../../firebase";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
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
function generateTimestampArray() {
  const startTimestamp = new Date();
  startTimestamp.setHours(9, 15, 0, 0); // Set the start time to 9:18 AM
  const endTimestamp = new Date();
  endTimestamp.setHours(15, 30, 0, 0); // Set the end time to 3:30 PM

  const timestamps = [];
  let currentTimestamp = new Date(startTimestamp);

  while (currentTimestamp <= endTimestamp) {
    const formattedTimestamp = currentTimestamp.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    timestamps.push(formattedTimestamp);
    currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 5);
  }

  return timestamps;
}

export default function IndexVolumeComparison(props) {
  const [niftyData, setNiftyData] = useState([]);
  const [bankNiftyData, setBankNiftyData] = useState([]);
  const [oiNiftyData, setOiNiftyData] = useState([]);
  const [oiBankNiftyData, setOiBankNiftyData] = useState([]);
  const timestampsArray = generateTimestampArray();
  const [componentLoading, setComponentLoading] = useState(true);
  const [futureExpiry, setFutureExpiry] = useState();
  let niftyhigh = 0;
  let niftylow = Number.POSITIVE_INFINITY;
  let bankNiftyhigh = 0;
  let bankNiftylow = Number.POSITIVE_INFINITY;

  // favourites options and functions
  const id = "indexvolumecomparison";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Index Volume Comparison";
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
      // load the star If Already Marked....
      const index = favourites.findIndex((component) => component.id === id);
      if (index !== -1) {
        setFavouritesToggle(true);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    let tempData = [];
    let downData = [];
    let futureNiftyData = [];
    let futureBankNiftyData = [];
    for (let i = 0; i < timestampsArray.length; i++) {
      const dbRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Index/NIFTY 50`
      );
      const bankRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Index/NIFTY BANK`
      );
      const futureNiftyRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Future/${futureExpiry}/NIFTY FUT`
      );
      const futureBankNiftyRef = ref(
        futureDB,
        `/recent data/${timestampsArray[i]}/Future/${futureExpiry}/BANKNIFTY FUT`
      );
      onValue(dbRef, (snapshot) => {
        downData.push(snapshot.val());

        if (i == timestampsArray.length - 1) console.log("haris");
      });
      onValue(bankRef, (snapshot) => {
        tempData.push(snapshot.val());

        if (i == timestampsArray.length - 1) console.log("haris");
      });
      onValue(futureNiftyRef, (snapshot) => {
        futureNiftyData.push(snapshot.val());

        if (i == timestampsArray.length - 1) console.log("haris");
      });
      onValue(futureBankNiftyRef, (snapshot) => {
        futureBankNiftyData.push(snapshot.val());

        if (i == timestampsArray.length - 1) console.log("haris");
      });
    }
    setNiftyData(downData);
    setBankNiftyData(tempData);
    setOiNiftyData(futureNiftyData);
    setOiBankNiftyData(futureBankNiftyData);
  }, [futureExpiry]);
  console.log(oiNiftyData);
  return (
    <>
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
      <div className={style.container}>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              <td colSpan={10}>Nifty</td>
            </tr>
            <tr>
              {/* call columns */}
              <th
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Time
              </th>
              <th>Today</th> <th>Yesterday</th> <th>Difference</th>{" "}
              <th>High</th> <th>Low</th> <th>Nifty Future</th>
              <th>Future Change</th>
              <th>OI</th>
              <th>COI</th>
            </tr>
          </thead>
          <tbody>
            {timestampsArray.map((time, i) => {
              niftyhigh = Math.max(niftyData[i]?.LTP, niftyhigh);
              niftylow = Math.min(niftyData[i]?.LTP, niftylow);
              return (
                <tr key={time}>
                  {/* call columns */}
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    {time}
                  </td>
                  <td>{niftyData[i]?.LTP}</td>{" "}
                  <td>{niftyData[i]?.Prev_Close}</td>{" "}
                  <td>
                    {(niftyData[i]?.LTP - niftyData[i]?.Prev_Close).toFixed(2)}
                  </td>{" "}
                  <td>{niftyhigh}</td> <td>{niftylow}</td> <td>Nifty Future</td>
                  <td>
                    {(niftyData[i]?.LTP - niftyData[i]?.Prev_Close).toFixed(2)}
                  </td>
                  <td>{oiNiftyData[i]?.OI?.toFixed(0)}</td>
                  <td>
                    {(oiNiftyData[i]?.OI - oiNiftyData[i]?.Prev_Close)?.toFixed(
                      0
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <table className={style.tableContainer} data-theme={props.theme}>
          <thead>
            <tr>
              <td colSpan={10}>BankNifty</td>
            </tr>
            <tr>
              {/* call columns */}
              <th
                className={`${style.strike_prices} textbold`}
                data-theme={props.theme}
              >
                Time
              </th>
              <th>Today</th> <th>Yesterday</th> <th>Difference</th>{" "}
              <th>High</th> <th>Low</th> <th>Nifty Future</th>
              <th>Future Change</th>
              <th>OI</th>
              <th>COI</th>
            </tr>
          </thead>
          <tbody>
            {timestampsArray.map((time, i) => {
              bankNiftyhigh = Math.max(bankNiftyData[i]?.LTP, bankNiftyhigh);
              bankNiftylow = Math.min(bankNiftyData[i]?.LTP, bankNiftylow);
              return (
                <tr key={time}>
                  {/* call columns */}
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    {time}
                  </td>
                  <td>{bankNiftyData[i]?.LTP}</td>{" "}
                  <td>{bankNiftyData[i]?.Prev_Close}</td>{" "}
                  <td>
                    {(
                      bankNiftyData[i]?.LTP - bankNiftyData[i]?.Prev_Close
                    ).toFixed(2)}
                  </td>{" "}
                  <td>{bankNiftyhigh}</td> <td>{bankNiftylow}</td>{" "}
                  <td>Nifty Future</td>
                  <td>
                    {" "}
                    {(
                      bankNiftyData[i]?.LTP - bankNiftyData[i]?.Prev_Close
                    ).toFixed(2)}
                  </td>
                  <td>{oiBankNiftyData[i]?.OI?.toFixed(0)}</td>
                  <td>
                    {(
                      oiBankNiftyData[i]?.OI - oiBankNiftyData[i]?.Prev_Close
                    )?.toFixed(0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
