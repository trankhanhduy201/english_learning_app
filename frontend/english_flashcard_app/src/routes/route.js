import { createBrowserRouter } from "react-router-dom";
import * as topicsLoader from './loaders/topicLoader';
import * as vocabsLoader from './loaders/vocabLoader';
import * as topicsAction from './actions/topicAction';
import * as vocabsAction from './actions/vocabAction';
import * as transAction from './actions/transAction';
import Error from "../pages/Error";
import Login from "../pages/Login";
import Layout from "../pages/Layout";
import Home from "../pages/Home";
import Topics from "../pages/Topics";
import Topic from "../pages/Topic";
import TopicLearn from "../pages/TopicLearn";
import Vocab from "../pages/Vocab";

const defaultShouldRevalidate = ({ formData, actionResult }) => 
  !(formData?.has('_not_revalidate') || (actionResult?.status === 'error'));

const routes = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: "/",
    element: <Layout />,
    // errorElement: <Error />,
    children: [
      {
        index: true,
        path: '/',
        element: <Home />
      },
      {
        path: '/topics',
        element: <Topics />,
        loader: topicsLoader.getTopics,
      },
      {
        path: '/topic/:topicId/:action?',
        element: <Topic />,
        loader: topicsLoader.getTopic,
        action: topicsAction.editTopic,
        shouldRevalidate: defaultShouldRevalidate
      },
      {
        path: '/topic/:topicId/vocab/:vocabId/:action?',
        element: <Vocab />,
        loader: vocabsLoader.getVocab,
        action: vocabsAction.editVocab,
        shouldRevalidate: defaultShouldRevalidate
      },
      {
        path: '/translation/:transId',
        action: transAction.editTrans,
        shouldRevalidate: defaultShouldRevalidate
      },
      {
        path: '/topic/:topicId/learn',
        element: <TopicLearn />,
        loader: topicsLoader.getTopic,
      }
    ]
  }
], {
  future: {
    v7_skipActionErrorRevalidation: true
  },
});
export default routes;