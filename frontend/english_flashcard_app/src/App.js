import "./App.css";
import { RouterProvider } from "react-router-dom";
import useCheckAuth from "./hooks/useCheckAuth";
import LoadingOverlay from "./components/LoadingOverlay";
import { createAppRouter } from "./routes/route";
import { useRef } from "react";

function App() {
  const router = useRef(null);
  const { isLogged } = useCheckAuth({
    hasCheckExpired: false,
  });

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

  const isLoginRoute = window.location.pathname.startsWith("/login");
  const isRegisterRoute = window.location.pathname.startsWith("/register");
  const pathname = window.location.pathname;
  let targetPath = pathname;
  
  if (isLogged === false && !isLoginRoute && !isRegisterRoute) {
      targetPath = "/login";
  }

  if (isLogged === true && (isLoginRoute || isRegisterRoute)) {
    targetPath = "/dashboard";
  }

  if (targetPath !== pathname) {
    window.history.replaceState({}, "", targetPath);
  }

  if (!router.current) {
    router.current = createAppRouter();
  }
  return <RouterProvider router={router.current} />;
}

export default App;
