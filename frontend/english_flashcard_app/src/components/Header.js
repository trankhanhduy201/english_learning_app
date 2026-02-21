import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Nav } from "react-bootstrap";
import { toggleSidebar } from "../stores/slices/sidebarSlice";
import { setLangThunk } from "../stores/actions/langAction";
import { LANGUAGES } from "../configs/langConfig";
import { memo } from "react";
import LogoutItem from "./LogoutItem";
import TopicAutocompleteSearch from "./TopicAutocompleteSearch";

const Header = memo(() => {
  const globalLang = useSelector((state) => state.lang);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onChangeGlobalLang = (lang) => {
    dispatch(setLangThunk(lang));
    navigate("/topics");
  };

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
        <div className="dropdown me-2">
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle
              key={"globalLang"}
              as={Nav.Link}
              className="text-dark"
            >
              {globalLang}
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              {Object.values(LANGUAGES).map((item) => (
                <Dropdown.Item
                  key={item.key}
                  onClick={() => onChangeGlobalLang(item.key)}
                >
                  {item.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="dropdown">
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle
              key={"profile"}
              as={Nav.Link}
              className="text-dark"
            >
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
