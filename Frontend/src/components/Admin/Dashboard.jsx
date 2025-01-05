import { Card, CardContent, CardHeader } from '@mui/material';
import { Title } from 'react-admin';

const Dashboard = () => (
  <Card>
    <Title title="Dashboard" />
    <CardHeader title="Chào mừng đến với trang quản trị" />
    <CardContent>
      <p>Quản lý tài khoản và đề thi của hệ thống</p>
    </CardContent>
  </Card>
);

export default Dashboard;