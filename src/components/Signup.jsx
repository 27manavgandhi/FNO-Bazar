import React, { useState } from "react";
import "./SignUp.css";
import "../App.css";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignUp(props) {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [name, setName] = useState();
  const [mobileNo, setMobileNo] = useState();
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState(1000);
  const [city, setCity] = useState();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('submit clicked')
    const userInfo = {
      email: email,
      name: name,
      mobile: mobileNo,
      gender: gender,
      age: age,
      city: city,
    };
    // validate name must be smaller than 100 characters, mobile number with otp through firebase, age between 18 and 100, city less than 100 characters
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !mobileNo ||
      !age ||
      !city
    ) {
      return setError("Please fill all the fields");
    }
    if (name.length > 100) {
      return setError("Name must be less than 100 characters");
    }

    if (mobileNo.length !== 10) {
      return setError("Mobile number must be 10 digits");
    }
    if (age > 100) {
      return setError("Age must be less than 100");
    }
    if (city.length > 100) {
      return setError("City must be less than 100 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    try {
      setError("");
      setLoading(true);
      const user = await signup(userInfo, email, password);
      if (!user) {
        return setError("Failed to create account");
      }
      if (user) navigate("/login");
    } catch (e) {
      setError("");
      setTimeout(() => setError("Failed to create account. " + e), 50);
    }
    setLoading(false);
  };
  return (
    <div className="signup-modal-content" data-theme={props.theme}>
      <h3>Sign Up</h3>
      {error && <p className="auth-error">{error}</p>}
      <form className="signup-form" data-theme={props.theme}>
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <input
          type="number"
          placeholder="Age"
          onChange={(e) => {
            setAge(e.target.value);
          }}
        />
        <select
          onChange={(e) => {
            setGender(e.target.value);
          }}
        >
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input
          type="Text"
          placeholder="City"
          onChange={(e) => {
            setCity(e.target.value);
          }}
        />
        <input
          type="text"
          placeholder="Mobile No"
          onChange={(e) => {
            setMobileNo(e.target.value);
          }}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
        />
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <p>Signing you Up. Please Wait...</p>
            {loading && <CircularProgress sx={{ color: "black" }} />}
          </div>
        ) : (
          <button type="submit" onClick={handleSubmit}>
            Create Account
          </button>
        )}
      </form>
    </div>
  );
}
