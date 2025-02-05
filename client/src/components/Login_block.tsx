import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const Login_block = () => {
  const notify = () => {
    toast.dismiss(); // Dismiss any existing toasts
    toast.error('Invalid username or password !', {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      // transition: Bounce,
      });
    };
  return (
    <div className="w-full max-w-md bg-[#d4f5d4] rounded-3xl shadow-lg p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-medium text-primary-green mb-12 font-acme">
          Login
        </h1>

        <div className="space-y-8">
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              className="w-full pb-2 border-b-2 border-gray-300 bg-transparent text-primary-green focus:outline-none focus:border-[#006833]"
              placeholder="Username"
            />
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              className="w-full pb-2 border-b-2 border-gray-300 bg-transparent text-primary-green focus:outline-none focus:border-[#006833]"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary-green text-secondary-green font-medium rounded-2xl mt-8"
            onClick={notify}
          >
            Login
          </button>
          <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            // transition={Bounce}
          />{" "}
        </div>
      </div>
    </div>
  );
};

export default Login_block;
