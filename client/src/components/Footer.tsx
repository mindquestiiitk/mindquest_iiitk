import { mindquest_logo } from "../assets";

const Footer = () => {
  return (
    <footer className="bg-secondary-green p-8">
      <div className="mx-auto">
        {/* Logo and Name Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12">
            <img src={mindquest_logo} alt="Mind Quest Logo" className="w-full h-full" />
          </div>
          <span className="text-primary-green text-xl font-semibold">Mind Quest</span>
        </div>

        {/* Divider Line */}
        <div className="w-full h-px bg-primary-green my-4"></div>
      </div>
    </footer>
  );
};

export default Footer;