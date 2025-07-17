import React, { useEffect, useState } from "react";
import style from "./UpTable.module.css";
import UpTable from "./UpTable";
import DownTable from "./DownTable";
import FutureAnalysisContentTable from "./FutureAnalysisContentTable";
import { db, futureDB, app } from "../../firebase";
import { onValue, ref, getDatabase, get } from "firebase/database";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useFavourites } from "../../contexts/FavouritesContext";
function calculateTimeDifference(timeInterval) {
  var userMinutesInput = timeInterval;

  var now = new Date();
  var startHour = 9;
  var startMinute = 15;
  var endHour = 15;
  var endMinute = 30;

  var currentHour = now.getHours();
  var currentMinute = now.getMinutes();

  // Convert current time to minutes for easier comparison
  var currentTimeInMinutes = currentHour * 60 + currentMinute;
  var startTimeInMinutes = startHour * 60 + startMinute;
  var endTimeInMinutes = endHour * 60 + endMinute;

  if (
    currentTimeInMinutes >= startTimeInMinutes &&
    currentTimeInMinutes <= endTimeInMinutes
  ) {
    var updatedTimeInMinutes = currentTimeInMinutes - userMinutesInput;
    if (updatedTimeInMinutes < startTimeInMinutes) {
      const time = endTimeInMinutes - timeInterval;
      let updatedTimeHour = Math.floor(time / 60);
      let updatedTimeMinute = time % 60;
      let formattedTimex = formatTimeWithAMPM(
        updatedTimeHour,
        updatedTimeMinute
      );
      return formattedTimex;
    }
    let updatedHour = Math.floor(updatedTimeInMinutes / 60);
    let updatedMinute = updatedTimeInMinutes % 60;
    let formattedTime = formatTimeWithAMPM(updatedHour, updatedMinute);
    return formattedTime;
  } else {
    const time = endTimeInMinutes - timeInterval;
    let updatedTimeHour = Math.floor(time / 60);
    let updatedTimeMinute = time % 60;
    let formattedTimex = formatTimeWithAMPM(updatedTimeHour, updatedTimeMinute);
    return formattedTimex;
  }
}

function formatTimeWithAMPM(hours, minutes) {
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)
  var formattedHour = hours.toString();
  var formattedMinute = ("0" + minutes).slice(-2); // Add a leading zero to minutes
  var formattedTime = formattedHour + ":" + formattedMinute + " " + ampm;
  return formattedTime;
}

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

export default function FutureAnalysisTable({ tableData, titleList, theme }) {
  const [topFutureList15, setTopFutureList15] = useState([]);
  const [topFutureList30, setTopFutureList30] = useState([]);
  const [topFutureList45, setTopFutureList45] = useState([]);
  const [topFutureList60, setTopFutureList60] = useState([]);
  const [downFutureList15, setDownFutureList15] = useState([]);
  const [downFutureList30, setDownFutureList30] = useState([]);
  const [downFutureList45, setDownFutureList45] = useState([]);
  const [downFutureList60, setDownFutureList60] = useState([]);
  const [componentLoading, setComponentLoading] = useState(true);
  const [futureExpiry, setFutureExpiry] = useState();

  const [url15minutes, setUrl15minutes] = useState(calculateTimeDifference(15));

  const [url30minutes, setUrl30minutes] = useState(calculateTimeDifference(30));
  const [url45minutes, setUrl45minutes] = useState(calculateTimeDifference(45));
  const [url60minutes, setUrl60minutes] = useState(calculateTimeDifference(60));
  console.log("23" + getMonth().slice(0, 3).toUpperCase());
  // favourites options and functions
  const id = "futureanalysis";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Future Analysis";
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
    const dbRef = ref(
      futureDB,
      `/recent data/${url15minutes}/Future/${futureExpiry}`
    );
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((snapshot) => {
        tempData.push(snapshot.val());
        downData.push(snapshot.val());
      });
      setTopFutureList15(dataSort(tempData));

      setDownFutureList15(dataSortDown(downData));
    });
  }, [futureExpiry]);

  useEffect(() => {
    let tempData = [];
    let downData = [];
    const dbRef = ref(
      futureDB,
      `/recent data/${url30minutes}/Future/${futureExpiry}`
    );
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((snapshot) => {
        tempData.push(snapshot.val());
        downData.push(snapshot.val());
      });
      setTopFutureList30(dataSort(tempData));
      setDownFutureList30(dataSortDown(downData));
      console.log(topFutureList30);
    });
  }, [futureExpiry]);
  useEffect(() => {
    let tempData = [];
    let downData = [];
    const dbRef = ref(
      futureDB,
      `/recent data/${url45minutes}/Future/${futureExpiry}`
    );
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((snapshot) => {
        tempData.push(snapshot.val());
        downData.push(snapshot.val());
      });
      setTopFutureList45(dataSort(tempData));
      setDownFutureList45(dataSortDown(downData));
    });
  }, [futureExpiry]);
  useEffect(() => {
    let tempData = [];
    let downData = [];
    const dbRef = ref(
      futureDB,
      `/recent data/${url60minutes}/Future/${futureExpiry}`
    );
    onValue(dbRef, (snapshot) => {
      snapshot.forEach((snapshot) => {
        tempData.push(snapshot.val());
        downData.push(snapshot.val());
      });
      setTopFutureList60(dataSort(tempData));
      setDownFutureList60(dataSortDown(downData));
    });
  }, [futureExpiry]);

  function dataSort(tempData) {
    const tempArray = tempData.sort((a, b) => {
      return b.LTP - b.Prev_Close - (a.LTP - a.Prev_Close);
    });

    return tempArray;
  }
  function dataSortDown(tempData) {
    const tempArray = tempData.sort((a, b) => {
      return a.LTP - a.Prev_Close - (b.LTP - b.Prev_Close);
    });

    return tempArray;
  }

  if (tableData.length <= 0) return <>loading...</>;
  return (
    <div>
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
      <div className={style.tableContainer}>
        <UpTable
          topFutureList15={topFutureList15}
          topFutureList30={topFutureList30}
          topFutureList45={topFutureList45}
          topFutureList60={topFutureList60}
          futureExpiry={futureExpiry}
        />
        <DownTable
          downFutureList15={downFutureList15}
          downFutureList30={downFutureList30}
          downFutureList45={downFutureList45}
          downFutureList60={downFutureList60}
          futureExpiry={futureExpiry}
        />
      </div>
      <FutureAnalysisContentTable
        tableData={tableData}
        titleList={titleList}
        theme={theme}
      />
    </div>
  );
}
