import api from './api';

export const getAuditLogs = async (params) => {
  const { data } = await api.get('/audit-logs', { params });
  return data;
};

export const getDailyReport = async (date) => {
  const { data } = await api.get('/reports/daily', { params: { date } });
  return data.data;
};

export const getArchiveReport = async (date_from, date_to) => {
  const { data } = await api.get('/reports/archive', { params: { date_from, date_to } });
  return data.data;
};
