import { Link, useNavigate } from 'react-router-dom';
import * as cookies from '../utils/cookies';
import { useDispatch } from 'react-redux';
import { initialState, setAuth } from '../stores/slices/authSlice';
import { Dropdown, Nav } from "react-bootstrap";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onLogout = () => {
    cookies.clearAuthTokens();
    dispatch(setAuth(initialState));
    navigate('/login');
  }

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
                    <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
