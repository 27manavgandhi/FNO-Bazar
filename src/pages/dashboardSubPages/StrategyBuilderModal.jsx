import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import StrategyBuilderTable from "./StrategyBuilderTable";
import StrategyBuilder from "./StrategyBuilder";
import { ref, onValue } from "firebase/database";
import { futureDB } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
function StrategyBuilderModal(props) {
  // const { expiryDates, strikeArray, data } = props;
  const [open, setOpen] = React.useState(false);
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  useEffect(() => {
    const dbRef = ref(futureDB, `/Strategies/${currentUser.uid}`);

    onValue(dbRef, (snapshot) => {
      let temp = [];
      snapshot.forEach((snap) => {
        temp.push(snap.val());
      });
      console.log(temp);

      setData(temp);
    });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // favourites options and functions
  const id = "strategybuilder";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Strategy Builder";
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
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    bgcolor: props.theme === "dark" ? "rgba(0, 4, 18, 1)" : "background.paper",

    boxShadow: 24,
    p: 4,
    borderRadius: "6px",
  };
  return (
    <div className="position-relative">
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
      <StrategyBuilderTable data={data} />
      <div style={{ position: "relative", top: 2, left: 2 }}>
        <Button
          sx={{
            backgroundColor: props.theme === "light" ? "black" : "white",
            color: props.theme === "light" ? "white" : "black",
            fontWeight: "bold",
          }}
          onClick={handleOpen}
          variant="contained"
        >
          Create Strategy
        </Button>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {/* <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box> */}
        <Box sx={style}>
          <StrategyBuilder
          // strikeArray={strikeArray}
          // expiryDates={expiryDates}
          // indexWiseExpiry={indexWiseExpiry}
          />
        </Box>
      </Modal>
    </div>
  );
}

export default StrategyBuilderModal;
