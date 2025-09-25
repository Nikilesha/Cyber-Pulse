import { useState } from "react";
import logo from "../assets/logo.png";
import { navitems } from "../constants";
import { Menu, X } from "lucide-react";
import { motion as Motion,AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isLive, setIsLive] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 h-20 w-full bg-[var(--color-navbar)] flex items-center justify-between text-[var(--color-text-primary)] px-6 z-50">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt="Website Logo"
            className="h-16 w-auto md:h-16 lg:h-14"
          />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex flex-grow items-center justify-center space-x-20 w-auto">
          {navitems.map((item, index) => (
            <li
              key={index}
              className="relative group cursor-pointer"
              onClick={() => setActiveIndex(index)}
            >
              <a
                href={item.href}
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  activeIndex === index
                    ? "text-[var(--color-text-secondary)]"
                    : "hover:text-[var(--color-text-secondary)]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>

              {/* underline highlight */}
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-[var(--color-text-secondary)] transition-all duration-300 
                  ${activeIndex === index ? "w-full" : "w-0 group-hover:w-full"}`}
              ></span>
            </li>
          ))}
        </ul>

        {/* Live/Sim Toggle (desktop) */}
        <div
          onClick={() => setIsLive(!isLive)}
          className="hidden lg:flex h-[20px] w-[70px] items-center justify-start ml-6 space-x-2.5 cursor-pointer select-none"
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

        {/* Hamburger (Mobile only) */}
        <button
          className="lg:hidden text-2xl z-50 relative cursor-pointer hover:bg-amber-50/10 hover:rounded "
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <Motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)} // close if clicking outside
            />

            {/* Drawer */}
            <Motion.div
              className="fixed top-0 left-0 w-3/4 sm:w-1/2 h-full bg-[var(--color-navbar)] text-[var(--color-text-primary)] z-50 p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            >
              {/*Menu Items */}
              <ul className="flex flex-col space-y-6 mt-10 text-lg">
                {navitems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      onClick={() => {
                        setActiveIndex(index);
                        setIsOpen(false);
                      }}
                      className={`inline-block px-2 py-1 rounded transition-colors duration-300 ${
                        activeIndex === index
                          ? "text-[var(--color-text-secondary)]"
                          : "hover:text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Live/Sim Toggle inside drawer */}
              <div
                onClick={() => setIsLive(!isLive)}
                className="mt-8 flex items-center space-x-3 cursor-pointer select-none"
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
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
