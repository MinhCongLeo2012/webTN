import { Admin, Resource, Layout, AppBar, UserMenu, Logout } from 'react-admin';
import { dataProvider } from './dataProvider';
import { ExamList, ExamEdit } from './ExamList';
import { UserList, UserEdit, UserCreate } from './UserList';
import { RiFileList3Line, RiUserLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const AdminApp = () => {
  const navigate = useNavigate();

  const authProvider = {
    login: () => Promise.resolve(),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      navigate('/login');
      return Promise.resolve();
    },
    checkAuth: () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return token && user.vaitro === 'ADMIN' 
        ? Promise.resolve()
        : Promise.reject();
    },
    checkError: (error) => {
      const status = error.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        return Promise.reject();
      }
      return Promise.resolve();
    },
    getIdentity: () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return Promise.resolve({
        id: user.iduser,
        fullName: user.hoten
      });
    },
    getPermissions: () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return Promise.resolve(user.vaitro);
    }
  };

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      basename="/admin"
      dashboard={Dashboard}
      requireAuth
      loginPage={false}
    >
      <Resource
        name="users"
        list={UserList}
        edit={UserEdit} 
        create={UserCreate}
        icon={RiUserLine}
        options={{ label: 'Quản lý tài khoản' }}
      />
      <Resource
        name="exams"
        list={ExamList}
        edit={ExamEdit}
        icon={RiFileList3Line}
        options={{ label: 'Quản lý đề thi' }}
      />
    </Admin>
  );
};

export default AdminApp;