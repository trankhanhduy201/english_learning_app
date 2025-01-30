import { createBrowserRouter } from "react-router-dom";
import * as topicsLoader from './loaders/topicLoader'
import Error from "../pages/Error";
import RenderPrivatePage from "../components/RenderPrivatePage";
import Login from "../pages/Login";
import Layout from "../pages/Layout";

const routes = createBrowserRouter([
	{
		path: '/login',
		element: <Login />
	},
	{
		path: "/",
    Component: Layout,
		children: [
			{
				index: true,
				path: '/',
				element: <RenderPrivatePage pageName={'home'} />
			},
			{
				path: '/topics',
				element: <RenderPrivatePage pageName={'topics'} />,
				errorElement: <Error />,
				loader: topicsLoader.getTopics,
			},
			{
				path: '/topic/:topicId',
				element: <RenderPrivatePage pageName={'topic'} />,
				errorElement: <Error />,
				loader: topicsLoader.getTopicById,
			}
		]
	}
]);
export default routes;