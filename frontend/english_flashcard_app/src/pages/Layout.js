import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import ErrorAlert from '../components/ErrorAlert';

const Layout = () => {
	return (
		<div className="App">
			<Header />
			<div className='container mt-4'>
				<ErrorAlert />
				<Outlet />
			</div>
		</div>
	);
}

export default Layout; 