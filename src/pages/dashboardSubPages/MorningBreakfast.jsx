import React, { useEffect, useState } from "react";
import {
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

import { useFavourites } from "../../contexts/FavouritesContext";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
const MorningBreakfast = (props) => {
  const {
    morningBreakfastData,
    setMorningBreakfastData,
    handleMorningBreakfastDataChange,
    positiveValue,
    negativeValue,
  } = props;

  const { currentUser } = useAuth();
  // favourites options and functions
  const id = "morningbreakfast";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Morning Breakfast";
    const index = favourites.findIndex((component) => component.id === id);
    // console.log({ favourites });

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
      <div
        className="dailyactivities-morningbreakfast"
        data-theme={props.theme}
      >
        <TableContainer
          component={Paper}
          sx={{
            background:
              props.theme === "dark" ? "rgba(38, 40, 47, 0.6)" : "transparent",
            width: "100%",
            color: props.theme === "light" ? "black" : "white",
          }}
          data-theme={props.theme}
        >
          <Table
            aria-label="simple table"
            className="morning-breakfast-table"
            data-theme={props.theme}
          >
            <TableBody>
              <TableRow>
                <TableCell>
                  <b>SGX NIFTY</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.sgxnifty}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        sgxnifty: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        sgxnifty: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>DOW JONES</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.dowjones}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        dowjones: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        dowjones: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>ADRs</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.adrs}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        adrs: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        adrs: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>
                    ANY PREVIOUS DAY IMPORTANT NEWS WHICH CAME AFTER MARKET
                    HOURS
                  </b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.anyprevdaynews}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        anyprevdaynews: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        anyprevdaynews: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>EVENT DAY CALENDAR</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.eventdaycalendar}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        eventdaycalendar: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        eventdaycalendar: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>FII AND DII DATA</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.fiianddiidata}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        fiianddiidata: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        fiianddiidata: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>TREND</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.trend}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        trend: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        trend: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>GLOBAL MARKET</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.globalmarket}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        globalmarket: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        globalmarket: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>SUPPORT AND RESISTANCE</b>
                </TableCell>
                <TableCell align="center">
                  <RadioGroup
                    row
                    sx={{ justifyContent: "center" }}
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={morningBreakfastData.supportandresistance}
                    onChange={(e) => {
                      setMorningBreakfastData({
                        ...morningBreakfastData,
                        supportandresistance: e.target.value,
                      });
                      handleMorningBreakfastDataChange(currentUser.uid, {
                        ...morningBreakfastData,
                        supportandresistance: e.target.value,
                      });
                    }}
                  >
                    <FormControlLabel
                      value="Yes"
                      control={<Radio />}
                      label="Positive"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio />}
                      label="Negative"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        Postive: {positiveValue}
        <br />
        Negative: {negativeValue}
      </div>
    </>
  );
};

export default MorningBreakfast;
