import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-foreground-primary mb-4">404</h1>
        <h2 className="text-2xl font-medium text-foreground-primary mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for seems to have wandered off into the
          woods...
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-accent text-accent-foreground px-6 py-3 rounded-full hover:bg-accent/90 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
