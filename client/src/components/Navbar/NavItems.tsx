import React from "react";

interface NavItemProps {
  href: string;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, ariaLabel, title, children }) => {
  return (
    <li className="relative cursor-pointer">
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