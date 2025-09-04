import { useState } from "react";
import logo from "../assets/logo.png";
import { navitems } from "../constants";

const Navbar = () => {
  const [isLive, setIsLive] = useState(true);
  return (
    <>
      <nav className="h-20 w-full bg-[var(--color-navbar)] flex items-center text-[var(--color-text-primary)] px-6">
        {/* Logo (left) */}
        <div className="flex-shrink-0">
          <img src={logo} alt="Website Logo" className="h-20 w-auto" />
        </div>

        {/* Nav items (centered) */}
        <ul className="h-20 items-center justify-center hidden lg:flex flex-grow space-x-10">
          {navitems.map((item, index) => (
            <li key={index} className="relative group">
              <a
                href={item.href}
                className="hover:text-[var(--color-text-secondary)] transition-colors duration-300"
              >
                {item.label}
              </a>
              {/* Underline animation */}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[var(--color-text-secondary)] transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        {/* Spacer */}

        <div
          onClick={() => setIsLive(!isLive)}
          className="h-[60px] w-[90px] flex items-center justify-start ml-20 space-x-2.5 cursor-pointer select-none"
        >
          <span className="text-sm font-semibold">
            {isLive ? "LIVE" : "SIM"}
          </span>
          <span
            className={`h-4 w-4 rounded-full ${
              isLive
                ? "bg-green-400 animate-pulseGlowGreen"
                : "bg-red-500 animate-pulseGlowRed"
            }`}
          ></span>
        </div>
      </nav>

      <div className="min-h-screen w-full bg-[var(--color-background)]"></div>
    </>
  );
};

export default Navbar;
