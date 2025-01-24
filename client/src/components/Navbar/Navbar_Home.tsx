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

const NavbarHome = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems: NavItemData[] = [
        { href: "/", ariaLabel: "About", title: "About", text: "About" },
        { href: "/", ariaLabel: "Merch", title: "Merch", text: "Merch" },
        { href: "/team", ariaLabel: "Team", title: "Team", text: "Our Team" },
        { href: "/", ariaLabel: "Events", title: "Events", text: "Events" },
        { href: "/", ariaLabel: "Chat", title: "Chat", text: "Chat" },
    ];

    return (
        <div className="flex justify-center items-center px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 xl:px-4 w-full">
            <div className="relative flex items-center justify-between w-full">
                <a
                    href="/"
                    aria-label="mindquest"
                    title="mindquest"
                    className="inline-flex items-center -my-8"
                >
                    <img src={mindquest_logo} alt="mindquest logo" />
                </a>
                <ul className="hidden lg:flex items-center space-x-8">
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
                                <nav>
                                    <div>
                                        <button
                                            aria-label="Close Menu"
                                            title="Close Menu"
                                            className="p-2 absolute top-4 right-4 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span>
                                                <MdClose className="w-7 h-7 text-light-green" />
                                            </span>
                                        </button>
                                    </div>
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

export default NavbarHome;
