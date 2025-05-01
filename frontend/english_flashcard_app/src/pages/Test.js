import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Test = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavClick = (item) => {
    setActiveItem(item);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="d-flex flex-column vh-100">
      <header className="navbar navbar-light bg-light border-bottom px-2 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-outline-primary d-xl-none"
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <h5 className="mb-0 ms-3">Dashboard Header</h5>

        {/* User Avatar Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-link text-dark"
            onClick={toggleDropdown}
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded={dropdownOpen}
          >
            <img
              src="https://ui-avatars.com/api/?name=User&background=0D6EFD&color=fff&size=30"
              alt="User Avatar"
              className="rounded-circle"
              style={{ width: "30px", height: "30px" }}
            />
          </button>
          <ul
            className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? "show" : ""}`}
            aria-labelledby="userDropdown"
            style={{
              zIndex: 1050, // Ensure dropdown is above content
              position: "absolute",
              right: 0, // Align the dropdown to the right
              top: "100%", // Position it below the avatar button
              maxHeight: "300px", // Set a max height to prevent overflow
              overflowY: "auto", // Allow scrolling if needed
            }}
          >
            <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Settings
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Log Out
              </a>
            </li>
          </ul>
        </div>
      </header>

      <div className="d-flex flex-grow-1">
        <nav
          className={`bg-dark text-white sidebar ${
            sidebarOpen ? "show-sidebar" : ""
          } d-xl-block`}
        >
          <ul className="nav flex-column">
            <li className="nav-item">
              <a
                className={`nav-link text-white sidebar-link ${
                  activeItem === "Dashboard" ? "active" : ""
                }`}
                href="#"
                onClick={() => handleNavClick("Dashboard")}
              >
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link text-white sidebar-link ${
                  activeItem === "Settings" ? "active" : ""
                }`}
                href="#"
                onClick={() => handleNavClick("Settings")}
              >
                Settings
              </a>
            </li>
          </ul>
        </nav>

        <main className="flex-grow-1 p-4 bg-light">
          <h1>{activeItem}</h1>
        </main>
      </div>
    </div>
  );
};

export default Test;
