import api from './api';

export const getSavingsTypes = async () => {
	const response = await api.get('/savings-type');
	return response;
};

export const createSavingsType = async (data) => {
	const response = await api.post('/savings-type', data);
	return response;
};

export const updateSavingsType = async (id, data) => {
	const response = await api.put(`/savings-type/${id}`, data);
	return response;
};
