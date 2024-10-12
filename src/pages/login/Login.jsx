import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import assets from "../../assets/assets";
import { login, resetPass, signup } from "../../config/fireBase";
import "./Login.css";

const Login = () => {
  let [currState, setCurrState] = useState("Sign Up");
  let [userName, setUserName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign Up") {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  };
  return (
    <div className="Login">
      <img src={assets.logo_big} alt="" className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currState}</h2>
        {currState === "Sign Up" ? (
          <TextField
            onChange={(event) => setUserName(event.target.value)}
            value={userName}
            type="text"
            label="user name"
            variant="outlined"
            className="form-input"
            required
          />
        ) : null}
        <TextField
          onChange={(event) => setEmail(event.target.value)}
          value={email}
          type="email"
          label="Email address"
          variant="outlined"
          className="form-input"
          required
        />
        <TextField
          onChange={(event) => setPassword(event.target.value)}
          value={password}
          type="password"
          label="password"
          variant="outlined"
          className="form-input"
          required
        />
        <Button type="submit" variant="contained">
          {currState === "Sign Up" ? "Create account" : "Login now"}
        </Button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the term of use & privacy policy.</p>
        </div>
        <div className="login-forget">
          {currState === "Sign Up" ? (
            <p className="login-toggle">
              {" "}
              Already have an account{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                }}>
                Login now
              </span>
            </p>
          ) : (
            <p className="login-toggle">
              Create a Account{" "}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                }}>
                click here
              </span>
            </p>
          )}
          {currState == "Login" ? (
            <p className="login-toggle">
              Forgot Password{" "}
              <span onClick={() => resetPass(email)}>reset here</span>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default Login;
