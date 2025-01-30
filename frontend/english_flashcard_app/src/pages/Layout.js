import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Alerts from '../components/Alerts';

const Layout = () => {
	return (
		<div className="App">
			<Header />
			<div className='container mt-4'>
				<Alerts />
				<Outlet />
			</div>
		</div>
	);
}

export default Layout; 