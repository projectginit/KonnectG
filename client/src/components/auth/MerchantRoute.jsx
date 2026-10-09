import { Navigate } from "react-router-dom";
import useAuth from "../../context/useAuth";

const MerchantRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "merchant") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default MerchantRoute;
