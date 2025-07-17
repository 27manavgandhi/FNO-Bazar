import {
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useFavourites } from "../../contexts/FavouritesContext";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
const DailyJournal = (props) => {
  const {
    fetchedJournals,
    setCurrentJournal,
    currentJournal,
    updateJournal,
    handleDeleteJournal,
    handleCreateJournal,
  } = props;
  const genUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };
  const { currentUser } = useAuth();
  // favourites options and functions
  const id = "dailyjournal";
  const { addFavourite, removeFavourite, favourites } = useFavourites();
  const [favouritesToggle, setFavouritesToggle] = useState(false);
  const handleToggleFavourite = (id) => {
    const label = "Daily Journal";
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
        className="dailyactivities-dailyjournal"
        style={{ position: "relative" }}
        data-theme={props.theme}
      >
        <div className="dailyjournal-journal-list">
          <h3 id="saved-journals-title">Saved Journals</h3>

          <Paper
            spacing={1}
            variant="none"
            className="dailyjournal-journal-list-container"
            style={{
              height: "50vh",
              overflow: "auto",
              background: props.theme === "dark" ? "#e0e0e4" : "transparent",
            }}
          >
            {fetchedJournals === null ||
            (fetchedJournals && fetchedJournals.length === 0) ? (
              <p
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "80%",
                  color: "grey",
                  marginLeft: "-16px",
                }}
              >
                You have 0 journals.
              </p>
            ) : (
              fetchedJournals.map((journal) => {
                return (
                  <Card
                    sx={{
                      maxWidth: 345,
                      background:
                        props.theme === "dark" ? "#fafafa" : "transparent",
                      marginTop: "8px",
                    }}
                    className="dailyjournal-journal-list-item"
                    onClick={() => {
                      setCurrentJournal(journal);
                    }}
                    key={journal.journal_id}
                  >
                    <CardActionArea>
                      <CardContent>
                        <Typography variant="h7" component="div">
                          <b>{journal.title}</b>
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "12px" }}
                        >
                          Created:{" "}
                          <b>
                            {journal.createdOn
                              .toDate()
                              .toLocaleDateString("en-in") +
                              " " +
                              journal.createdOn.toDate().toLocaleTimeString()}
                          </b>
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "12px" }}
                        >
                          Last Edited:{" "}
                          <b>
                            {journal.lastModified
                              .toDate()
                              .toLocaleDateString("en-in") +
                              " " +
                              journal.lastModified
                                .toDate()
                                .toLocaleTimeString()}
                          </b>
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })
            )}
          </Paper>
        </div>

        <div className="dailyjournal-journal-editor-area">
          {/* Journal editor here */}
          {currentJournal ? (
            <div className="dailyjournal-journal-editor">
              <div className="dailyjournal-journal-editor-title-bar">
                <div className="dailyjournal-journal-editor-title-bar-info">
                  <textarea
                    maxLength={100}
                    className="journal-content-title-editor-area"
                    value={currentJournal.title}
                    placeholder="Add entry title"
                    wrap="hard"
                    onChange={(e) => {
                      setCurrentJournal({
                        ...currentJournal,
                        title: e.target.value,
                      });
                    }}
                  />
                  <p style={{ display: "flex", gap: "32px" }}>
                    <span>
                      {"Created: "}{" "}
                      <b>
                        {currentJournal.createdOn
                          .toDate()
                          .toLocaleDateString("en-in")}{" "}
                        -{" "}
                        {currentJournal.createdOn.toDate().toLocaleTimeString()}
                      </b>
                    </span>
                    <span>
                      {"Last Modified: "}{" "}
                      <b>
                        {currentJournal.lastModified
                          .toDate()
                          .toLocaleDateString("en-in")}{" "}
                        -{" "}
                        {currentJournal.lastModified
                          .toDate()
                          .toLocaleTimeString("en-in")}{" "}
                      </b>
                    </span>
                  </p>
                </div>
                <div>
                  <button
                    className="journal-editor-close"
                    onClick={() => {
                      setCurrentJournal(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="dailyjournal-journal-editor-content">
                <textarea
                  id={"editor-area-" + currentJournal.journal_id}
                  maxLength={1000}
                  className="journal-content-editor-area"
                  value={currentJournal.content}
                  placeholder="Write here..."
                  wrap="hard"
                  onChange={(e) => {
                    setCurrentJournal({
                      ...currentJournal,
                      content: e.target.value,
                    });
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  className="save-journal-button"
                  onClick={() => {
                    updateJournal(currentUser.uid, currentJournal.journal_id, {
                      ...currentJournal,
                      lastModified: new Date(),
                    });
                  }}
                >
                  Save
                </button>
                <button
                  className="delete-journal-button"
                  onClick={() => {
                    handleDeleteJournal(currentJournal.journal_id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div
              className="dailyjournal-journal-editor-empty"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <p style={{ color: "grey" }}>No Journal Selected</p>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: props.theme === "light" ? "black" : "white",
                  color: props.theme === "light" ? "white" : "black",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  console.log(genUUID());
                  handleCreateJournal(currentUser.uid);
                }}
              >
                Create New Journal Entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DailyJournal;
