import React, { useEffect, useState } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useFavourites } from "../../contexts/FavouritesContext";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
function AdvanceDeclineRatio(props) {
  const { stockData, strikePrice } = props;
  const [isActive, setIsActive] = useState(false);
  const [advanceChartDataSet, setAdvanceChartDataSet] = useState([]);
  // const [resultDate, setResultDate] = useState([]);
  // favourites options and functions
  const id = "advancedeclineratio";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Advance Decline Ratio";
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
  let advancingStockCount = 0;
  let decliningStockCount = 0;
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // plugins: {
    //   annotation: {
    //     borderColor: props.theme === "dark" ? "red" : "blue", // Initial color based on theme
    //   },
    // },
    scales: {
      x: {
        grid: {
          color:
            props.theme === "dark" ? "rgba(228, 228, 228, 0.28)" : "#e0dfe4", // Initial color based on theme
        },
      },
      y: {
        grid: {
          color:
            props.theme === "dark" ? "rgba(228, 228, 228, 0.28)" : "#e0dfe4", // Initial color based on theme
        },
      },
    },
  };
  useEffect(() => {
    let temp = [];
    let tempCount = advancingStockCount;
    temp.push(tempCount);
    for (let i = 0; i < 3; i++) {
      tempCount = tempCount / 2;
      temp.unshift(Math.round(tempCount));
    }
    temp.unshift(0);
    setAdvanceChartDataSet(temp);
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
  }, []);
  console.log(advanceChartDataSet);

  if (!stockData) return <>loading...</>;

  return (
    <div
      style={{
        margin: "1rem",
      }}
    >
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
      <div
        style={{
          padding: "2rem",
          position: "relative",
          height: "20rem",
          width: "80vw",
          margin: "auto",
        }}
      >
        <Line
          data={{
            labels: [0.0, 0.2, 0.4, 0.6, 0.8],
            datasets: [
              {
                label: "Advancing Stocks",
                data: advanceChartDataSet,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
              },
              {
                label: "Declining Stocks",
                data: [0, 10, 18, 22, 26],
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
              },
            ],
          }}
          options={options}
        />
      </div>
      <div
        style={{
          margin: "1rem",
          backgroundColor: props.theme === "dark" ? "#181A26" : "#E0DFE4",
          padding: "0.8rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          color: props.theme === "dark" ? "white" : "#000000",
        }}
        onClick={() => setIsActive(!isActive)}
      >
        <h5>
          View Advancing/Declining Stocks {isActive ? <>&uarr;</> : <>&darr;</>}
        </h5>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {" "}
          <div style={{ display: `${isActive ? "block" : "none"}` }}>
            <b>Advancing Stocks</b>
            <ul>
              {strikePrice.map((strike, i) => {
                if (stockData[strike].LTP - stockData[strike].Prev_Close < 0)
                  return null;
                advancingStockCount++;
                return <li key={strike}> {strike}</li>;
              })}
            </ul>
            Total Advancing Stocks {advancingStockCount}
            <hr />
          </div>
          <div
            style={{
              display: `${isActive ? "block" : "none"}`,
            }}
          >
            <b>Declining Stocks</b>
            <ul>
              {strikePrice.map((strike, i) => {
                if (stockData[strike].LTP - stockData[strike].Prev_Close > 0)
                  return null;
                decliningStockCount++;
                return <li key={strike}> {strike}</li>;
              })}
            </ul>
            <br />
            <span style={{ fontWeight: "700" }}>
              {" "}
              Total Declining Stocks: {decliningStockCount}
            </span>
          </div>
        </div>
        Advance/Decline Ratio:{advancingStockCount}/{decliningStockCount}
      </div>
    </div>
  );
}

export default AdvanceDeclineRatio;
