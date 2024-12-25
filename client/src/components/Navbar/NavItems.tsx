import React from "react";

interface NavItemProps {
  href: string;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, ariaLabel, title, children }) => {
  return (
    <li className="relative hover:text-light-green cursor-pointer transition-all ease-in-out before:transition-[width] before:ease-in-out before:duration-700 before:absolute before:bg-light-green before:origin-center before:h-[1px] before:w-0 hover:before:w-[50%] before:bottom-0 before:left-[50%] after:transition-[width] after:ease-in-out after:duration-700 after:absolute after:bg-light-green after:origin-center after:h-[1px] after:w-0 hover:after:w-[50%] after:bottom-0 after:right-[50%]">
      <a
        href={href}
        aria-label={ariaLabel}
        title={title}
        className="font-roboto font-light tracking-wide text-light-green"
      >
        {children}
      </a>
    </li>
  );
};

export default NavItem;