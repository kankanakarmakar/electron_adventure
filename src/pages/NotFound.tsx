import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 70%, #38bdf8 100%)' }}>
      <div className="text-center bg-white/90 rounded-2xl p-8 shadow-lg border-2 border-slate-300">
        <h1 className="mb-4 text-6xl font-black text-slate-800">404</h1>
        <p className="mb-6 text-xl text-slate-600">Oops! Page not found</p>
        <a href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
