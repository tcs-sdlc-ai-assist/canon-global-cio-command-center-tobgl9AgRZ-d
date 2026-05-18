import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSession } from '../../context/SessionContext';

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * Checks isAuthenticated from SessionContext.
 * - If the session is still loading, renders a loading spinner.
 * - If the user is not authenticated, redirects to /login.
 * - Otherwise, renders children or an Outlet for nested routes.
 *
 * @param {{ children?: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-executive-blue-200 border-t-executive-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;