import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Alerts from '../components/Alerts';
import PrivatePage from '../components/PrivatePage';

const Layout = () => {
	return (
		<div className="App">
			<Header />
			<div className='container mt-4'>
				<Alerts />
				<PrivatePage>
					<Outlet />
				</PrivatePage>
			</div>
		</div>
	);
}

export default Layout; 