import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  SearchInput
} from 'react-admin';

const ExamFilters = [
  <SearchInput source="q" placeholder="Tìm kiếm theo tên đề..." alwaysOn />
];

export const ExamList = () => (
  <List 
    filters={ExamFilters}
    filterDefaultValues={{ q: '' }}
  >
    <Datagrid>
      <TextField source="tende" label="Tên đề" />
      <TextField source="tenmonhoc" label="Môn học" emptyText="-" />
      <TextField source="tenkhoi" label="Khối" emptyText="-" />
      <TextField source="tenmucdich" label="Mục đích" emptyText="-" />
      <TextField source="ngaytao" label="Ngày tạo" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const ExamEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="tende" validate={required()} label="Tên đề" />
      <SelectInput
        source="idmucdich"
        label="Mục đích"
        validate={required()}
        choices={[
          { id: 'THUONG_XUYEN', name: 'Đánh giá thường xuyên' },
          { id: 'DINH_KY', name: 'Đánh giá định kỳ' },
          { id: 'ON_TAP', name: 'Ôn tập' },
        ]}
      />
    </SimpleForm>
  </Edit>
);