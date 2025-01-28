import { mindquest_logo } from "../assets";

const Footer = () => {
  return (
    <footer className="bg-secondary-green py-1 px-8">
      <div className="mx-auto">
        {/* Logo and Name Section */}
        <div className="flex items-center gap-3 mb-2 mt-2">
          <div className="w-14 h-14">
            <img src={mindquest_logo} alt="Mind Quest Logo" className="w-full h-full" />
          </div>
          <span className="text-primary-green text-2xl font-semibold">Mind Quest</span>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">


          {/* Quick Links */}
          <div>
            <h3 className="text-accent font-semibold mb-4">Quick Links</h3>
            <ul className="text-foreground/70 text-sm space-y-2">
              <li><a href="/" className="hover:text-accent">Home</a></li>
              <li><a href="/events" className="hover:text-accent">Events</a></li>
              <li><a href="/merch" className="hover:text-accent">Merch</a></li>
              <li><a href="/" className="hover:text-accent">About</a></li>
            </ul>
          </div>


          {/* Contact Info */}
          <div>
            <h3 className="text-accent font-semibold mb-4">Contact Us</h3>
            <ul className="text-foreground/70 text-sm space-y-2">
              <li>IIIT Kottayam</li>
              <li>Email: info@mindquest.com</li>
              <li>Phone: (123) 456-7890</li>
            </ul>
          </div>
        </div>

        
          {/* Social Media Links */}
          <div className="flex justify-center gap-4 text-accent mb-4">
            <a href="#" className="hover:text-accent/90">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg></a>
            <a href="#" className="hover:text-green-900"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg></a>
            <a href="#" className="hover:text-green-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9">
                </path></svg>
            </a></div>



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
