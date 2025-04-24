import { Navigate } from "react-router-dom";
import LoadingOverlay from '../components/LoadingOverlay';
import Home from '../pages/Home';
import Topics from '../pages/Topics';
import Topic from '../pages/Topic';
import TopicLearn from '../pages/TopicLearn';
import Vocab from '../pages/Vocab';
import useCheckAuth from "../hooks/useCheckAuth";
import { memo } from "react";

const Page = memo(({ pageName }) => {
  switch (pageName) {
    case 'Home':
      return <Home />;
    case 'Topics':
      return <Topics />;
    case 'Topic':
      return <Topic />;
    case 'Vocab':
      return <Vocab />;
    case 'TopicLearn':
      return <TopicLearn />;
    default:
      return <Home />;
  }
});

const PrivatePage = memo(({ pageName }) => {
  const { isLogged } = useCheckAuth({
    hasCheckExpired: false
  });

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

  if (!isLogged) {
    return <Navigate to='/login' />;
  }

  return <Page pageName={pageName} />
});

export default PrivatePage;
