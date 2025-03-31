import { createBrowserRouter } from "react-router-dom";
import * as topicsLoader from './loaders/topicLoader';
import * as vocabsLoader from './loaders/vocabLoader';
import * as topicsAction from './actions/topicAction';
import * as vocabsAction from './actions/vocabAction';
import * as transAction from './actions/transAction';
import Error from "../components/errors/Error";
import Login from "../pages/Login";
import Layout from "../pages/Layout";
import PrivatePage from '../components/PrivatePage';

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
    children: [{
      errorElement: <Error />,
      children: [
        {
          index: true,
          path: '/',
          element: <PrivatePage pageName='Home' />,
        },
        {
          path: '/topics',
          element: <PrivatePage pageName='Topics' />,
          loader: topicsLoader.getTopics,
        },
        {
          path: '/topic/:topicId/:action?',
          element: <PrivatePage pageName='Topic' />,
          loader: topicsLoader.getTopic,
          action: topicsAction.editTopic,
          shouldRevalidate: defaultShouldRevalidate
        },
        {
          path: '/topic/:topicId/vocab/:vocabId/:action?',
          element: <PrivatePage pageName='Vocab' />,
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
          element: <PrivatePage pageName='TopicLearn' />,
          loader: topicsLoader.getTopic,
        }
      ]
    }]
  }
], {
  future: {
    v7_skipActionErrorRevalidation: true
  },
});
export default routes;