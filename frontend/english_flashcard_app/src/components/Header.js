import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Nav } from "react-bootstrap";
import { toggleSidebar } from "../stores/slices/sidebarSlice";
import { memo } from "react";
import LogoutItem from "./LogoutItem";
import TopicAutocompleteSearch from "./TopicAutocompleteSearch";
import UserAvatar from "../commons/userAvatar";

const Header = memo(() => {
  const currentUser = useSelector((state) => state.user ?? {});
  const dispatch = useDispatch();

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
        <TopicAutocompleteSearch />
        <div className="dropdown">
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle
              key={"profile"}
              as={Nav.Link}
              className="text-dark d-flex align-items-center gap-2"
            >
              <UserAvatar
                user={currentUser}
                size={30}
                className="border border-white shadow-sm"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item href="/profile">Profile</Dropdown.Item>
              <Dropdown.Item href="/settings">Settings</Dropdown.Item>
              <Dropdown.Divider />
              <LogoutItem>
                <Dropdown.Item>
                  Logout
                </Dropdown.Item>
              </LogoutItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
});

export default Header;
