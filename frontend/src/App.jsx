import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : (
              <div>
                <div className="flex justify-center mt-8 mb-4 p-6 bg-gradient-to-r from-orange-400/20 via-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-white/30">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`px-6 py-3 mx-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isLogin
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🍽️ Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`px-6 py-3 mx-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      !isLogin
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📝 Register
                  </button>
                </div>
                {isLogin ? <Login toggleForm={() => setIsLogin(false)} /> : <Register toggleForm={() => setIsLogin(true)} />}
              </div>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
