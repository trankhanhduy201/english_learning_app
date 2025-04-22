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
import VocabModal from "../pages/VocabModal";
import TopicModal from "../pages/TopicModal";

const isShouldRevalidate = (formData, actionResult) => {
  return formData?.has('_not_revalidate') || (actionResult?.status === 'error');
}

const defaultShouldRevalidate = ({ formData, actionResult }) => {
  return !isShouldRevalidate(formData, actionResult);
}

const topicShouldRevalidate = ({ formData, actionResult, currentUrl, nextUrl }) => {
  if (formData) {
    if (isShouldRevalidate(formData, actionResult)) {
      return false;
    }
    const formName = formData?.get('_form_name') ?? '';
    if (formName.includes('vocab')) {
      return true;
    }
  }
  return false;
}

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
          children: [
            {
              path: 'new',
              element: <TopicModal />,
              action: topicsAction.createTopic
            },
            {
              path: 'delete',
              action: topicsAction.deleteTopics
            }
          ]
        },
        {
          path: '/topic/:topicId/:action?',
          element: <PrivatePage pageName='Topic' />,
          loader: topicsLoader.getTopic,
          action: topicsAction.editTopic,
          shouldRevalidate: topicShouldRevalidate,
          children: [
            {
              path: 'vocab/import',
              action: vocabsAction.importVocab
            },
            {
              path: 'vocab/:vocabId/:action?',
              element: <VocabModal />,
              loader: vocabsLoader.getVocab,
              action: vocabsAction.editVocab,
              shouldRevalidate: defaultShouldRevalidate
            }
          ]
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