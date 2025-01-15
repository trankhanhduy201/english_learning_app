import { createBrowserRouter } from "react-router-dom";
import * as topicsLoader from './loaders/topicLoader'
import Home from "../pages/Home";
import Topics from "../pages/Topics";
import Error from "../pages/Error";
import Layout from "../pages/Layout";
import Topic from "../pages/Topic";

const routes = createBrowserRouter([
	{
		path: "/",
    Component: Layout,
		children: [
			{
				index: true,
				path: '/',
				element: <Home />
			},
			{
				path: '/topics',
				element: <Topics />,
				errorElement: <Error />,
				loader: topicsLoader.getTopics,
			},
			{
				path: '/topic/:topicId',
				element: <Topic />,
				errorElement: <Error />,
				loader: topicsLoader.getTopicById,
			}
		]
	}
]);
export default routes;