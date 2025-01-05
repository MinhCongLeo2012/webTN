import {
    List,
    Datagrid,
    TextField,
    EmailField,
    EditButton,
    DeleteButton,
    Create,
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    required,
    email,
    SearchInput
  } from 'react-admin';
import { useNavigate } from 'react-router-dom';
  
  const UserFilters = [
    <SearchInput source="q" placeholder="Tìm kiếm theo tên..." alwaysOn />
  ];
  
  export const UserList = () => (
    <List 
      filters={UserFilters}
      filterDefaultValues={{ q: '' }}
    >
      <Datagrid>
        <TextField source="name" label="Tên" />
        <EmailField source="email" />
        <TextField source="vaitro" label="Vai trò" />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
  
  export const UserEdit = () => (
    <Edit>
      <SimpleForm>
        <TextInput source="name" label="Họ tên" validate={required()} />
        <TextInput source="email" label="Email" validate={[required(), email()]} />
        <SelectInput
          source="role"
          label="Vai trò"
          choices={[
            { id: 'TEACHER', name: 'Giáo viên' },
            { id: 'STUDENT', name: 'Học sinh' },
            { id: 'ADMIN', name: 'Quản trị viên' },
          ]}
        />
        <TextInput source="password" type="password" label="Mật khẩu mới" />
      </SimpleForm>
    </Edit>
  );
  
  export const UserCreate = () => {
    const navigate = useNavigate();

    const onSuccess = () => {
      navigate('/admin/users');
    };

    return (
      <Create mutationOptions={{ onSuccess }}>
        <SimpleForm>
          <TextInput 
            source="name" 
            label="Họ tên"
            validate={[required()]}
          />
          <TextInput 
            source="email" 
            type="email"
            label="Email"
            validate={[required(), email()]}
          />
          <TextInput 
            source="password" 
            type="password" 
            label="Mật khẩu"
            validate={[required()]}
          />
          <SelectInput
            source="role"
            label="Vai trò"
            validate={[required()]}
            choices={[
              { id: 'TEACHER', name: 'Giáo viên' },
              { id: 'STUDENT', name: 'Học sinh' },
              { id: 'ADMIN', name: 'Quản trị viên' },
            ]}
          />
        </SimpleForm>
      </Create>
    );
  };