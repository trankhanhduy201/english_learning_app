import { memo, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingOverlay from "../components/LoadingOverlay";
import useCheckAuth from "../hooks/useCheckAuth";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Topics = lazy(() => import("../pages/Topics"));
const Topic = lazy(() => import("../pages/Topic"));
const TopicLearn = lazy(() => import("../pages/TopicLearn"));
const Vocab = lazy(() => import("../pages/Vocab"));
const Settings = lazy(() => import("../pages/Settings"));
const Profile = lazy(() => import("../pages/Profile"));
const VocabModal = lazy(() => import("../pages/VocabModal"));
const TopicModal = lazy(() => import("../pages/TopicModal"));

const isPassServerAuth = pageName => [
  "TopicModal",
  "VocabModal"
].includes(pageName);

const Page = memo(({ pageName }) => {
  switch (pageName) {
    case "Dashboard":
      return <Dashboard />;
    case "Settings":
      return <Settings />;
    case "Profile":
      return <Profile />;
    case "Topics":
      return <Topics />;
    case "Topic":
      return <Topic />;
    case "TopicModal":
      return <TopicModal />;
    case "Vocab":
      return <Vocab />;
    case "VocabModal":
      return <VocabModal />;
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
    isPassServerAuth: isPassServerAuth(pageName)
  });

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

  if (!isLogged) {
    return <Navigate to="/login" />;
  }

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Page key={globalLang} pageName={pageName} />
    </Suspense>
  )
});

export default PrivatePage;
