import React from "react";
import { Link } from "react-router-dom";

interface NavItemProps {
  href: string;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, ariaLabel, title, children }) => {
  return (
    <li className="relative cursor-pointer w-fit">
      <Link
        to={href}
        aria-label={ariaLabel}
        title={title}
        className="font-roboto font-light tracking-wide text-light-green line-expand-x"
      >
        {children}
      </Link>
    </li>
  );
};

export default NavItem;