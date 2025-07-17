import React, { useState } from "react";
import "./Login.css";
import "../App.css";
import rightArrowLight from "../assets/right-arrow-light.svg";
import rightArrowDark from "../assets/right-arrow-dark.svg";
import straightLine from "../assets/line.svg";
import straightLineDark from "../assets/lineDark.svg";
import googleLoginWhite from "../assets/googleLoginWhite.svg";
import googleLoginBlack from "../assets/googleLoginBlack.svg";
import CircularProgress from "@mui/material/CircularProgress";
import showPasswordIcon from "../assets/show-password.png";
import hidePasswordIcon from "../assets/hide-password.png";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login(props) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [resetPasswordEmail, setResetPasswordEmail] = useState();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordUI, setForgotPasswordUI] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");
  const { login, googleLogin, sendResetPasswordEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      // console.log(user)
      navigate("/dashboard");
    } catch (e) {
      setError("");
      setTimeout(() => setError("Failed to log in. " + e), 50);
    }
    setLoading(false);
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetPasswordMessage("");
    try {
      // console.log('reset password')
      await sendResetPasswordEmail(resetPasswordEmail);
      setResetPasswordMessage(
        "Reset Password Email has been sent to your registered email address."
      );
    } catch (e) {
      setResetPasswordMessage("Failed to reset password. " + e);
    }
  };
  return (
    <div className="login-modal-content" data-theme={props.theme}>
      <form className="login-form" data-theme={props.theme}>
        {error && <p className="login-error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <div className="login-psw-div">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <img
            src={showPassword ? hidePasswordIcon : showPasswordIcon}
            className="show-hide-password"
            alt="show password"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          />
        </div>
        {!loading && (
          <button type="submit" onClick={handleSubmit}>
            Log In
            <img
              alt="login"
              src={props.theme === "light" ? rightArrowLight : rightArrowDark}
            />
          </button>
        )}
        {loading && <CircularProgress sx={{ color: "black" }} />}
      </form>
      <p
        className="login-forgot-password"
        onClick={() => {
          setForgotPasswordUI(!forgotPasswordUI);
        }}
      >
        Forgot Password?
      </p>
      {forgotPasswordUI && (
        <div className="login-forgot-password-ui">
          <p>Enter your registered Email to reset password</p>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setResetPasswordEmail(e.target.value)}
          />
          <button onClick={handleResetPassword}>Reset Password</button>
          <p className="reset-password-status-message">
            {resetPasswordMessage}
          </p>
        </div>
      )}
      <p className="login-dont-have-acc">
        Don't have an account yet?{" "}
        <button
          onClick={() => {
            props.setIsRegistering(true);
          }}
        >
          Sign Up
        </button>
      </p>
      <p id="login-or">
        <img
          src={props.theme === "light" ? straightLine : straightLineDark}
          alt="or"
        />
        or
        <img
          src={props.theme === "light" ? straightLine : straightLineDark}
          alt="or"
        />
      </p>
      <button
        data-theme={props.theme}
        id="login-with-google-button"
        onClick={() => {
          console.log("google login");
          googleLogin().then((user) => {
            console.log(user);
            navigate("/dashboard");
          });
        }}
      >
        <img
          alt="google login"
          style={{ width: "24px" }}
          src={props.theme === "light" ? googleLoginWhite : googleLoginBlack}
        />
        login with Google
      </button>
    </div>
  );
}
