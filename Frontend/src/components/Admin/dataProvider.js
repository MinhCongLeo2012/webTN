import { fetchUtils } from 'react-admin';
import { API_BASE_URL } from '../../config';

const httpClient = (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('No auth token'));
  }

  if (!options.headers) {
    options.headers = new Headers();
  }
  options.headers.set('Authorization', `Bearer ${token}`);
  
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const { q } = params.filter;

    let url = `${API_BASE_URL}/api/admin/${resource}`;

    // Add search parameter if exists
    if (q) {
      url += `?search=${encodeURIComponent(q)}`;
    }

    const { json } = await httpClient(url);

    if (!json || !json.data) {
      return { data: [], total: 0 };
    }

    // Filter data based on search term if it exists
    let filteredData = json.data;
    if (q) {
      filteredData = json.data.filter(item => {
        if (resource === 'users') {
          return item.name.toLowerCase().includes(q.toLowerCase()) ||
                 item.email.toLowerCase().includes(q.toLowerCase());
        }
        if (resource === 'exams') {
          return item.tende.toLowerCase().includes(q.toLowerCase());
        }
        return true;
      });
    }

    const data = filteredData.map(item => {
      if (resource === 'users') {
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          vaitro: item.role || item.vaitro,
          sodienthoai: item.sodienthoai,
          ngaysinh: item.ngaysinh,
          gioitinh: item.gioitinh
        };
      }
      
      if (resource === 'exams') {
        return {
          id: item.id || item.iddethi,
          tende: item.tende || '',
          tenmonhoc: item.tenmonhoc || '',
          tenkhoi: item.tenkhoi || '',
          tenmucdich: item.tenmucdich || '',
          ngaytao: item.ngaytao || ''
        };
      }

      return item;
    });

    return {
      data: data,
      total: data.length
    };
  },

  getOne: async (resource, params) => {
    const url = `${API_BASE_URL}/api/admin/${resource}/${params.id}`;
    const { json } = await httpClient(url);
    
    if (!json || !json.data) {
      throw new Error('Invalid response');
    }

    let data = json.data;
    if (resource === 'users') {
      data = {
        id: json.data.id,
        name: json.data.name,
        email: json.data.email,
        vaitro: json.data.role || json.data.vaitro,
        sodienthoai: json.data.sodienthoai,
        ngaysinh: json.data.ngaysinh,
        gioitinh: json.data.gioitinh
      };
    } else if (resource === 'exams') {
      console.log('Single exam data:', json.data);
      data = {
        id: json.data.iddethi || json.data.id,
        tende: json.data.tende,
        tongsocau: json.data.tongsocau,
        ghichu: json.data.ghichu,
        monhoc: json.data.tenmonhoc,
        khoi: json.data.tenkhoi,
        mucdich: json.data.tenmucdich,
        ngaytao: json.data.ngaytao,
        nguoitao: json.data.nguoitao || json.data.hoten
      };
    }

    return { data };
  },

  create: async (resource, params) => {
    const url = `${API_BASE_URL}/api/admin/${resource}`;
    const { json } = await httpClient(url, {
      method: 'POST',
      body: JSON.stringify(params.data)
    });

    return { data: { ...params.data, id: json.data.id || json.data.iduser || json.data.iddethi } };
  },

  update: async (resource, params) => {
    const url = `${API_BASE_URL}/api/admin/${resource}/${params.id}`;
    const { json } = await httpClient(url, {
      method: 'PUT',
      body: JSON.stringify(params.data)
    });

    return { data: { ...params.data, id: params.id } };
  },

  delete: async (resource, params) => {
    const url = `${API_BASE_URL}/api/admin/${resource}/${params.id}`;
    try {
      await httpClient(url, {
        method: 'DELETE'
      });
      return { data: params.previousData };
    } catch (error) {
      console.error('Delete error:', error);
      throw error; // Re-throw để React Admin có thể xử lý lỗi
    }
  },

  deleteMany: async (resource, params) => {
    try {
      await Promise.all(
        params.ids.map(id =>
          httpClient(`${API_BASE_URL}/api/admin/${resource}/${id}`, {
            method: 'DELETE',
          })
        )
      );
      return { data: [] };
    } catch (error) {
      console.error('DeleteMany error:', error);
      throw error;
    }
  }
};
