import { useMemo } from "react";
import { Link, useFetcher } from "react-router-dom";
import FieldErrors from "../components/FieldErrors";

const Login = () => {
  const loginFetcher = useFetcher();

  const apiErrors = useMemo(() => {
    if (loginFetcher.data?.status !== "error") return {};
    return loginFetcher.data?.errors ?? {};
  }, [loginFetcher.data]);

  const getFieldErrors = (fieldName) => {
    const errors = apiErrors?.[fieldName];
    if (!errors) return [];
    return Array.isArray(errors) ? errors : [String(errors)];
  };

  const isSubmitting = loginFetcher.state === "submitting";
  const hasErrors = loginFetcher.data?.status === "error";

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "24rem" }}>
        <h3 className="text-center mb-4">Login</h3>
        {hasErrors && loginFetcher.data?.errors?.detail && (
          <div className="alert alert-danger text-center">
            Login failed. Please try again.
          </div>
        )}
        <loginFetcher.Form action={"/login"} method={"post"}>
          <fieldset disabled={isSubmitting} aria-busy={isSubmitting}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                User name
              </label>
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Enter your username"
              />
              <FieldErrors errors={getFieldErrors("username")} />
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
              />
              <FieldErrors errors={getFieldErrors("password")} />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </fieldset>
        </loginFetcher.Form>
        <div className="mt-3 text-center">
          <a href="/forgot-password" className="text-decoration-none">
            Forgot Password?
          </a>
        </div>
        <div className="mt-2 text-center">
          <span className="me-1">Don’t have an account?</span>
          <Link to="/register" className="text-decoration-none">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
