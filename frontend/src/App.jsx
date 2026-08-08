import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import SendMail from "./pages/SendMail";
import History from "./pages/History";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/send"
          element={
            <ProtectedRoute>
              <SendMail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/send" replace />} />
        <Route path="*" element={<Navigate to="/send" replace />} />
      </Routes>
    </>
  );
}

export default App;
