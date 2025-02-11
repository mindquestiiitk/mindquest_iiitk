import { Link } from "react-router-dom";
import { mindquest_logo } from "../assets";
import { Globe, Instagram, Linkedin } from "lucide-react";
import navItems from "./Navbar/navlist";
const Footer = () => {
    return (
        <footer className="bg-secondary-green py-1 px-8">
            <div className="mx-auto">
                {/* Logo and Name Section */}

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4 mt-8">


                    {/* Quick Links */}
                    <div >
                        <h3 className="text-accent font-semibold mb-4 text-lg">Quick Links</h3>
                        <ul className="text-foreground/70 text-md space-y-2">
                           {navItems.map((item, index) => (
                                <li key={index}>
                                    <Link to={item.href} className="hover:text-accent/90">
                                        {item.text}
                                    </Link>
                                </li>
                           ))}
                        </ul>
                    </div>


                    {/* Contact Info */}
                    <div>
                        <h3 className="text-accent font-semibold mb-4 text-lg">Contact Us</h3>
                        <ul className="text-foreground/70 text-md space-y-2">
                            <li>IIIT Kottayam</li>
                            <li>Email: mindquest@iiitkottayam.ac.in</li>
                            <li>Address: Valavoor P O, Pala, Kottayam, Kerala, India - 686635</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-3 mb-4 mt-2">
                    <div className="w-14 h-14">
                        <img src={mindquest_logo} alt="Mind Quest Logo" className="w-full h-full" />
                    </div>
                    <span className="text-primary-green text-2xl font-semibold">Mind Quest</span>
                </div>


                {/* Social Media Links */}
                <div className="flex justify-center gap-4 text-accent mb-4">
                    <a href="https://www.linkedin.com/company/mind-quest" className="hover:text-accent/90">
                        <Linkedin />
                    </a>
                    <a href="https://www.instagram.com/mindquest_iiitk_/" className="hover:text-green-900">
                        <Instagram />
                    </a>
                    <a href="/" className="hover:text-green-900">
                        <Globe />
                    </a>
                </div>



                {/* Divider Line */}
                <div className="w-full h-px bg-accent mt-4 mb-1"></div>

                {/* Copyright */}
                <div className="text-center text-sm text-foreground/70">
                    © {new Date().getFullYear()} Mind Quest. All rights reserved.
                </div>

            </div>
        </footer>
    );
};

export default Footer;
