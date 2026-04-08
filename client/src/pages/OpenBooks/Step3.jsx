import { LuBookOpen, LuCheck, LuChevronLeft } from 'react-icons/lu';

const InfoRow = ({ label, value, highlight }) => (
	<div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
		<span className="text-sm text-gray-500">{label}</span>
		<span
			className={`text-sm font-medium ${highlight ? 'text-blue-600' : 'text-gray-800'}`}
		>
			{value}
		</span>
	</div>
);

export default function Step3({
	customerData,
	bookData,
	onBack,
	onSubmit,
	loading,
	savingsTypes,
}) {
	const selectedType = savingsTypes.find(
		(t) => t.id === bookData.savingsTypeId,
	);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="bg-white border border-gray-200 rounded-xl p-5">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
							{customerData.fullName
								?.split(' ')
								.slice(-2)
								.map((w) => w[0])
								.join('')
								.toUpperCase()}
						</div>
						<p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
							Khách hàng
						</p>
					</div>
					<InfoRow label="Họ và tên" value={customerData.fullName} />
					<InfoRow label="CMND/CCCD" value={customerData.idNumber} />
					<InfoRow label="Địa chỉ" value={customerData.address} />
				</div>

				<div className="bg-white border border-gray-200 rounded-xl p-5">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
							<LuBookOpen size={14} />
						</div>
						<p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
							Sổ tiết kiệm
						</p>
					</div>
					<InfoRow
						label="Loại tiết kiệm"
						value={selectedType?.name}
					/>
					<InfoRow
						label="Lãi suất"
						value={`${selectedType.interestRate}% / năm`}
					/>
					<InfoRow
						label="Ngày mở"
						value={new Date(bookData.openDate).toLocaleDateString(
							'vi-VN',
						)}
					/>
				</div>
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
				<p className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-4">
					Tóm tắt
				</p>
				<div className="grid grid-cols-3 gap-4 text-center">
					<div>
						<p className="text-xs text-blue-400 mb-1">
							Số tiền gởi
						</p>
						<p className="text-base font-semibold text-blue-700">
							{parseInt(bookData.amountRaw).toLocaleString(
								'vi-VN',
							)}
							đ
						</p>
					</div>
					<div>
						<p className="text-xs text-blue-400 mb-1">Lãi suất</p>
						<p className="text-base font-semibold text-blue-700">
							{selectedType?.interestRate}% / năm
						</p>
					</div>
					<div>
						<p className="text-xs text-blue-400 mb-1">
							Loại kỳ hạn
						</p>
						<p className="text-base font-semibold text-blue-700">
							{selectedType?.termMonths === 0
								? 'Không kỳ hạn'
								: `${selectedType?.termMonths} tháng`}
						</p>
					</div>
				</div>
			</div>

			<div className="flex justify-between">
				<button
					onClick={onBack}
					className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
				>
					<LuChevronLeft size={14} /> Quay lại
				</button>
				<button
					onClick={onSubmit}
					disabled={loading}
					className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
				>
					{loading ? (
						'Đang xử lý...'
					) : (
						<>
							<LuCheck size={14} /> Xác nhận mở sổ
						</>
					)}
				</button>
			</div>
		</div>
	);
}
