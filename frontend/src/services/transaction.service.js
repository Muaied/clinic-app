import api from './api';

export const getDailyStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getDailyTransactions = async (date) => {
  const { data } = await api.get('/transactions/daily', { params: { date } });
  return data;
};

export const createTransaction = async (transaction) => {
  const { data } = await api.post('/transactions', transaction);
  return data;
};

export const updateTransaction = async (id, transaction) => {
  const { data } = await api.patch(`/transactions/${id}`, transaction);
  return data;
};

export const getArchive = async (params) => {
  const { data } = await api.get('/archive', { params });
  return data;
};

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
};
