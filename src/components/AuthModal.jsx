import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./Signup";
import "../App.css";
import "./AuthModal.css";

import Modal from "react-bootstrap/Modal";
import Accordion from "react-bootstrap/Accordion";

import logoLight from "../assets/logo.svg";
import logoDark from "../assets/logo-dark.svg";
import promoList1 from "../assets/home-advantage-1.svg";
import promoList2 from "../assets/home-advantage-2.svg";
import promoList3 from "../assets/home-advantage-3.svg";
import promoList4 from "../assets/home-advantage-4.svg";
import greyPlayStore from "../assets/grey-play-store.svg";
import blackPlayStore from "../assets/black-play-store.svg";
import lightArrow from "../assets/auth-modal-arrow-light.svg";
import darkArrow from "../assets/auth-modal-arrow-dark.svg";
import straightLine from "../assets/line.svg";

import { useAuth } from "../contexts/AuthContext";
import LoginPhone from "./LoginPhone";

export default function AuthModal(props) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeKey, setActiveKey] = useState("0");
  const handleAccordionChange = (eventKey) => {
    // Ensure at least one accordion item is always open
    const isOpen = activeKey === eventKey;
    // console.log(isOpen, eventKey, activeKey)
    // Get all the open accordion items
    const openItems = isOpen ? [] : [eventKey];
    // console.log(openItems,activeKey)
    // Ensure that there is at least one accordion item open
    if (
      openItems.length > 0 ||
      (openItems.length === 0 && activeKey !== null)
    ) {
      if (openItems[0] === null) {
        setActiveKey(!activeKey);
      } else {
        setActiveKey(openItems);
      }
    }
  };

  return (
    <Modal
      show={props.show}
      onHide={() => {
        props.setAuthModalIsOpen(false);
      }}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body className="bootstrap-modal-body-wrapper">
        <div className="auth-modal-content">
          <div className="auth-modal-promo" data-theme={props.theme}>
            <div className="auth-modal-promo-title-container">
              <h3>Get Started with</h3>
              <img
                src={props.theme === "light" ? logoDark : logoLight}
                alt="fno bazaar"
              />
              <h3>for</h3>
            </div>
            <div className="auth-modal-promo-list" data-theme={props.theme}>
              <p className="auth-modal-promo-list-item">
                <img src={promoList1} alt="comprehensive market research" />
                <span>Comprehensive Market Research</span>
              </p>
              <p className="auth-modal-promo-list-item">
                <img src={promoList2} alt="24 7 support" />
                <span>24/7 Support</span>
              </p>
              <p className="auth-modal-promo-list-item">
                <img src={promoList3} alt="realtime data" />
                <span>Real-Time Data</span>
              </p>
              <p className="auth-modal-promo-list-item">
                <img src={promoList4} alt="mobile accessibiility" />
                <span>Mobile Accessibility</span>
              </p>
            </div>
            <p className="auth-modal-promo-text">
              For a more personalized experience
            </p>
            <img
              id="auth-modal-arrow"
              src={props.theme === "light" ? lightArrow : darkArrow}
              alt="download app"
            />
            <button
              className="auth-modal-promo-download-app-button"
              onClick={() => {
                window.open(
                  "https://play.google.com/store/apps/details?id=com.zerostic.fnobazar.android"
                );
              }}
            >
              <img
                src={props.theme === "light" ? blackPlayStore : greyPlayStore}
                alt="playstore icon"
              />
              Download App
            </button>
          </div>
          <div className="auth-modal-auth-container" data-theme={props.theme}>
            <h3>Login to get started</h3>
            <div className="auth-accordion-container">
              <Accordion
                defaultActiveKey="0"
                activeKey={activeKey}
                onSelect={handleAccordionChange}
                data-theme={props.theme}
              >
                <Accordion.Item eventKey="0">
                  <Accordion.Header data-theme={props.theme}>
                    Login with Email and Password
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="auth-modal-form-container">
                      {!isRegistering ? (
                        <>
                          <Login
                            theme={props.theme}
                            setIsRegistering={setIsRegistering}
                          />
                        </>
                      ) : (
                        <>
                          <SignUp theme={props.theme} />
                          <div
                            className="auth-modal-back-to-login-button"
                            data-theme={props.theme}
                          >
                            Back to{" "}
                            <button
                              id="back-to-login-button"
                              onClick={() => {
                                setIsRegistering(false);
                              }}
                            >
                              Log In
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header data-theme={props.theme}>
                    Login with Phone Number
                  </Accordion.Header>
                  <Accordion.Body>
                    <LoginPhone theme={props.theme} />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
