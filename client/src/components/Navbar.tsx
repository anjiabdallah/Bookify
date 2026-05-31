import { BookOpen, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    const newTheme = isDark ? 'fairy' : 'fairydark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDark(!isDark);
  };

  if (!user) {
    return (
      <div className="navbar bg-base-200 px-6 shadow-sm">
        <div className="flex-none">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <BookOpen size={24} />
            Bookify
          </Link>
        </div>
        <div className="flex-1" />
        <div className="flex-none flex items-center gap-3">
          <Link to="/register" className="btn btn-primary btn-sm">
            Sign Up
          </Link>
          <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="navbar bg-base-200 px-6 shadow-sm">
      <div className="flex-none">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <BookOpen size={24} />
          Bookify
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center gap-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? 'btn-active' : ''}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? 'btn-active' : ''}`}
        >
          Search
        </NavLink>
        <NavLink
          to="/my-books"
          className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? 'btn-active' : ''}`}
        >
          My Books
        </NavLink>
        <NavLink
          to="/yearly"
          className={({ isActive }) => `btn btn-ghost btn-sm ${isActive ? 'btn-active' : ''}`}
        >
          By Year
        </NavLink>
      </div>
      <div className="flex-none flex items-center gap-4">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
            {user.username}
          </label>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button type="button" onClick={logout}>Logout</button>
            </li>
          </ul>
        </div>
        <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}

export default Navbar;
