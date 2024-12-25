const Login_block = () => {
  return (
    <div className="w-full max-w-md h-auto min-h-[550px] bg-[#9FE196] rounded-lg shadow-lg p-8">
      <div className="max-w-md mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-[#006833] text-center mb-6">Login</h1>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="py-8 text-base leading-6 space-y-8 text-gray-700 sm:text-lg sm:leading-7">
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600 bg-[#9FE196]"
                placeholder="Username"
              />
              <label
                htmlFor="username"
                className="absolute left-0 -top-3.5 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Username
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                className="peer placeholder-transparent h-12 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600 bg-[#9FE196]"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-0 -top-3.5 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Password
              </label>
            </div>
            <button
              type="submit"
              className="mt-4 w-full py-3 bg-[#006833] text-white font-bold rounded"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login_block;