import api from './api';

export const getCustomerByIdNumber = async (idNumber) => {
	const response = await api.get('/customers/search', {
		params: { idNumber },
	});
	return response;
};

export const createCustomer = async (customerData) => {
	const response = await api.post('/customers', customerData);
	return response;
};
