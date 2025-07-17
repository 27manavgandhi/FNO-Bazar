import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import style from "./Indices.module.css";
import { db, futureDB } from "../../firebase";

import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useFavourites } from "../../contexts/FavouritesContext";
function Indices(props) {
  const [strikeName, setStrikeName] = useState([]);
  const [ivcData, setIvcData] = useState([]);
  const [loading, setLoading] = useState(false);
  // favourites options and functions
  const id = "indices";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Indices";
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
    // load the star If Already Marked....
    const index = favourites.findIndex((component) => component.id === id);
    if (index !== -1) {
      setFavouritesToggle(true);
    }
  }, []);
  useEffect(() => {
    let temp = [];
    let name;
    let strike = [];
    const dbRef = ref(futureDB, `tick/Index`);
    onValue(dbRef, (snapshot) => {
      name = snapshot.val();

      for (let key in name) {
        strike.push(key);
      }
      temp = snapshot.val();
      console.log(temp);
      console.log(strike);
      if (!loading) {
        setLoading(true);
      }
    });
    setIvcData(temp);
    setStrikeName(strike);
  }, [loading]);
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
              {/* call columns */}
              <th className={style.strike_prices} data-theme={props.theme}>
                Index
              </th>
              <th>value</th> <th>Change</th> <th>Adv/Dec Ratio</th>{" "}
            </tr>
          </thead>
          <tbody>
            {strikeName.map((strike) => {
              return (
                <tr key={strike}>
                  <td
                    className={`${style.strike_prices} textbold`}
                    data-theme={props.theme}
                  >
                    {strike}
                  </td>
                  <td>{ivcData[strike]?.LTP}</td>
                  <td>
                    {(
                      ivcData[strike]?.LTP - ivcData[strike]?.Prev_Close
                    ).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Indices;
