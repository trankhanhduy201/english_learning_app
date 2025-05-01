import { useFetcher } from "react-router-dom";

const Login = () => {
  const loginFetcher = useFetcher();

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "24rem" }}>
        <h3 className="text-center mb-4">Login</h3>
        {loginFetcher.data?.status === "error" && (
          <div className="alert alert-danger text-center">
            Invalid email or password.
          </div>
        )}
        <loginFetcher.Form action={"/login"} method={"post"}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              User name
            </label>
            <input
              type="text"
              className="form-control"
              name="username"
              placeholder="Enter your username"
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
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loginFetcher.state === "submitting"}
          >
            {loginFetcher.state === "submitting" ? "Logging in..." : "Login"}
          </button>
        </loginFetcher.Form>
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
