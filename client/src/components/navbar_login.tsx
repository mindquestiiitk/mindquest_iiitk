import { iiitkottayam_logo, mindquest_logo } from "../assets";

const NavbarLogin = () => {
  return (
    <div className="w-full fixed top-0 left-0 flex justify-between items-center px-4  bg-transparent">
      {/* Left Logo */}
      <a href="https://mindquest.in">
        <img
          src={mindquest_logo}
          alt="MindQuest Logo"
          className="h-24 w-auto"
        />
      </a>
      {/* Right Logo */}
      <a href="https://iiitkottayam.ac.in">
        <img
          src={iiitkottayam_logo}
          alt="IIIT Kottayam Logo"
          className="h-16 w-auto"
        />
      </a>
    </div>
  );
};

export default NavbarLogin;