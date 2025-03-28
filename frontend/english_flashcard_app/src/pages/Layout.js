import { Outlet, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Alerts from '../components/Alerts';
import useCheckAuth from '../hooks/useCheckAuth';
import LoadingOverlay from '../components/LoadingOverlay';

const Layout = () => {
	const { isAuth } = useCheckAuth();

  if (isAuth === null) {
    return <LoadingOverlay />;
  }

	if (!isAuth) {
		return <Navigate to='/login' />;
	}

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