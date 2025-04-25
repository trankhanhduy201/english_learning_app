import { Link, useNavigate } from 'react-router-dom';
import * as cookies from '../utils/cookies';
import { useDispatch } from 'react-redux';
import { initialState, setAuth } from '../stores/slices/authSlice';
import { Dropdown, Nav } from "react-bootstrap";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from './ConfirmModal';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const confirmLogoutModal = useConfirmModal({
    submitActionCallback: async () => {
      return new Promise(resolve => {
        setTimeout(() => {
          cookies.clearAuthTokens();
          dispatch(setAuth(initialState));
          navigate('/login');
          return resolve();
        }, 3000);
      })
    }
  });

  return (
    <header className="bg-light shadow-sm">
      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light">
          <a className="navbar-brand" href="/">Flashcards</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/topics">Topics</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about">About</Link>
              </li>
              <li className="nav-item dropdown">
                <Dropdown as={Nav.Item}>
                  <Dropdown.Toggle as={Nav.Link} className="text-dark">
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end">
                    <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                    <Dropdown.Item href="/settings">Settings</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item 
                      onClick={() => confirmLogoutModal.showConfirmModal()}
                    >
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
            {confirmLogoutModal.isShowModal && (
              <ConfirmModal
                message="Do you want to log out?"
                isShow={confirmLogoutModal.isShowModal}
                isSubmmiting={confirmLogoutModal.isSubmmiting}
                onClose={confirmLogoutModal.onClickNo}
                onSubmit={confirmLogoutModal.onClickYes}
              />
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
