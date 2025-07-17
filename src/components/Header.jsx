import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import "../App.css";

import logoSvg from "../assets/logo.svg";
import darkLogoSvg from "../assets/logo-dark.svg";
import lightModeButton from "../assets/lightModeButton.svg";
import darkModeButton from "../assets/darkModeButton.svg";
import playButtonSvg from "../assets/grey-play-store.svg";
import darkPlayButtonSvg from "../assets/black-play-store.svg";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import AuthModal from "./AuthModal";
const Header = (props) => {
  const [authModalIsOpen, setAuthModalIsOpen] = useState(false);

  const breakPoint = "lg";
  return (
    <>
      <Navbar
        fixed="top"
        data-theme={props.theme}
        variant={props.theme}
        className={
          `navbar-custom pb-3 pt-3 ` +
          (window.innerWidth > 1000 ? " ps-5 pe-5" : " ps-4 pe-4")
        }
        key={breakPoint}
        expand={breakPoint}
        collapseOnSelect
      >
        <Container fluid className="nav-container justify-content-between">
          <div className="navbar-logo-container">
            <Navbar.Brand
              className="navbar-logo navbar-left max-auto"
              href="#home"
            >
              <img
                className="navbar-logo"
                src={props.theme === "light" ? logoSvg : darkLogoSvg}
                alt="FnO-Bazaar"
              />
            </Navbar.Brand>
          </div>
          {/* <Link to="/"></Link> */}
          <Navbar.Toggle
            aria-controls={`offcanvasNavbar-expand-${breakPoint}`}
          />
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-${breakPoint}`}
            aria-labelledby={`offcanvasNavbarLabel-expand-${breakPoint}`}
            data-theme={props.theme}
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title
                id={`offcanvasNavbarLabel-expand-${breakPoint} ${props.theme}`}
              >
                Navigation
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav
                id="responsive-navbar-nav "
                className={
                  `flex-grow-1 navbar-right ${props.theme}` +
                  (window.innerWidth > 2000
                    ? " justify-content-center"
                    : " justify-content-start")
                }
                navbarScroll
              >
                <Nav.Link
                  href="#home"
                  className={props.curPage === 0 ? "active" : "inactive"}
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  href="#about"
                  className={props.curPage === 1 ? "active" : "inactive"}
                >
                  About
                </Nav.Link>
                <Nav.Link
                  href="#get-started"
                  className={props.curPage === 2 ? "active" : "inactive"}
                >
                  Get Started
                </Nav.Link>
                <Nav.Link
                  href="#contact-us"
                  className={props.curPage === 3 ? "active" : "inactive"}
                >
                  Contact Us
                </Nav.Link>
              </Nav>
              <button
                id="light-dark-toggle"
                className={`ms-${breakPoint}-5`}
                onClick={props.themeSwitcher}
              >
                <img
                  src={
                    props.theme === "light" ? lightModeButton : darkModeButton
                  }
                  alt="Light Mode"
                />
              </button>
              <Nav
                id="responsive-navbar-nav"
                className={` justify-content-end align-items-center gap-4 flex-grow-1 navbar-right`}
                navbarScroll
              >
                <Nav.Link
                  data-theme={props.theme}
                  className={`mt-4 mt-${breakPoint}-0`}
                  id="header-login-button"
                  onClick={() => {
                    setAuthModalIsOpen(true);
                  }}
                >
                  Log In
                </Nav.Link>
                <Nav.Link
                  as={"a"}
                  data-theme={props.theme}
                  className={`gap-2 ps-2 pe-2 mt-${breakPoint}-0`}
                  href="https://play.google.com/store/apps/details?id=com.zerostic.fnobazar.android"
                  id="download-app-button"
                  target="__blank"
                >
                  <img
                    src={
                      props.theme === "light"
                        ? playButtonSvg
                        : darkPlayButtonSvg
                    }
                    alt="Download app"
                  />
                  Download App
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <AuthModal
        setAuthModalIsOpen={setAuthModalIsOpen} // handler
        show={authModalIsOpen} //state of modal
        theme={props.theme}
      />
    </>
  );
};

export default Header;
