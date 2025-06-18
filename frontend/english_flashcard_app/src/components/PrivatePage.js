import { Navigate } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import Dashboard from "../pages/Dashboard";
import Topics from "../pages/Topics";
import Topic from "../pages/Topic";
import TopicLearn from "../pages/TopicLearn";
import Vocab from "../pages/Vocab";
import useCheckAuth from "../hooks/useCheckAuth";
import { memo } from "react";
import { useSelector } from "react-redux";

const Page = memo(({ pageName }) => {
  switch (pageName) {
    case "Dashboard":
      return <Dashboard />;
    case "Topics":
      return <Topics />;
    case "Topic":
      return <Topic />;
    case "Vocab":
      return <Vocab />;
    case "TopicLearn":
      return <TopicLearn />;
    default:
      return <Dashboard />;
  }
});

const PrivatePage = memo(({ pageName }) => {
  const globalLang = useSelector((state) => state.lang);
  const { isLogged } = useCheckAuth({
    hasCheckExpired: false,
  });

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

  if (!isLogged) {
    return <Navigate to="/login" />;
  }

  return <Page key={globalLang} pageName={pageName} />;
});

export default PrivatePage;
