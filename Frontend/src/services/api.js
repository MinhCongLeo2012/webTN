const handleResponse = async (response) => {
  if (response.status === 403) {
    throw new Error('Bạn không có quyền thực hiện hành động này');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Có lỗi xảy ra');
  }
  
  return response.json();
};

export { handleResponse }; 