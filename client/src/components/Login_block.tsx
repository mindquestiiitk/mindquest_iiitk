const Login_block = () => {
  return (
    <div className="w-full max-w-md bg-[#d4f5d4] rounded-3xl shadow-lg p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-medium text-primary-green mb-12 font-acme">Login</h1>
        
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
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login_block;