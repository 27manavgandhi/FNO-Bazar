import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getDatabase, ref, onValue, off, get } from "firebase/database";
import { app, futureDB } from "../firebase";
import "./DashboardHeader.css";
import "../App.css";
import FilterListIcon from "@mui/icons-material/FilterList";
import logoSvg from "../assets/logo.svg";
import dashBoardMenu from "../assets/dashboardMenu.svg";
import darkLogoSvg from "../assets/logo-dark.svg";
import lightModeButton from "../assets/lightModeButton.svg";
import darkModeButton from "../assets/darkModeButton.svg";
import userIcon from "../assets/user-icon.svg";
import redDown from "../assets/down-arrow-red.png";
import greenUp from "../assets/green-arrow-up.png";
import { GiHamburgerMenu, GiCancel } from "react-icons/gi";
import NavDropdown from "react-bootstrap/NavDropdown";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { CardContent, Card, Tabs, Tab } from "@mui/material";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { ReactComponent as DashBoardMenu } from "../assets/dashboardMenu.svg";
const DashBoardHeader = (props) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [error, setError] = useState("");
  const [userImgUrl, setUserImgUrl] = useState("");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState({
    nifty: {
      current: 0,
      change: 0,
      prevclose: 0,
      todaysLow: 0,
      todaysHigh: 0,
    },
    bankNifty: {
      current: 0,
      change: 0,
      prevclose: 0,
      todaysLow: 0,
      todaysHigh: 0,
    },
    niftyfut: {
      current: 0,
      change: 0,
    },
    bankNiftyFut: {
      current: 0,
      change: 0,
    },
  });
  const [optionTab, setOptionTab] = useState("option");
  const rtdb = getDatabase(app);
  useEffect(() => {
    const nifty50Ref = ref(rtdb, "tick/Index/NIFTY 50");

    const niftyBankRef = ref(rtdb, "tick/Index/NIFTY BANK");
    let niftyFutOnVal;
    let niftyBankOnVal;
    const futRef = ref(rtdb, "tick/Future");
    //get object and its first key from futRef
    get(futRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const keys = Object.keys(data);
        const niftyFutRef = ref(rtdb, "tick/Future/" + keys[0] + "/NIFTY FUT");
        const niftyBankFutRef = ref(
          rtdb,
          "tick/Future/" + keys[0] + "/BANKNIFTY FUT"
        );
        niftyFutOnVal = onValue(niftyFutRef, (snapshot) => {
          if (snapshot.val()) {
            const { LTP, Prev_Close } = snapshot.val();
            setTableData((prev) => {
              return {
                ...prev,
                niftyfut: {
                  ...prev.niftyfut,
                  current: LTP.toFixed(2),
                  change: (LTP - Prev_Close).toFixed(2),
                },
              };
            });
          }
        });
        niftyBankOnVal = onValue(niftyBankFutRef, (snapshot) => {
          if (snapshot.val()) {
            const { LTP, Prev_Close } = snapshot.val();
            setTableData((prev) => {
              return {
                ...prev,
                bankNiftyFut: {
                  ...prev.bankNiftyFut,
                  current: LTP.toFixed(2),
                  change: (LTP - Prev_Close).toFixed(2),
                },
              };
            });
          }
        });
      }
    });

    onValue(nifty50Ref, (snapshot) => {
      if (snapshot.val()) {
        const { LTP, Prev_Close, Low, High } = snapshot.val();
        setTableData((prev) => {
          return {
            ...prev,
            nifty: {
              ...prev.nifty,
              current: LTP.toFixed(2),
              change: (LTP - Prev_Close).toFixed(2),
              todaysHigh: High.toFixed(2),
              todaysLow: Low.toFixed(2),
            },
          };
        });
      }
    });
    onValue(niftyBankRef, (snapshot) => {
      if (snapshot.val()) {
        const { LTP, Prev_Close, Low, High } = snapshot.val();
        setTableData((prev) => {
          return {
            ...prev,
            bankNifty: {
              ...prev.bankNifty,
              current: LTP.toFixed(2),
              change: (LTP - Prev_Close).toFixed(2),
              todaysHigh: High.toFixed(2),
              todaysLow: Low.toFixed(2),
            },
          };
        });
      }
    });
    // Clean up the listener when the component unmounts
    return () => {
      // Detach the listener when the component unmounts
      off(nifty50Ref);
      off(niftyBankRef);
      // off(niftyFutOnVal)
      // off(niftyBankOnVal)
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.photoURL) {
        setUserImgUrl(currentUser.photoURL);
        return;
      }
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();

          if (userData && userData.hasOwnProperty("image_url")) {
            setUserImgUrl(userData.image_url);
            // You can store the imageUrl in a variable here or perform other actions.
          } else {
            setUserImgUrl("");
          }
        }
      });
    }
  }, [currentUser]);
  console.log("userImgUrl", userImgUrl, currentUser.photoURL);
  const handleLogout = async () => {
    setError("");
    try {
      await logout();
      navigate("/");
    } catch {}
  };
  const [toggle, setToggle] = useState(false);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: props.theme === "dark" ? "rgba(0, 4, 18, 1)" : "background.paper",
    border: "1px solid #000",
    boxShadow: 15,
    borderRadius: "1rem",
  };
  return (
    <>
      <div
        variant={props.theme}
        className={`dashboard-header navbar-custom p-2 `}
      >
        <div className="header-wrapper">
          {/* image container  */}
          <div className="logo-container">
            <img
              className="navbar-logo"
              src={props.theme === "light" ? logoSvg : darkLogoSvg}
              alt="FnO-Bazaar"
            />
          </div>
          {/* // navlinks and table  */}
          <div className="canvas-body">
            <Nav id="dashboard-nav" navbarScroll data-theme={props.theme}>
              {" "}
              <Nav.Link
                as={Link}
                onClick={() => {
                  props.tabSwitcher("home");
                }}
                className={props.curTab === "home" ? "active" : "inactive"}
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                onClick={() => {
                  props.tabSwitcher("option");
                }}
                className={props.curTab === "option" ? "active" : "inactive"}
              >
                Option
              </Nav.Link>
              <Nav.Link
                as={Link}
                onClick={() => {
                  props.tabSwitcher("future");
                }}
                className={props.curTab === "future" ? "active" : "inactive"}
              >
                Future
              </Nav.Link>
              <Nav.Link
                as={Link}
                onClick={() => {
                  props.tabSwitcher("stock");
                }}
                className={props.curTab === "stock" ? "active" : "inactive"}
              >
                Stock
              </Nav.Link>
              <Nav.Link
                as={Link}
                onClick={() => {
                  props.tabSwitcher("dailyactivities");
                }}
                className={
                  props.curTab === "dailyactivities" ? "active" : "inactive"
                }
              >
                Tools
              </Nav.Link>
              {/* //OTHERS LINKS */}
              {/* <Nav.Link
                as={Link}
                onClick={() => {
                  props.tabSwitcher("others");
                }}
                className={props.curTab === "others" ? "active" : "inactive"}
              >
                Others
              </Nav.Link> */}
              <Nav.Link
                as={Link}
                onClick={() => {
                  props.tabSwitcher("portfolio");
                }}
                className={props.curTab === "portfolio" ? "active" : "inactive"}
              >
                Portfolio
              </Nav.Link>
            </Nav>
            {/* TABLE CONTETNT  */}
            {tableData && (
              <div className="live-data-header" data-theme={props.theme}>
                <div className="live-data-header-container">
                  <div className="live-data-header-card">
                    <p className="live-data-header-title">Nifty 50</p>
                    <div
                      style={
                        tableData.nifty.change >= 0
                          ? { color: "green" }
                          : { color: "red" }
                      }
                    >
                      <p className="live-data-header-index-number" id="zoom">
                        <b>
                          <img
                            src={
                              tableData.nifty.change >= 0 ? greenUp : redDown
                            }
                            alt="index move"
                          />{" "}
                          {tableData.nifty.current}
                        </b>
                      </p>
                      <p id="zoom">
                        {(tableData.nifty.change >= 0 ? "+" : "") +
                          tableData.nifty.change +
                          " (" +
                          (
                            (tableData.nifty.change / tableData.nifty.current) *
                            100
                          ).toFixed(2) +
                          "%)"}
                      </p>
                    </div>
                  </div>
                  {/* <div className="live-data-header-card">
                        <p className="live-data-header-title">Nifty Fut</p>
                        <div
                          style={
                            tableData.niftyfut.change >= 0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p
                            className="live-data-header-index-number"
                            id="zoom"
                          >
                            <b>
                              <img
                                src={
                                  tableData.niftyfut.change >= 0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {tableData.niftyfut.current}
                            </b>
                          </p>
                          <p id="zoom">
                            {(tableData.niftyfut.change >= 0 ? "+" : "") +
                              tableData.niftyfut.change +
                              " (" +
                              (
                                (tableData.niftyfut.change /
                                  tableData.niftyfut.current) *
                                100
                              ).toFixed(2) +
                              "%)"}
                          </p>
                        </div>
                      </div> */}
                  <div className="live-data-header-card">
                    <p className="live-data-header-title">Bank Nifty</p>
                    <div
                      style={
                        tableData.bankNifty.change >= 0
                          ? { color: "green" }
                          : { color: "red" }
                      }
                    >
                      <p className="live-data-header-index-number" id="zoom">
                        <b>
                          <img
                            src={
                              tableData.bankNifty.change >= 0
                                ? greenUp
                                : redDown
                            }
                            alt="index move"
                          />{" "}
                          {tableData.bankNifty.current}
                        </b>
                      </p>
                      <p id="zoom">
                        {(tableData.bankNifty.change >= 0 ? "+" : "") +
                          tableData.bankNifty.change +
                          " (" +
                          (
                            (tableData.bankNifty.change /
                              tableData.bankNifty.current) *
                            100
                          ).toFixed(2) +
                          "%)"}
                      </p>
                    </div>
                  </div>
                  {/* <div className="live-data-header-card">
                        <p className="live-data-header-title">Bank Nifty Fut</p>
                        <div
                          style={
                            tableData.bankNiftyFut.change >= 0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p
                            className="live-data-header-index-number"
                            id="zoom"
                          >
                            <b>
                              <img
                                src={
                                  tableData.bankNiftyFut.change >= 0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {tableData.bankNiftyFut.current}
                            </b>
                          </p>
                          <p id="zoom">
                            {(tableData.bankNiftyFut.change >= 0 ? "+" : "") +
                              tableData.bankNiftyFut.change +
                              " (" +
                              (
                                (tableData.bankNiftyFut.change /
                                  tableData.bankNiftyFut.current) *
                                100
                              ).toFixed(2) +
                              "%)"}
                          </p>
                        </div>
                      </div> */}
                </div>

                <Button
                  style={{ cursor: "pointer", width: "max-content" }}
                  onClick={handleOpen}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 12"
                    fill={props.theme === "dark" ? "white" : "black"}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1H15"
                      stroke={props.theme === "dark" ? "white" : "black"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6 6L15 6"
                      stroke={props.theme === "dark" ? "white" : "black"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 11L15 11"
                      stroke={props.theme === "dark" ? "white" : "black"}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Button>
              </div>
            )}
            {/* BLUE HEADER MODAL  */}
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <div
                  className="high-low-header container-width"
                  data-theme={props.theme}
                >
                  <h5>Today's Market</h5>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <p>Down from Day's High</p>

                    <div className="high-low-header-container">
                      <div className="high-low-header-card">
                        <p className="high-low-header-title">Nifty 50</p>
                        <div
                          style={
                            tableData.nifty.todaysHigh -
                              tableData.nifty.current <=
                            0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p className="high-low-header-index-number" id="zoom">
                            <b>
                              <img
                                src={
                                  tableData.nifty.todaysHigh -
                                    tableData.nifty.current <=
                                  0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {(
                                tableData.nifty.todaysHigh -
                                tableData.nifty.current
                              ).toFixed(2)}
                            </b>
                          </p>
                        </div>
                      </div>
                      <div className="high-low-header-card">
                        <p className="high-low-header-title">BankNifty</p>
                        <div
                          style={
                            tableData.bankNifty.todaysHigh -
                              tableData.bankNifty.current <=
                            0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p className="high-low-header-index-number" id="zoom">
                            <b>
                              <img
                                src={
                                  tableData.bankNifty.todaysHigh -
                                    tableData.bankNifty.current <=
                                  0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {(
                                tableData.bankNifty.todaysHigh -
                                tableData.bankNifty.current
                              ).toFixed(2)}
                            </b>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <p>Recovery from Day's Low</p>
                    <div className="high-low-header-container">
                      <div className="high-low-header-card">
                        <p className="high-low-header-title">Nifty 50</p>
                        <div
                          style={
                            tableData.nifty.current -
                              tableData.nifty.todaysLow >=
                            0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p className="high-low-header-index-number" id="zoom">
                            <b>
                              <img
                                src={
                                  tableData.nifty.current -
                                    tableData.nifty.todaysLow >=
                                  0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {(
                                tableData.nifty.current -
                                tableData.nifty.todaysLow
                              ).toFixed(2)}
                            </b>
                          </p>
                        </div>
                      </div>
                      <div className="high-low-header-card">
                        <p className="high-low-header-title">BankNifty</p>
                        <div
                          style={
                            tableData.bankNifty.current -
                              tableData.bankNifty.todaysLow >=
                            0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p className="high-low-header-index-number" id="zoom">
                            <b>
                              <img
                                src={
                                  tableData.bankNifty.current -
                                    tableData.bankNifty.todaysLow >=
                                  0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {(
                                tableData.bankNifty.current -
                                tableData.bankNifty.todaysLow
                              ).toFixed(2)}
                            </b>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
            </Modal>
          </div>
          <div className="navbar-icons-group">
            {/* // DARK MODE TOGGLE BUTTON  */}
            <button id="light-dark-toggle" onClick={props.themeSwitcher}>
              <img
                src={props.theme === "light" ? lightModeButton : darkModeButton}
                alt="Light Mode"
              />
            </button>
            {/* // USER LOGIN  */}
            <Nav
              id="dashboard-header-usericon"
              className={`align-items-center gap-8 `}
              navbarScroll
            >
              <NavDropdown
                title={
                  <img
                    className="dashboard-header-user-icon"
                    src={userImgUrl ? userImgUrl : userIcon}
                    alt="user-img"
                  />
                }
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item as={"button"}>Profile</NavDropdown.Item>
                <NavDropdown.Item as={"button"}>Subscription</NavDropdown.Item>
                <NavDropdown.Item as={"button"}>Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  as={"button"}
                  onClick={handleLogout}
                  style={{ color: "red" }}
                >
                  Log Out
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </div>
          <div className="dashboard-header-smaller">
            {!toggle ? (
              <GiHamburgerMenu
                fontsize={30}
                onClick={() => setToggle(true)}
                className="app__navbar-smallscreen-menu"
              />
            ) : null}
            {toggle ? (
              <div
                className="app__navbar-smallscreen-overlay  slide-bottom"
                data-theme={props.theme}
              >
                <GiCancel
                  className="overlay__close"
                  fontsize={50}
                  color={props.theme === "light" ? "black" : "white"}
                  onClick={() => setToggle(false)}
                />
                <Nav
                  className="app__navbar-smallscreen-links"
                  onClick={() => setToggle(false)}
                  navbarScroll
                  data-theme={props.theme}
                >
                  {" "}
                  <Nav.Link
                    as={Link}
                    onClick={() => {
                      props.tabSwitcher("home");
                    }}
                    className={props.curTab === "home" ? "active" : "inactive"}
                  >
                    Home
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    onClick={() => {
                      props.tabSwitcher("option");
                    }}
                    className={
                      props.curTab === "option" ? "active" : "inactive"
                    }
                  >
                    Option
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    onClick={() => {
                      props.tabSwitcher("future");
                    }}
                    className={
                      props.curTab === "future" ? "active" : "inactive"
                    }
                  >
                    Future
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    onClick={() => {
                      props.tabSwitcher("stock");
                    }}
                    className={props.curTab === "stock" ? "active" : "inactive"}
                  >
                    Stock
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    onClick={() => {
                      props.tabSwitcher("dailyactivities");
                    }}
                    className={
                      props.curTab === "dailyactivities" ? "active" : "inactive"
                    }
                  >
                    Tools
                  </Nav.Link>
                  {/* //OTHERS LINKS */}
                  {/* <Nav.Link
                    as={Link}
                    onClick={() => {
                      props.tabSwitcher("others");
                    }}
                    className={
                      props.curTab === "others" ? "active" : "inactive"
                    }
                  >
                    Others
                  </Nav.Link> */}
                  <Nav.Link
                    as={Link}
                    onClick={() => {
                      props.tabSwitcher("portfolio");
                    }}
                    className={
                      props.curTab === "portfolio" ? "active" : "inactive"
                    }
                  >
                    Portfolio
                  </Nav.Link>
                </Nav>
              </div>
            ) : null}
          </div>
        </div>
        {error && <p className="dashboard-header-error">{error}</p>}
      </div>
      {/* TABLE CONTETNT  */}
      {tableData && (
        <div className="live-data-header-smaller" data-theme={props.theme}>
          <div className="live-data-header-container">
            <div className="live-data-header-card">
              <p className="live-data-header-title">Nifty 50</p>
              <div
                style={
                  tableData.nifty.change >= 0
                    ? { color: "green" }
                    : { color: "red" }
                }
              >
                <p className="live-data-header-index-number" id="zoom">
                  <b>
                    <img
                      src={tableData.nifty.change >= 0 ? greenUp : redDown}
                      alt="index move"
                    />{" "}
                    {tableData.nifty.current}
                  </b>
                </p>
                <p id="zoom">
                  {(tableData.nifty.change >= 0 ? "+" : "") +
                    tableData.nifty.change +
                    " (" +
                    (
                      (tableData.nifty.change / tableData.nifty.current) *
                      100
                    ).toFixed(2) +
                    "%)"}
                </p>
              </div>
            </div>
            {/* <div className="live-data-header-card">
                        <p className="live-data-header-title">Nifty Fut</p>
                        <div
                          style={
                            tableData.niftyfut.change >= 0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p
                            className="live-data-header-index-number"
                            id="zoom"
                          >
                            <b>
                              <img
                                src={
                                  tableData.niftyfut.change >= 0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {tableData.niftyfut.current}
                            </b>
                          </p>
                          <p id="zoom">
                            {(tableData.niftyfut.change >= 0 ? "+" : "") +
                              tableData.niftyfut.change +
                              " (" +
                              (
                                (tableData.niftyfut.change /
                                  tableData.niftyfut.current) *
                                100
                              ).toFixed(2) +
                              "%)"}
                          </p>
                        </div>
                      </div> */}
            <div className="live-data-header-card">
              <p className="live-data-header-title">Bank Nifty</p>
              <div
                style={
                  tableData.bankNifty.change >= 0
                    ? { color: "green" }
                    : { color: "red" }
                }
              >
                <p className="live-data-header-index-number" id="zoom">
                  <b>
                    <img
                      src={tableData.bankNifty.change >= 0 ? greenUp : redDown}
                      alt="index move"
                    />{" "}
                    {tableData.bankNifty.current}
                  </b>
                </p>
                <p id="zoom">
                  {(tableData.bankNifty.change >= 0 ? "+" : "") +
                    tableData.bankNifty.change +
                    " (" +
                    (
                      (tableData.bankNifty.change /
                        tableData.bankNifty.current) *
                      100
                    ).toFixed(2) +
                    "%)"}
                </p>
              </div>
            </div>
            {/* <div className="live-data-header-card">
                        <p className="live-data-header-title">Bank Nifty Fut</p>
                        <div
                          style={
                            tableData.bankNiftyFut.change >= 0
                              ? { color: "green" }
                              : { color: "red" }
                          }
                        >
                          <p
                            className="live-data-header-index-number"
                            id="zoom"
                          >
                            <b>
                              <img
                                src={
                                  tableData.bankNiftyFut.change >= 0
                                    ? greenUp
                                    : redDown
                                }
                                alt="index move"
                              />{" "}
                              {tableData.bankNiftyFut.current}
                            </b>
                          </p>
                          <p id="zoom">
                            {(tableData.bankNiftyFut.change >= 0 ? "+" : "") +
                              tableData.bankNiftyFut.change +
                              " (" +
                              (
                                (tableData.bankNiftyFut.change /
                                  tableData.bankNiftyFut.current) *
                                100
                              ).toFixed(2) +
                              "%)"}
                          </p>
                        </div>
                      </div> */}
          </div>

          <Button style={{ cursor: "pointer" }} onClick={handleOpen}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 12"
              fill={props.theme === "dark" ? "white" : "black"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1H15"
                stroke={props.theme === "dark" ? "white" : "black"}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 6L15 6"
                stroke={props.theme === "dark" ? "white" : "black"}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M4 11L15 11"
                stroke={props.theme === "dark" ? "white" : "black"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </div>
      )}
    </>
  );
};

export default DashBoardHeader;
