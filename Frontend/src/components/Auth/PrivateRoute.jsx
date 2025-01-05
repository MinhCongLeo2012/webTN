import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.vaitro)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;