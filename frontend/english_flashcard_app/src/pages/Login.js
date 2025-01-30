import React, { useState } from "react";
import * as authApi from "../services/authApi";
import * as cookies from "../utils/cookies";
import { useNavigate } from "react-router-dom";
import * as alertConfigs from "../configs/alertConfigs";
import { useDispatch } from "react-redux";
import { setAlert } from "../stores/slices/alertSlice";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    authApi.getToken(username, password)
      .then(resp => {
        cookies.setAuthTokens(
          resp.data.access,
          resp.data.refresh
        );
        setError("");
        dispatch(setAlert({
          type: alertConfigs.SUCCESS_TYPE,
          message: `Hi ${username}, wellcome back!`
        }));
        navigate("/");
      })
      .catch(error => {
        setIsSubmitting(false);
        setError("Invalid email or password.");
      });
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "24rem" }}>
        <h3 className="text-center mb-4">Login</h3>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              User name
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-3 text-center">
          <a href="/forgot-password" className="text-decoration-none">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
