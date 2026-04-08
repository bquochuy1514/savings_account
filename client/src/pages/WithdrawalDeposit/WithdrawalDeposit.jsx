import { useState } from 'react';
// Import thêm LuRefreshCw để dùng icon cho nút Làm mới
import { LuArrowUpFromLine, LuRefreshCw } from 'react-icons/lu';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
// Đảm bảo đã import PageHeader
import PageHeader from '../../components/ui/PageHeader';

export default function WithdrawalDeposit() {
	const [formData, setFormData] = useState({
		customerId: '',
		savingsBookId: '',
		transactionDate: new Date().toISOString().split('T')[0],
		amount: '',
	});
	const [errors, setErrors] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Xóa lỗi khi người dùng bắt đầu nhập lại
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrors({});

		try {
			const payload = {
				customerId: Number(formData.customerId),
				savingsBookId: Number(formData.savingsBookId),
				transactionDate: new Date(
					formData.transactionDate,
				).toISOString(),
				amount: Number(formData.amount),
			};

			// Giả định endpoint theo logic thông thường của REST API và tên module trên server
			await api.post('/savings-book/withdraw', payload);

			toast.success('Rút tiền thành công!');

			// Reset form sau khi thành công
			setFormData({
				customerId: '',
				savingsBookId: '',
				transactionDate: new Date().toISOString().split('T')[0],
				amount: '',
			});
		} catch (error) {
			if (error.fieldErrors) {
				setErrors(error.fieldErrors);
			} else {
				toast.error(error.message || 'Có lỗi xảy ra khi rút tiền.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="p-6">
			{' '}
			{/* Container chính chỉ có padding, KHÔNG giới hạn max-w và mx-auto */}
			{/* PageHeader đồng nhất giao diện */}
			<PageHeader
				title="Phiếu Rút Tiền"
				subtitle="Thực hiện rút tiền từ sổ tiết kiệm"
			/>
			{/* Box Form đồng nhất với Box Table, thêm w-full để trải rộng, thêm shadow-sm để đồng bộ */}
			<div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6 mt-6 w-full shadow-sm">
				<form onSubmit={handleSubmit} className="space-y-5">
					{' '}
					{/* KHÔNG giới hạn max-w-4xl ở form để input trải rộng */}
					<div className="grid grid-cols-2 gap-5">
						<Input
							label="Mã Khách hàng (ID)"
							name="customerId"
							type="number"
							value={formData.customerId}
							onChange={handleChange}
							placeholder="VD: 1"
							error={errors.customerId}
							required
						/>
						<Input
							label="Mã Sổ tiết kiệm (ID)"
							name="savingsBookId"
							type="number"
							value={formData.savingsBookId}
							onChange={handleChange}
							placeholder="VD: 1"
							error={errors.savingsBookId}
							required
						/>
					</div>
					<div className="grid grid-cols-2 gap-5">
						<Input
							label="Số tiền rút (VNĐ)"
							name="amount"
							type="number"
							value={formData.amount}
							onChange={handleChange}
							placeholder="Nhập số tiền cần rút"
							error={errors.amount}
							required
						/>
						<Input
							label="Ngày giao dịch"
							name="transactionDate"
							type="date"
							value={formData.transactionDate}
							onChange={handleChange}
							error={errors.transactionDate}
							required
						/>
					</div>
					<div className="pt-4 flex justify-end gap-3 border-t mt-6 border-gray-100">
						{/* Nút Làm mới đồng bộ */}
						<button
							type="button"
							onClick={() => {
								// Logic reset giữ nguyên 100%
								setFormData({
									customerId: '',
									savingsBookId: '',
									transactionDate: new Date()
										.toISOString()
										.split('T')[0],
									amount: '',
								});
								setErrors({});
							}}
							className="flex items-center gap-1.5 px-3 py-2 cursor-pointer text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
						>
							<LuRefreshCw size={14} />
							Làm mới
						</button>

						<Button
							type="submit"
							isLoading={isLoading}
							icon={<LuArrowUpFromLine size={18} />}
							className="w-auto" // Đảm bảo nút Xác nhận không trải rộng quá mức
						>
							Xác nhận rút tiền
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
