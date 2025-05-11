import { useState } from "react";
import { HiMenu } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { mindquest_logo } from "../../assets";
import NavItem from "./NavItems";
import { Link } from "react-router-dom";
import navItems from "./navlist";
import { UserMenu } from "../UserMenu";
import { useAuth } from "../../contexts/AuthContext";

const Navbar_Home_Auth = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex justify-center items-center px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 xl:px-4">
      <div className="relative flex items-center justify-between w-full">
        <Link to={"/"} aria-label="mindquest" title="mindquest" className="inline-flex items-center -my-8">
          <img src={mindquest_logo} alt="mindquest logo" />
        </Link>
        <ul className="hidden lg:flex items-center space-x-8 text-xl">
          {navItems.map((item, index) => (
            <NavItem key={index} href={item.href} ariaLabel={item.ariaLabel} title={item.title}>
              {item.text}
            </NavItem>
          ))}
        </ul>
        
        <div className="hidden lg:flex items-center space-x-6">
          {/* User Menu */}
          <UserMenu />
          
          {/* IIIT Kottayam Logo */}
          <Link to={"https://iiitkottayam.ac.in"} aria-label="iiit kottayam" title="iiit kottayam" className="items-center -my-8">
            <img src={"https://iiitkottayam.ac.in/data/images/main/logo.jpg"} className="h-16" alt="IIIT Kottayam" />
          </Link>
        </div>

        <div className="lg:hidden">
          <button
            aria-label="Open Menu"
            title="Open Menu"
            className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50 focus:bg-deep-purple-50"
            onClick={() => {
              setIsMenuOpen(true);
              document.body.classList.add("overflow-hidden");
            }}
          >
            <HiMenu className="w-7 h-7 text-light-green" />
          </button>

          {isMenuOpen && (
            <div className="absolute inset-0 z-50 min-h-screen">
              <div className="p-5 border shadow-md bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Link to={"/"} aria-label="Company" title="Company" className="inline-flex items-center">
                      <img src={mindquest_logo} alt="mindquest logo" />
                      <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                        Mindquest - IIITK
                      </span>
                    </Link>
                  </div>
                  <div>
                    <button
                      aria-label="Close Menu"
                      title="Close Menu"
                      className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                      onClick={() => {
                        setIsMenuOpen(false);
                        document.body.classList.remove("overflow-hidden");
                      }}
                    >
                      <MdClose className="w-7 h-7 text-light-green" />
                    </button>
                  </div>
                </div>
                <nav>
                  <ul className="space-y-4">
                    {navItems.map((item, index) => (
                      <NavItem key={index} href={item.href} ariaLabel={item.ariaLabel} title={item.title}>
                        {item.text}
                      </NavItem>
                    ))}
                    <li>
                      <Link
                        to={"/profile"}
                        className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-light-green hover:bg-[#457d3e] focus:shadow-outline focus:outline-none"
                        aria-label="Profile"
                        title="Profile"
                      >
                        {user ? 'My Profile' : 'Log In'}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar_Home_Auth;
