import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.vaitro)) {
    if (user.vaitro === 'TEACHER') {
      return <Navigate to="/home" />;
    } else if (user.vaitro === 'STUDENT') {
      return <Navigate to="/student/class" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;