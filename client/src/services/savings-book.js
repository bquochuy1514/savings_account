import api from './api';

export const getSavingsBooks = async () => {
	const response = await api.get('/savings-book');
	return response;
};

export const createSavingsBook = async (bookData) => {
	console.log('bookdata servicve', bookData);
	const response = await api.post('/savings-book', bookData);
	return response;
};
