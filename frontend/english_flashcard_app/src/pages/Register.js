import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useFetcher } from "react-router-dom";
import FieldErrors from "../components/FieldErrors";
import LoadingOverlay from "../components/LoadingOverlay";
import useCheckAuth from "../hooks/useCheckAuth";

const Register = () => {
  const registerFetcher = useFetcher();
  const { isLogged } = useCheckAuth({
    hasCheckExpired: false,
  });

  const apiErrors = useMemo(() => {
    if (registerFetcher.data?.status !== "error") return {};
    return registerFetcher.data?.errors ?? {};
  }, [registerFetcher.data]);

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

  if (isLogged) {
    return <Navigate to="/dashboard" />;
  }

  const getFieldErrors = (fieldName) => {
    const errors = apiErrors?.[fieldName];
    if (!errors) return [];
    return Array.isArray(errors) ? errors : [String(errors)];
  };

  const isSubmitting = registerFetcher.state === "submitting";
  const isSuccess = registerFetcher.data?.status === "success";

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "28rem" }}>
        <h3 className="text-center mb-4">Register</h3>

        {isSuccess && (
          <div className="alert alert-success text-center">
            Account created. You can now <Link to="/login">login</Link>.
          </div>
        )}

        {registerFetcher.data?.status === "error" && (
          <div className="alert alert-danger text-center">
            Registeration failed. Please try again.
          </div>
        )}

        <registerFetcher.Form action="/register" method="post">
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              name="username"
              placeholder="Enter your username"
              disabled={isSubmitting}
            />
            <FieldErrors errors={getFieldErrors("username")} />
          </div>

          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="firstname" className="form-label">
                First name
              </label>
              <input
                type="text"
                className="form-control"
                name="firstname"
                placeholder="First name"
                disabled={isSubmitting}
              />
              <FieldErrors errors={getFieldErrors("first_name")} />
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label htmlFor="lastname" className="form-label">
                Last name
              </label>
              <input
                type="text"
                className="form-control"
                name="lastname"
                placeholder="Last name"
                disabled={isSubmitting}
              />
              <FieldErrors errors={getFieldErrors("last_name")} />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Create a password"
              disabled={isSubmitting}
            />
            <FieldErrors errors={getFieldErrors("password")} />
          </div>

          <div className="mb-3">
            <label htmlFor="re_password" className="form-label">
              Re-password
            </label>
            <input
              type="password"
              className="form-control"
              name="re_password"
              placeholder="Repeat your password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </registerFetcher.Form>

        <div className="mt-3 text-center">
          <span className="me-1">Already have an account?</span>
          <Link to="/login" className="text-decoration-none">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
