import { Navigate, useParams } from "react-router-dom";
import LoadingOverlay from '../components/LoadingOverlay';
import Home from '../pages/Home';
import Topics from '../pages/Topics';
import Topic from '../pages/Topic';
import TopicLearn from '../pages/TopicLearn';
import Vocab from '../pages/Vocab';
import useCheckAuth from "../hooks/useCheckAuth";

const PrivatePage = ({ pageName }) => {
  const { isAuth } = useCheckAuth();

  if (isAuth === null) {
    return <LoadingOverlay />;
  }

  if (!isAuth) {
    return <Navigate to='/login' />;
  }

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
};

export default PrivatePage;
