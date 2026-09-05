import api from './api';

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data.data; // because unified response structure
};

export const createUser = async (userData) => {
  const { data } = await api.post('/users', userData);
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.patch(`/users/${id}`, userData);
  return data;
};

export const toggleUserStatus = async (id, is_active) => {
  const { data } = await api.patch(`/users/${id}/status`, { is_active });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};
