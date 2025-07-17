import "../App.css";
import "./Home.css";

import greyPlayStoreImg from "../assets/grey-play-store.svg";
import blackPlayStoreImg from "../assets/black-play-store.svg";
import downArrow from "../assets/down-arrow.svg";
import heroStar from "../assets/hero-star.svg";
import phone1 from "../assets/hero-phone-1.png";
import phone2 from "../assets/hero-phone-2.png";
import dottedLine from "../assets/hero-dotted-line.svg";
import homePromo1 from "../assets/home-promo-1.svg";
import homePromo2 from "../assets/home-promo-2.svg";
import homePromo2Sub from "../assets/home-promo-2-sub.svg";
import logoSvg from "../assets/logo.svg";
import darkLogoSvg from "../assets/logo-dark.svg";
import rightArrowLight from "../assets/right-arrow-light.svg";
import rightArrowDark from "../assets/right-arrow-dark.svg";
import homeAdvantage1 from "../assets/home-advantage-1.svg";
import homeAdvantage2 from "../assets/home-advantage-2.svg";
import homeAdvantage3 from "../assets/home-advantage-3.svg";
import homeAdvantage4 from "../assets/home-advantage-4.svg";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
//TODOS: Add download app links
const Home = (props) => {
  return (
    <>
      <Header
        theme={props.theme}
        themeSwitcher={props.themeSwitcher}
        curPage={-1}
      />
      {/* HOME MAIN CONTAINER */}
      <div className="home-content" data-theme={props.theme}>
        {/* HERO */}
        <div className="hero" id="home">
          <div className="hero-title-container">
            <h2>
              Invest for
              <img src={heroStar} alt="asterisk" id="hero-asterisk" />
            </h2>
            <h2>the</h2>
            <h2>Future</h2>
          </div>

          <div className="hero-subtitle-container">
            <p>Empowering investors with live market</p>
            <p>insights: Making smart investment decisions</p>
            <p>has never been easier before!</p>
          </div>
          <a
            className="hero-download-app"
            target="__blank"
            href="https://play.google.com/store/apps/details?id=com.zerostic.fnobazar.android"
          >
            <img src={greyPlayStoreImg} alt="Download App" />
            Download App
          </a>
          <p className="hero-find-out-more">
            Find Out more <img src={downArrow} alt="Find out more" />{" "}
          </p>
          <img id="hero-phone-1" src={phone1} alt="phone-1" />
          <img id="hero-phone-2" src={phone2} alt="phone-2" />
          <img id="hero-dotted-line" src={dottedLine} alt="download app" />
        </div>

        <div className="home-para-1" id="about" data-theme={props.theme}>
          <p>Invest smarter with</p>
          <p>customzied strategies</p>
          <p>and guidance</p>
        </div>

        {/* PROMOS */}
        <div className="home-promos" data-theme={props.theme}>
          {/* Promo-1  */}
          <div className="home-promo-1">
            <div className="home-promo-title">
              <h4>Real-time stock updates: Stay</h4>
              <h4>informed, make timely decisions</h4>
            </div>
            <div className="home-promo-subtitle">
              <p>Stay updated, act swiftly, make</p>
              <p>informed choices.</p>
            </div>
            <Link to="/">
              Read more{" "}
              <img
                src={props.theme !== "dark" ? rightArrowDark : rightArrowLight}
                alt="rightarrow"
              />
            </Link>
            <img src={homePromo1} id="home-promo-1-img" alt="promo" />
          </div>
          {/* Promo-2  */}
          <div className="home-promo-2">
            <div className="home-promo-title">
              <h4>Advanced Analytics: Gain valyable insights for</h4>
              <h4>strategic investing</h4>
            </div>
            <div className="home-promo-subtitle">
              <p>Leverage advanced analytics for valuable insights and</p>
              <p>strategic investment decisions</p>
            </div>
            <Link to="/">
              Read more{" "}
              <img
                src={props.theme !== "dark" ? rightArrowDark : rightArrowLight}
                alt="rightarrow"
              />
            </Link>
            <img src={homePromo2} id="home-promo-2-img" alt="promo" />
            <img src={homePromo2Sub} id="home-promo-2-sub-img" alt="promo" />
          </div>
        </div>
        {/* ADVANTAGES  */}
        <div className="advantages-container" data-theme={props.theme}>
          {/* ADVANTAGES-title */}
          <div className="advantages-title" data-theme={props.theme}>
            <p>Advantages of using</p>
            <img
              src={props.theme === "light" ? logoSvg : darkLogoSvg}
              alt="FNO Bazar"
            />
          </div>
          {/* ADVANTAGES-main */}
          <div className="advantages" data-theme={props.theme}>
            <div className="advantage-container grid-1">
              <img src={homeAdvantage1} alt="Advantage" />
              <div className="advantage-information">
                <div className="advantage-title-container">
                  <h3 className="advantage-title">Comprehensive Market</h3>
                  <h3 className="advantage-title">Research</h3>
                </div>
                <div className="advantage-subtitle-container">
                  <p className="advantage-subtitle">
                    Access a wealth of in-depth market
                  </p>
                  <p className="advantage-subtitle">
                    analysis, reports, and insights to
                  </p>
                  <p className="advantage-subtitle">
                    make informed investment decisions
                  </p>
                </div>
                <button className="advantage-button" id="open-account">
                  Open an account
                </button>
              </div>
            </div>

            <div className="advantage-container grid-2">
              <img src={homeAdvantage2} alt="Advantage" />
              <div className="advantage-information">
                <div className="advantage-title-container">
                  <h3 className="advantage-title">24/7 Support</h3>
                </div>
                <div className="advantage-subtitle-container">
                  <p className="advantage-subtitle">
                    Receive dedicated customer support
                  </p>
                  <p className="advantage-subtitle">
                    from our knowledgeable team,
                  </p>
                  <p className="advantage-subtitle">
                    ensuring a smooth and hassle-free
                  </p>
                  <p className="advantage-subtitle">
                    experience throughout your investing
                  </p>
                  <p className="advantage-subtitle">journey.</p>
                </div>
                <button className="advantage-button" id="open-account">
                  Ask a question
                </button>
              </div>
            </div>
            <div className="advantage-container grid-3">
              <img src={homeAdvantage3} alt="Advantage" />
              <div className="advantage-information">
                <div className="advantage-title-container">
                  <h3 className="advantage-title">Real-Time Data</h3>
                </div>
                <div className="advantage-subtitle-container">
                  <p className="advantage-subtitle">
                    Stay updated with live stock market
                  </p>
                  <p className="advantage-subtitle">
                    data, enabling you to react swiftly to
                  </p>
                  <p className="advantage-subtitle">
                    changing market conditions.
                  </p>
                </div>
                <button className="advantage-button" id="open-account">
                  Explore Live Data
                </button>
              </div>
            </div>
            <div className="advantage-container grid-4">
              <img src={homeAdvantage4} alt="Advantage" />
              <div className="advantage-information">
                <div className="advantage-title-container">
                  <h3 className="advantage-title">Mobile Accessibility</h3>
                </div>
                <div className="advantage-subtitle-container">
                  <p className="advantage-subtitle">
                    Access our services on the go through
                  </p>
                  <p className="advantage-subtitle">
                    our mobile app, allowing you to stay
                  </p>
                  <p className="advantage-subtitle">
                    connected and manage your
                  </p>
                  <p className="advantage-subtitle">
                    investments conveniently from
                  </p>
                  <p className="advantage-subtitle">anywhere at any time.</p>
                </div>
                <button className="advantage-button" id="open-account">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* GETTING STARTED  */}
        <div className="get-started-container" id="get-started">
          <div className="get-started-title" data-theme={props.theme}>
            <h2>Get Started on</h2>
            <img
              src={props.theme === "light" ? logoSvg : darkLogoSvg}
              alt="FNO Bazar"
            />
          </div>
          <div className="get-started-promo">
            <div className="get-started-promo-title">
              <h2>Keep your Finger on the</h2>
              <h2>Investment Market Pulse</h2>
            </div>
            <button
              className="get-started-download-app-button"
              onClick={() => {
                window.open(
                  "https://play.google.com/store/apps/details?id=com.zerostic.fnobazar.android"
                );
              }}
            >
              <img alt="playstore icon" src={blackPlayStoreImg} />
              Download App
            </button>
            <img
              src={props.theme === "light" ? phone1 : phone2}
              alt="mobile-app"
              id="get-started-phone"
            />
          </div>
        </div>
        {/* CONTACT US */}
        <div className="home-contact-us-container" id="contact-us">
          <div
            className="home-contact-us-left-container"
            data-theme={props.theme}
          >
            <h2>Contact Us</h2>
            <div className="home-contact-us-subtitle-container">
              <p className="home-contact-us-subtitle">
                Feel free to reach out to our dedicated
              </p>
              <p className="home-contact-us-subtitle">
                support team for any inquiries,
              </p>
              <p className="home-contact-us-subtitle">
                feedback, or technical assistance. We
              </p>
              <p className="home-contact-us-subtitle">
                strive to provide prompt and reliable{" "}
              </p>
              <p className="home-contact-us-subtitle">
                customer service to ensure your
              </p>
              <p className="home-contact-us-subtitle">
                experience with our platform is smooth{" "}
              </p>
              <p className="home-contact-us-subtitle">and satisfying.</p>
            </div>
          </div>
          <div className="home-contact-us-card">
            <form className="home-contact-form">
              <h3>Have a question or need assistance? We're here to help!</h3>
              <input
                type="text"
                className="contact-us-input"
                id="contact-us-card-name"
                placeholder="Full Name"
              />
              <input
                type="email"
                className="contact-us-input"
                id="contact-us-card-email"
                placeholder="Email"
              />
              <input
                type="text"
                className="contact-us-input"
                id="contact-us-card-phone"
                placeholder="Phone Number"
              />
              <textarea
                className="contact-us-input"
                id="contact-us-card-request"
                placeholder="Request/Query"
              />
              <button
                className="home-contact-form-submit-button"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* FOOTER */}
      <Footer />
    </>
  );
};
export default Home;
