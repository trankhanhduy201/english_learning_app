import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { initialState, setAuth } from "../stores/slices/authSlice";
import { Dropdown, Nav } from "react-bootstrap";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import * as cookies from "../utils/cookies";
import { toggleSidebar } from "../stores/slices/sidebarSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const confirmLogoutModal = useConfirmModal({
    submitActionCallback: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          cookies.clearAuthTokens();
          dispatch(setAuth(initialState));
          navigate("/login");
          return resolve();
        }, 3000);
      });
    },
  });

  return (
    <header className="navbar navbar-light bg-light border-bottom p-2 d-flex justify-content-between align-items-center">
      <button
        className="btn btn-outline-primary d-xl-none"
        onClick={() => dispatch(toggleSidebar())}
      >
        ☰
      </button>
      <h5 className="mb-0 ms-3 d-xl-block d-none">Flashcards</h5>
      <div className="d-flex justify-content-end align-items-center">
        <div
          className="input-group input-group-sm me-2"
          style={{ width: "200px" }}
        >
          <input type="text" className="form-control" placeholder="Search..." />
          <span className="input-group-text bg-white">
            <i className="bi bi-search"></i>
          </span>
        </div>
        <div className="dropdown">
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle as={Nav.Link} className="text-dark">
              <img
                src="https://ui-avatars.com/api/?name=User&background=0D6EFD&color=fff&size=30"
                alt="User Avatar"
                className="rounded-circle"
                style={{ width: "30px", height: "30px" }}
              />
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
      </div>
    </header>
  );
};

export default Header;
