import { Outlet, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Alerts from '../components/Alerts';
import useCheckAuth from '../hooks/useCheckAuth';
import LoadingOverlay from '../components/LoadingOverlay';
import CountdownLogoutModal from '../components/CountdownLogoutModal'

const Layout = () => {
	const { 
		isLogged, 
		isExpired, 
		setIsLogged, 
		setIsExpired 
	} = useCheckAuth({
		hasCheckExpired: true
	});

  if (isLogged === null) {
    return <LoadingOverlay />;
  }

	if (!isLogged) {
		return <Navigate to='/login' />;
	}

	return (
		<>
			<div className="App">
				<Header />
				<div className='container mt-4'>
					<Alerts />
					<Outlet />
				</div>
			</div>
			{isLogged && isExpired && (
				<CountdownLogoutModal
					seconds={5}
					onFinish={() => {
						setIsLogged(false);
						setIsExpired(false);
					}}
				/>
			)}
		</>
	);
}

export default Layout; 