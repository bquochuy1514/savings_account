import { useState, useMemo, useRef, useEffect } from 'react';
import {
	LuArrowUpFromLine,
	LuUser,
	LuBookOpen,
	LuCircleDollarSign,
	LuCalendarDays,
	LuCheck,
	LuPrinter,
	LuX,
	LuReceipt,
} from 'react-icons/lu';
import { toast } from 'react-toastify';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import WithdrawalReceiptModal from './WithdrawalReceiptModal'; // Import Component Modal vừa tách
import { getAllCustomer } from '../../services/customer.js';
import { getSavingsBooks } from '../../services/savings-book.js';

export default function WithdrawalDeposit() {
	const [formData, setFormData] = useState({
		customerId: '',
		savingsBookId: '',
		transactionDate: new Date().toISOString().split('T')[0],
		amount: '',
	});

	const [errors, setErrors] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	const [customerSearch, setCustomerSearch] = useState('');
	const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [selectedBook, setSelectedBook] = useState(null);
	const [customers, setCustomers] = useState([]);
	const [savingsBooks, setSavingsBooks] = useState([]);
	const dropdownRef = useRef(null);

	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [receiptData, setReceiptData] = useState(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setShowCustomerDropdown(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [customersRes, booksRes] = await Promise.all([
					getAllCustomer(),
					getSavingsBooks(),
				]);
				setCustomers(customersRes.data || customersRes || []);
				setSavingsBooks(booksRes.data || booksRes || []);
			} catch {
				toast.error(
					'Không thể tải dữ liệu khách hàng hoặc sổ tiết kiệm.',
				);
			}
		};
		fetchInitialData();
	}, []);

	const filteredCustomers = useMemo(() => {
		const activeCustomerIds = new Set(
			savingsBooks
				.filter((book) => book.status !== 'CLOSED')
				.map((book) => book.customerId),
		);
		let availableCustomers = customers.filter((c) =>
			activeCustomerIds.has(c.id),
		);
		if (customerSearch) {
			const lower = customerSearch.toLowerCase();
			availableCustomers = availableCustomers.filter(
				(c) =>
					c.fullName?.toLowerCase().includes(lower) ||
					c.idNumber?.includes(lower),
			);
		}
		return availableCustomers;
	}, [customerSearch, customers, savingsBooks]);

	const filteredBooks = useMemo(() => {
		if (!selectedCustomer) return [];
		return savingsBooks.filter(
			(b) =>
				b.customerId === selectedCustomer.id && b.status !== 'CLOSED',
		);
	}, [selectedCustomer, savingsBooks]);

	const handleCustomerSearchChange = (e) => {
		setCustomerSearch(e.target.value);
		setShowCustomerDropdown(true);
		if (selectedCustomer) {
			setSelectedCustomer(null);
			setSelectedBook(null);
			setFormData((prev) => ({
				...prev,
				customerId: '',
				savingsBookId: '',
				amount: '',
			}));
		}
	};

	const handleSelectCustomer = (customer) => {
		setSelectedCustomer(customer);
		setCustomerSearch(`${customer.idNumber} - ${customer.fullName}`);
		setShowCustomerDropdown(false);
		setFormData((prev) => ({
			...prev,
			customerId: customer.id,
			savingsBookId: '',
			amount: '',
		}));
		setSelectedBook(null);
		setErrors({});
	};

	const handleBookChange = (e) => {
		const bookId = Number(e.target.value);
		const book = filteredBooks.find((b) => b.id === bookId);
		setSelectedBook(book);

		if (book) {
			setFormData((prev) => ({
				...prev,
				savingsBookId: bookId,
				amount:
					(book.savingsType?.termMonths || 0) > 0 ? book.balance : '',
			}));
		} else {
			setFormData((prev) => ({ ...prev, savingsBookId: '', amount: '' }));
		}
		if (errors.savingsBookId || errors.amount) setErrors({});
	};

	const handleAmountChange = (e) => {
		const rawValue = e.target.value.replace(/\D/g, '');
		setFormData((prev) => ({ ...prev, amount: rawValue }));
		if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
	};

	const handleReset = () => {
		setFormData({
			customerId: '',
			savingsBookId: '',
			transactionDate: new Date().toISOString().split('T')[0],
			amount: '',
		});
		setCustomerSearch('');
		setSelectedCustomer(null);
		setSelectedBook(null);
		setErrors({});
	};

	const isTermDeposit =
		selectedBook && (selectedBook.savingsType?.termMonths || 0) > 0;

	const isFormValid = useMemo(() => {
		if (
			!formData.customerId ||
			!formData.savingsBookId ||
			!formData.transactionDate
		)
			return false;
		if (
			!isTermDeposit &&
			(!formData.amount || Number(formData.amount) <= 0)
		)
			return false;
		return true;
	}, [formData, isTermDeposit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isFormValid) return;
		setIsLoading(true);
		setErrors({});

		try {
			const payload = {
				customerId: Number(formData.customerId),
				savingsBookId: Number(formData.savingsBookId),
				transactionDate: new Date(
					formData.transactionDate,
				).toISOString(),
			};

			if (!isTermDeposit) {
				payload.amount = Number(formData.amount);
			}

			const response = await api.post('/savings-book/withdraw', payload);
			const rawResponse = response.data ? response.data : response;
			const actualReceiptData = rawResponse.data
				? rawResponse.data
				: rawResponse;

			if (actualReceiptData && actualReceiptData.transactionResult) {
				setReceiptData({
					...actualReceiptData,
					customerSnapshot: {
						fullName: selectedCustomer?.fullName,
						idNumber: selectedCustomer?.idNumber,
						termName:
							selectedBook?.savingsType?.termMonths === 0
								? 'Không kỳ hạn'
								: `${selectedBook?.savingsType?.termMonths} tháng`,
					},
				});
				setShowSuccessModal(true);
			} else {
				toast.success('Rút tiền thành công!');
			}

			handleReset();
			const booksRes = await getSavingsBooks();
			setSavingsBooks(booksRes.data || booksRes || []);
		} catch (error) {
			if (error.fieldErrors) {
				setErrors(error.fieldErrors);
			} else if (
				error.response &&
				error.response.data &&
				error.response.data.message
			) {
				toast.error(error.response.data.message);
			} else {
				toast.error(error.message || 'Có lỗi xảy ra khi rút tiền.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="p-6 relative">
			<PageHeader
				icon={LuArrowUpFromLine}
				title="Phiếu Rút Tiền"
				badge="BM3"
				subtitle="Thực hiện rút tiền từ sổ tiết kiệm"
			/>

			<div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6 mt-6 w-full shadow-sm">
				<form onSubmit={handleSubmit}>
					<div className="mb-8">
						<div className="flex items-center gap-2 mb-5">
							<div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
								<LuUser size={14} />
							</div>
							<p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
								Thông tin tra cứu
							</p>
						</div>

						<div className="grid grid-cols-2 gap-5 pl-1">
							<div className="relative" ref={dropdownRef}>
								<label className="block text-xs font-medium text-gray-600 mb-1.5">
									Khách hàng (Tên hoặc CCCD){' '}
									<span className="text-red-400">*</span>
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
										<LuUser size={16} />
									</span>
									<input
										type="text"
										value={customerSearch}
										onChange={handleCustomerSearchChange}
										onFocus={() =>
											setShowCustomerDropdown(true)
										}
										placeholder="Tìm kiếm theo Tên hoặc số CCCD..."
										className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors.customerId ? 'border-red-300' : 'border-gray-200'}`}
										required
									/>
								</div>
								{showCustomerDropdown && (
									<ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto py-1">
										{filteredCustomers.length > 0 ? (
											filteredCustomers.map((c) => (
												<li
													key={c.id}
													onClick={() =>
														handleSelectCustomer(c)
													}
													className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0"
												>
													<span className="font-medium text-gray-800">
														{c.fullName}
													</span>
													<span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
														{c.idNumber}
													</span>
												</li>
											))
										) : (
											<li className="px-4 py-3 text-sm text-gray-500 text-center">
												Không tìm thấy khách hàng.
											</li>
										)}
									</ul>
								)}
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1.5">
									Mã Sổ tiết kiệm{' '}
									<span className="text-red-400">*</span>
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
										<LuBookOpen size={16} />
									</span>
									<select
										value={formData.savingsBookId}
										onChange={handleBookChange}
										disabled={!selectedCustomer}
										className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-8 appearance-none ${!selectedCustomer ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800'} ${errors.savingsBookId ? 'border-red-300' : ''}`}
										required
									>
										<option value="" disabled>
											-- Chọn sổ tiết kiệm --
										</option>
										{filteredBooks.map((b) => (
											<option key={b.id} value={b.id}>
												{b.bookCode} (Kỳ hạn{' '}
												{b.savingsType?.termMonths === 0
													? 'Không'
													: `${b.savingsType?.termMonths} tháng`}{' '}
												- Dư:{' '}
												{Number(
													b.balance,
												).toLocaleString('vi-VN')}
												đ)
											</option>
										))}
									</select>
									<span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19 9l-7 7-7-7"
											></path>
										</svg>
									</span>
								</div>
							</div>
						</div>
					</div>

					<hr className="border-gray-100 mb-8" />

					<div className="mb-8">
						<div className="flex items-center gap-2 mb-5">
							<div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
								<LuCircleDollarSign size={14} />
							</div>
							<p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
								Chi tiết giao dịch
							</p>
						</div>

						<div className="grid grid-cols-2 gap-5 pl-1">
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1.5">
									Số tiền rút (VNĐ){' '}
									<span className="text-red-400">*</span>
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
										<LuCircleDollarSign size={16} />
									</span>
									<input
										type="text"
										name="amount"
										value={
											formData.amount
												? Number(
														formData.amount,
													).toLocaleString('vi-VN')
												: ''
										}
										onChange={handleAmountChange}
										disabled={
											!selectedBook || isTermDeposit
										}
										placeholder="VD: 1.000.000"
										className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3 ${!selectedBook || isTermDeposit ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-semibold' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-semibold'} ${errors.amount ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}`}
										required
									/>
								</div>
								{isTermDeposit && (
									<div className="mt-2.5 space-y-1.5">
										<p className="text-xs text-orange-600 font-medium">
											* Sổ có kỳ hạn yêu cầu rút toàn bộ
											(Tất toán sổ)
										</p>
									</div>
								)}
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1.5">
									Ngày giao dịch{' '}
									<span className="text-red-400">*</span>
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
										<LuCalendarDays size={16} />
									</span>
									<input
										type="date"
										name="transactionDate"
										value={formData.transactionDate}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												transactionDate: e.target.value,
											}))
										}
										disabled={!selectedBook}
										className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3 ${!selectedBook ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400'} ${errors.transactionDate ? 'border-red-300' : ''}`}
										required
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="pt-5 flex justify-end gap-3 border-t border-gray-100">
						<Button
							type="submit"
							isLoading={isLoading}
							disabled={!isFormValid || isLoading}
							icon={<LuArrowUpFromLine size={16} />}
							className={`w-auto px-6 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							Xác nhận rút tiền
						</Button>
					</div>
				</form>
			</div>

			{showSuccessModal && receiptData && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
						<div className="bg-green-50 px-6 py-6 text-center border-b border-green-100 relative">
							<div className="absolute top-6 right-6 text-green-200 opacity-50">
								<LuReceipt size={48} />
							</div>
							<div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm relative z-10">
								<LuCheck size={28} />
							</div>
							<h2 className="text-xl font-bold text-gray-800 relative z-10">
								Giao dịch thành công!
							</h2>
							<p className="text-sm text-gray-500 mt-1 relative z-10">
								Biên lai rút tiền tiết kiệm • #
								{receiptData?.transactionResult?.id || 'N/A'}
							</p>
						</div>

						<div className="p-6 space-y-6">
							<div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
								<h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
									Thông tin định danh
								</h3>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-500">
										Khách hàng
									</span>
									<span className="font-semibold text-gray-800">
										{receiptData?.customerSnapshot
											?.fullName || 'N/A'}
									</span>
								</div>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-500">
										CMND / CCCD
									</span>
									<span className="font-mono text-gray-800">
										{receiptData?.customerSnapshot
											?.idNumber || 'N/A'}
									</span>
								</div>
								<div className="h-px bg-gray-200 w-full my-2"></div>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-500">
										Mã sổ tiết kiệm
									</span>
									<span className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
										{receiptData?.savingsBookResult
											?.bookCode || 'N/A'}
									</span>
								</div>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-500">
										Loại kỳ hạn
									</span>
									<span className="font-medium text-gray-800">
										{receiptData?.customerSnapshot
											?.termName || 'N/A'}
									</span>
								</div>
							</div>

							<div className="space-y-3 px-2">
								<h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
									Chi tiết giao dịch
								</h3>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-500">
										Ngày giao dịch
									</span>
									<span className="font-medium text-gray-800">
										{/* ĐÃ SỬA: Chỉ hiển thị ngày, không hiển thị giờ */}
										{receiptData?.transactionResult
											?.transactionDate
											? new Date(
													receiptData
														.transactionResult
														.transactionDate,
												).toLocaleDateString('vi-VN')
											: 'N/A'}
									</span>
								</div>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-500">
										Số tiền gốc rút
									</span>
									<span className="font-medium text-gray-800">
										{Math.round(
											receiptData?.transactionResult
												?.amount || 0,
										).toLocaleString('vi-VN')}{' '}
										đ
									</span>
								</div>
								<div className="flex justify-between items-center text-sm">
									<span className="text-gray-500">
										Tiền lãi nhận được
									</span>
									<span className="font-medium text-green-600">
										+{' '}
										{Math.round(
											receiptData?.transactionResult
												?.interest || 0,
										).toLocaleString('vi-VN')}{' '}
										đ
									</span>
								</div>
							</div>

							<div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
								<span className="font-semibold text-blue-800">
									Tổng tiền nhận
								</span>
								<span className="text-2xl font-bold text-blue-700">
									{Math.round(
										(receiptData?.transactionResult
											?.amount || 0) +
											(receiptData?.transactionResult
												?.interest || 0),
									).toLocaleString('vi-VN')}{' '}
									đ
								</span>
							</div>
						</div>

						<div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
							<button
								onClick={() =>
									toast.info('Đang gửi lệnh đến máy in...')
								}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
							>
								<LuPrinter size={18} /> In biên lai
							</button>
							<button
								onClick={() => setShowSuccessModal(false)}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
							>
								<LuX size={18} /> Đóng
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
