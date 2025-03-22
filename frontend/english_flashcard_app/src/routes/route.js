import { createBrowserRouter } from "react-router-dom";
import * as topicsLoader from './loaders/topicLoader';
import * as vocabsLoader from './loaders/vocabLoader';
import * as topicsAction from './actions/topicAction';
import * as vocabsAction from './actions/vocabAction';
import * as transAction from './actions/transAction';
import Error from "../pages/Error";
import RenderPrivatePage from "../components/RenderPrivatePage";
import Login from "../pages/Login";
import Layout from "../pages/Layout";

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
        element: <RenderPrivatePage pageName={'home'} />
      },
      {
        path: '/topics',
        element: <RenderPrivatePage pageName={'topics'} />,
        loader: topicsLoader.getTopics,
      },
      {
        path: '/topic/:topicId/:action?',
        element: <RenderPrivatePage pageName={'topic'} />,
        loader: topicsLoader.getTopic,
        action: topicsAction.editTopic,
        shouldRevalidate: defaultShouldRevalidate
      },
      {
        path: '/topic/:topicId/vocab/:vocabId/:action?',
        element: <RenderPrivatePage pageName={'vocab'} />,
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
        element: <RenderPrivatePage pageName={'topic_learn'} />,
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