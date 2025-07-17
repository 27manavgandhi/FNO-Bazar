import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import StrategyBuilderTable from "./StrategyBuilderTable";
import StrategyBuilder from "./StrategyBuilder";

function PortfolioModal(props) {
  const { expiryDates, strikeArray } = props;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
    <div>
      <Button
        sx={{
          backgroundColor: props.theme === "light" ? "black" : "white",
          color: props.theme === "light" ? "white" : "black",
          fontWeight: "bold",
        }}
        onClick={handleOpen}
      >
        Create Strategy
      </Button>
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
        <Box sx={style}>haris</Box>
      </Modal>
      <StrategyBuilderTable />
    </div>
  );
}

export default PortfolioModal;
