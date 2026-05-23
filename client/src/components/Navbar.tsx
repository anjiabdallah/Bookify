import { BookOpen, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    const newTheme = isDark ? 'fairy' : 'fairydark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDark(!isDark);
  };

  return (
    <div className="navbar bg-base-200 px-6 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <BookOpen size={24} />
          Bookify
        </Link>
      </div>
      <div className="flex-none flex items-center gap-4">
        {!user
          ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )
          : (
              <>
                <Link to="/profile" className="btn btn-ghost btn-sm">Profile</Link>
                <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
              </>
            )}
        <button onClick={toggleTheme} className="btn btn-ghost btn-circle btn-sm">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
}

export default Navbar;
