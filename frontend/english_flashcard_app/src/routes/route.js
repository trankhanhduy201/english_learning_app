import { createBrowserRouter } from "react-router-dom";
import * as topicsLoader from "./loaders/topicLoader";
import * as vocabsLoader from "./loaders/vocabLoader";
import * as topicsAction from "./actions/topicAction";
import * as vocabsAction from "./actions/vocabAction";
import * as transAction from "./actions/transAction";
import * as loginAction from "./actions/loginAction";
import Error from "../components/errors/Error";
import Login from "../pages/Login";
import Layout from "../pages/Layout";
import PrivatePage from "../components/PrivatePage";
import VocabModal from "../pages/VocabModal";
import TopicModal from "../pages/TopicModal";
import Test from "../pages/Test";

const isShouldNotRevalidate = (formData, actionResult) => {
  return formData?.has("_not_revalidate") || actionResult?.status === "error";
};

const defaultShouldRevalidate = ({ formData, actionResult }) => {
  return !isShouldNotRevalidate(formData, actionResult);
};

const topicsShouldRevalidate = ({
  formData,
  actionResult,
  currentUrl,
  nextUrl,
}) => {
  if (formData) {
    if (isShouldNotRevalidate(formData, actionResult)) {
      return false;
    }
  }
  if (currentUrl.pathname !== nextUrl.pathname) {
    const includeExceptionPaths = [
      "/topics",
      "/topics/new",
    ].includes(
      currentUrl.pathname, 
      nextUrl.pathname
    );
    if (includeExceptionPaths) {
      return false;
    }
  }
  return true;
};

const topicShouldRevalidate = ({
  formData,
  actionResult,
  currentUrl,
  nextUrl,
}) => {
  if (formData) {
    if (isShouldNotRevalidate(formData, actionResult)) {
      return false;
    }
    const formName = formData?.get("_form_name") ?? "";
    if (formName.includes("vocab")) {
      return true;
    }
  }
  return false;
};

const routes = createBrowserRouter(
  [
    {
      path: "/test",
      element: <Test />,
    },
    {
      path: "/login",
      element: <Login />,
      action: loginAction.login,
    },
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          errorElement: <Error />,
          children: [
            {
              index: true,
              path: "/dashboard",
              element: <PrivatePage pageName="Dashboard" />,
            },
            {
              path: "/topics",
              element: <PrivatePage pageName="Topics" />,
              loader: topicsLoader.getTopics,
              shouldRevalidate: topicsShouldRevalidate,
              children: [
                {
                  path: "new",
                  element: <TopicModal />,
                  action: topicsAction.createTopic,
                },
                {
                  path: "delete",
                  action: topicsAction.deleteTopics,
                },
              ],
            },
            {
              path: "/topic/:topicId/:action?",
              element: <PrivatePage pageName="Topic" />,
              loader: topicsLoader.getTopic,
              action: topicsAction.editTopic,
              shouldRevalidate: topicShouldRevalidate,
              children: [
                {
                  path: "vocab/import",
                  action: vocabsAction.importVocabs,
                },
                {
                  path: "vocab/delete",
                  action: vocabsAction.deleteVocabs,
                },
                {
                  path: "vocab/:vocabId/:action?",
                  element: <VocabModal />,
                  loader: vocabsLoader.getVocab,
                  action: vocabsAction.editVocab,
                  shouldRevalidate: defaultShouldRevalidate,
                },
              ],
            },
            {
              path: "/translation/:transId",
              action: transAction.editTrans,
              shouldRevalidate: defaultShouldRevalidate,
            },
            {
              path: "/topic/:topicId/learn",
              element: <PrivatePage pageName="TopicLearn" />,
              loader: topicsLoader.getTopic,
            },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_skipActionErrorRevalidation: true,
    },
  },
);
export default routes;
