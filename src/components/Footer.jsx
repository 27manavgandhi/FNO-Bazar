// import React from 'react';
import "../App.css";
import "./Footer.css";

import darkLogo from "../assets/logo-dark.svg";
import blueBgRightArrow from "../assets/blue-bg-right-arrow-white.svg";
import footerFacebook from "../assets/footer-facebook.svg";
import footerInstagram from "../assets/footer-instagram.svg";
import footerTwitter from "../assets/footer-twitter.svg";

import { Link } from "react-router-dom";

const Footer = (props) => {
  return (
    <div className="footer-container">
      {" "}
      <div className="logo footer-sub-container">
        <Link to="/">
          <img src={darkLogo} id="company-logo" alt="fno bazaar" />
        </Link>
      </div>
      <div className="footer-sub-container-group">
        <div className="footer-sub-container">
          <p className="footer-subtitle">Resources</p>
          <Link to="/" className="footer-link">
            Stocks
          </Link>
          <Link to="/" className="footer-link">
            Option
          </Link>
          <Link to="/" className="footer-link">
            Future
          </Link>
          <Link to="/" className="footer-link">
            Others
          </Link>
          <Link to="/" className="footer-link">
            Daily Activities
          </Link>
        </div>
        <div className="footer-sub-container">
          <p className="footer-subtitle">Company</p>
          <Link to="/" className="footer-link">
            About
          </Link>
          <Link to="/" className="footer-link">
            Career
          </Link>
          <Link to="/" className="footer-link">
            Pricing
          </Link>
          <Link to="/" className="footer-link">
            Privacy
          </Link>
          <Link to="/" className="footer-link">
            Terms of Service
          </Link>
        </div>
      </div>
      <div className="footer-sub-container">
        <div className="footer-subscribe-container">
          <p className="footer-subtitle">Subscribe to News</p>
          <div className="footer-subscribe-input-container">
            <input
              type="email"
              id="footer-subscribe-newsletter"
              placeholder="Your Email"
            />
            <a href="/">
              <img src={blueBgRightArrow} alt="submit" />
            </a>
          </div>
        </div>
        <div className="footer-socials-container">
          <a href="/">
            <img src={footerFacebook} alt="fno bazaar facebook" />
          </a>
          <a href="/">
            <img src={footerTwitter} alt="fno bazaar twitter" />
          </a>
          <a href="/">
            <img src={footerInstagram} alt="fno bazaar instagram" />
          </a>
        </div>
      </div>
    </div>
  );
};
export default Footer;
