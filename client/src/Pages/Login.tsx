import { useEffect } from "react";
import { login_hero } from "../assets";
import NavbarLogin from "../components/Navbar/navbar_login";
import Login_block from "../components/Login_block";

const Login = () => {
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#9FE196]">
      <NavbarLogin />
      <div className="flex flex-grow">
        {/* Left Section */}
        <div className="basis-2/5 bg-[#9FE196] flex flex-col justify-center items-center p-8">
          <header className="text-center text-[#006833] font-acme text-3xl lg:text-4xl xl:text-5xl pt-12">
            <h1>Unlock Your Mind</h1>
            <h1>Begin Your Quest</h1>
          </header>
          <div className="mt-8">
            <img
              src={login_hero}
              alt="Mind Quest Illustration"
              className="w-full max-w-2xl"
              style={{ transform: "translateX(22.5%) translateY(-16%)" }} // Shift image 10% to the right and a bit to the top
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="basis-3/5 bg-white flex justify-center items-center p- mt-[-20px]">
  <Login_block />
</div>
      </div>
    </div>
  );
};

export default Login;
