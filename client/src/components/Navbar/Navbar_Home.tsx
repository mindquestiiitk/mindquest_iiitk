import { useState } from "react";
import { HiMenu } from "react-icons/hi";
import { MdClose } from "react-icons/md";

import { mindquest_logo } from "../../assets";
import NavItem from "./NavItems";

interface NavItemData {
  href: string;
  ariaLabel: string;
  title: string;
  text: string;
}

const Navbar_Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItemData[] = [
    { 
      href: "/", 
      ariaLabel: "About", 
      title: "About", 
      text: "About" 
    },
    {
      href: "/",
      ariaLabel: "Our Team",
      title: "Our Team",
      text: "Our Team",
    },
    {
      href: "/",
      ariaLabel: "Binaural Beats",
      title: "Binaural Beats",
      text: "Binaural Beats",
    },
    {
      href: "/",
      ariaLabel: "Mood Survey",
      title: "Mood Survey",
      text: "Mood Survey",
    },
    { 
      href: "/", 
      ariaLabel: "Chat", 
      title: "Chat", 
      text: "Chat" 
    },
  ];

  return (
    <div className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full md:px-24 lg:px-8 xl:px-28 bg-background-primary">
      <div className="relative flex items-center justify-between">
        <a
          href="/"
          aria-label="mindquest"
          title="mindquest"
          className="inline-flex items-center"
        >
          <img src={mindquest_logo} alt="mindquest logo" />
        </a>
        <ul className="hidden items-center space-x-8 lg:flex">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              href={item.href}
              ariaLabel={item.ariaLabel}
              title={item.title}
            >
              {item.text}
            </NavItem>
          ))}
        </ul>

        <div className="lg:hidden">
          <button
            aria-label="Open Menu"
            title="Open Menu"
            className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-purple-50 focus:bg-deep-purple-50"
            onClick={() => setIsMenuOpen(true)}
          >
            <HiMenu className="w-7 h-7 text-light-green" />
          </button>
          {isMenuOpen && (
            <div className="absolute top-0 left-0 w-full">
              <div className="p-5 bg-white border rounded shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <a
                      href="/"
                      aria-label="Company"
                      title="Company"
                      className="inline-flex items-center"
                    >
                      <img src={mindquest_logo} alt="mindquest logo" />

                      <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                        Mindquest - IIITK
                      </span>
                    </a>
                  </div>
                  <div>
                    <button
                      aria-label="Close Menu"
                      title="Close Menu"
                      className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MdClose className="w-7 h-7 text-light-green" />
                    </button>
                  </div>
                </div>
                <nav>
                  <ul className="space-y-4">
                    {navItems.map((item, index) => (
                      <NavItem
                        key={index}
                        href={item.href}
                        ariaLabel={item.ariaLabel}
                        title={item.title}
                      >
                        {item.text}
                      </NavItem>
                    ))}
                    <li>
                      <a
                        href="/"
                        className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded shadow-md bg-light-green hover:bg-[#457d3e] focus:shadow-outline focus:outline-none"
                        aria-label="Log In"
                        title="Log In"
                      >
                        Log In
                      </a>
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

export default Navbar_Home;
