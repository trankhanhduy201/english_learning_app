import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
	const { isOpen } = useSelector((state) => state.sidebar);
	const location = useLocation();
	
	const isActive = (path) => {
		if (typeof path === 'string') {
			return location.pathname.includes(path);
		}
		return path.some((p) => 
			location.pathname.includes(p)
		);
	}

	return (
		<nav
			className={`bg-dark text-white sidebar ${
				isOpen ? 'show-sidebar' : ''
			} d-xl-block`}
		>
			<ul className="nav flex-column">
				<li className="nav-item">
					<Link 
						className={`nav-link text-start text-white sidebar-link ${
							isActive('dashboard') ? 'active' : ''
						}`} 
						to="/dashboard"
					>
						Dashboard
					</Link>
				</li>
				<li className="nav-item">
					<Link 
						className={`nav-link text-start text-white sidebar-link ${
							isActive(['topic', 'vocab']) ? 'active' : ''
						}`} 
						to="/topics"
					>
						Topics
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default Sidebar;
