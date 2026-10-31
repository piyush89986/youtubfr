import api from './api';

export const dashboardService = {
  async getStats() {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
  async getWorkerStatus() {
    const res = await api.get('/dashboard/worker-status');
    return res.data;
  },
};
