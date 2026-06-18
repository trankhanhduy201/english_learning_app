import { Outlet, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Alerts from "../components/Alerts";
import useCheckAuth from "../hooks/useCheckAuth";
import LoadingOverlay from "../components/LoadingOverlay";
import CountdownLogoutModal from "../components/CountdownLogoutModal";
import { clearAll as localStorageClearAll } from "../commons/localStorage";


const GuestLayout = () => {
  const { isLogged } = useCheckAuth({});

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

  if (isLogged === true) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

const UserLayout = () => {
  const { isLogged, isExpired, setIsLogged, setIsExpired } = useCheckAuth({
    hasCheckExpired: true,
  });

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

  if (isLogged === false) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <div className="App">
        <div className="d-flex flex-column vh-100">
          <Header />
          <div className="d-flex flex-grow-1">
            <Sidebar />
            <main className="flex-grow-1 p-3 bg-light">
              <div className="position-relative">
                <Alerts />
              </div>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      {isLogged && isExpired && (
        <CountdownLogoutModal
          seconds={5}
          onFinish={() => {
            localStorageClearAll();
            setIsLogged(false);
            setIsExpired(false);
          }}
        />
      )}
    </>
  );
};

const Layout = ({ isGuest = false }) => {
  if (isGuest) {
    return <GuestLayout />;
  }
  return <UserLayout />;
};

export default Layout;