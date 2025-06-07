import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [visible, setVisible] = useState(false); // control visibility
  const [open, setOpen] = useState(false); // mobile menu
  const location = useLocation();

  const toggleMenu = () => setOpen(!open);

  return (
    <>
      {/* Hover zone to show header */}
      <div
        className="fixed top-0 left-0 w-full h-4 z-40"
        onMouseEnter={() => setVisible(true)}
      ></div>

      {/* Animated header */}
      <header
        onMouseLeave={() => setVisible(false)}
        className={`fixed w-full z-50 bg-gray-900 bg-opacity-70 backdrop-blur-md border-b border-purple-700 shadow-xl font-inter transition-transform duration-500 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4 py-3 md:px-8">
          <div className="text-2xl md:text-3xl font-extrabold text-fuchsia-400 drop-shadow-[0_0_6px_rgba(255,0,255,0.5)] tracking-wide">
            Irwan Journey
          </div>

          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className={`text-lg font-medium transition-colors duration-200 hover:text-fuchsia-300 ${
                location.pathname === '/' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400 pb-1' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/foto"
              className={`text-lg font-medium transition-colors duration-200 hover:text-fuchsia-300 ${
                location.pathname === '/foto' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400 pb-1' : 'text-gray-300'
              }`}
            >
              Foto
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-purple-400 hover:text-fuchsia-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-md"
            aria-label="Toggle menu"
          >
            <svg
              className="w-8 h-8 transition-transform duration-300 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              ></path>
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown */}
        <ul
          className={`md:hidden flex flex-col w-full bg-gradient-to-b from-gray-900 to-gray-800 border-t border-purple-700 text-white transition-all duration-300 ease-in-out overflow-hidden
            ${open ? 'max-h-screen opacity-100 py-2' : 'max-h-0 opacity-0'}`}
        >
          <li>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-lg font-medium hover:bg-purple-800/40 hover:text-fuchsia-300 transition-all duration-200 ${
                location.pathname === '/' ? 'bg-purple-900/30 text-fuchsia-400 font-bold' : 'text-gray-200'
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/foto"
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-lg font-medium hover:bg-purple-800/40 hover:text-fuchsia-300 transition-all duration-200 ${
                location.pathname === '/foto' ? 'bg-purple-900/30 text-fuchsia-400 font-bold' : 'text-gray-200'
              }`}
            >
              Foto
            </Link>
          </li>
        </ul>
      </header>
    </>
  );
}

export default Header;
