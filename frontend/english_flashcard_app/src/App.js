import "./App.css";
import { RouterProvider } from "react-router-dom";
import useCheckAuth from "./hooks/useCheckAuth";
import LoadingOverlay from "./components/LoadingOverlay";
import { createAppRouter } from "./routes/route";

function App() {
  const { isLogged } = useCheckAuth({
    hasCheckExpired: false,
  });

  if (!isLogged) {
    return <LoadingOverlay />;
  }

  return <RouterProvider router={createAppRouter()} />;
}

export default App;
