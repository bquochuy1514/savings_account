import { useState, useEffect } from 'react';
import { LuSettings, LuPlus, LuPencil } from 'react-icons/lu';
import { toast } from 'react-toastify';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import RegulationFormModal from './RegulationFormModal';

export default function RegulationsSettings() {
	const [savingsTypes, setSavingsTypes] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingType, setEditingType] = useState(null);

	const fetchSavingsTypes = async () => {
		setIsLoading(true);
		try {
			const res = await api.get('/savings-type');

			// Bọc thép dữ liệu: Chống lỗi trắng màn hình nếu API trả về sai cấu trúc
			const rawData = res.data?.data || res.data || res || [];
			const dataArray = Array.isArray(rawData) ? rawData : [];

			// Sắp xếp tự động: Không kỳ hạn lên đầu
			const sorted = [...dataArray].sort(
				(a, b) => (a.termMonths || 0) - (b.termMonths || 0),
			);
			setSavingsTypes(sorted);
		} catch (error) {
			console.error('Lỗi tải danh sách:', error);
			toast.error('Không thể tải danh sách quy định.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSavingsTypes();
	}, []);

	const handleEdit = (type) => {
		setEditingType(type);
		setIsModalOpen(true);
	};

	const handleAdd = () => {
		setEditingType(null);
		setIsModalOpen(true);
	};

	const handleSuccess = () => {
		setIsModalOpen(false);
		fetchSavingsTypes();
	};

	return (
		<div className="p-6 relative">
			{/* --- HEADER --- */}
			<div className="flex justify-between items-start mb-8">
				<PageHeader
					icon={LuSettings}
					title="Cài đặt Quy định"
					badge="Hệ thống"
					subtitle="Quản lý tham số và các loại sổ tiết kiệm hiện hành"
				/>
				<Button
					icon={<LuPlus size={18} />}
					onClick={handleAdd}
					className="shadow-md cursor-pointer"
				>
					Thêm quy định mới
				</Button>
			</div>

			{/* --- BODY --- */}
			{isLoading ? (
				<div className="flex flex-col justify-center items-center py-32 space-y-4">
					<div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
					<p className="text-gray-400 font-medium animate-pulse">
						Đang đồng bộ dữ liệu...
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{savingsTypes.length > 0 ? (
						savingsTypes.map((type) => (
							<div
								key={type.id}
								className="group bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col relative overflow-hidden"
							>
								<div
									className={`absolute top-0 left-0 w-full h-1.5 transition-colors ${type.isActive ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gray-300'}`}
								></div>

								<div className="flex justify-between items-start mb-5 mt-1">
									<div>
										<h3 className="text-xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors">
											{type.name}
										</h3>
										<p className="text-sm text-gray-500 mt-1 font-medium">
											{type.termMonths === 0
												? 'Không kỳ hạn'
												: `Kỳ hạn: ${type.termMonths} tháng`}
										</p>
									</div>
									<div className="flex flex-col items-end gap-2">
										<span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm ring-1 ring-blue-500/20 shadow-sm">
											{type.interestRate}% / năm
										</span>
										<span
											className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${type.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}
										>
											{type.isActive
												? 'Đang áp dụng'
												: 'Tạm ngưng'}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3 bg-gray-50/60 rounded-xl p-4 border border-gray-100 mb-5 flex-1">
									<div>
										<p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
											Mở sổ tối thiểu
										</p>
										<p className="font-semibold text-gray-800">
											{Number(
												type.minInitDeposit || 0,
											).toLocaleString('vi-VN')}{' '}
											đ
										</p>
									</div>
									<div>
										<p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
											Gửi thêm tối thiểu
										</p>
										<p className="font-semibold text-gray-800">
											{Number(
												type.minAddDeposit || 0,
											).toLocaleString('vi-VN')}{' '}
											đ
										</p>
									</div>
									<div className="col-span-2 pt-3 mt-1 border-t border-gray-200/60">
										<p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
											Quy định rút tiền
										</p>
										<p className="font-semibold text-gray-800">
											{type.termMonths === 0
												? `Yêu cầu giữ sổ tối thiểu ${type.minWithdrawDays || 0} ngày`
												: 'Chỉ được rút tiền khi đến ngày đáo hạn'}
										</p>
									</div>
								</div>

								<div className="mt-auto">
									<button
										onClick={() => handleEdit(type)}
										className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-colors cursor-pointer"
									>
										<LuPencil size={16} /> Chỉnh sửa cấu
										hình
									</button>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full bg-white border border-gray-200 border-dashed rounded-2xl p-16 text-center">
							<div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
								<LuSettings size={32} />
							</div>
							<h3 className="text-lg font-bold text-gray-800 mb-1">
								Chưa có quy định nào
							</h3>
							<p className="text-gray-500">
								Bấm vào nút "Thêm quy định mới" để khởi tạo dữ
								liệu.
							</p>
						</div>
					)}
				</div>
			)}

			<RegulationFormModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={handleSuccess}
				editingType={editingType}
			/>
		</div>
	);
}
