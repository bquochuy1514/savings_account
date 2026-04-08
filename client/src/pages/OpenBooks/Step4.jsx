import { LuBookOpen, LuPlus, LuCircleCheck } from 'react-icons/lu';

export default function Step4({ result, customerData, savingsTypes, onReset }) {
	const { savingsBookResult, transactionResult } = result;

	const selectedType = savingsTypes.find(
		(t) => t.id === savingsBookResult.savingsTypeId,
	);

	const initials = customerData.fullName
		?.split(' ')
		.slice(-2)
		.map((w) => w[0])
		.join('')
		.toUpperCase();

	const formatDate = (dateStr) =>
		new Date(dateStr).toLocaleDateString('vi-VN');

	const formatMoney = (num) => num.toLocaleString('vi-VN') + 'đ';

	return (
		<div className="space-y-4">
			{/* Banner */}
			<div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 flex items-center gap-4">
				<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
					<LuCircleCheck size={22} className="text-green-600" />
				</div>
				<div className="flex-1">
					<p className="text-sm font-semibold text-green-700">
						Mở sổ tiết kiệm thành công!
					</p>
					<p className="text-xs text-green-500 mt-0.5">
						Giao dịch #{transactionResult.id} ·{' '}
						{formatDate(transactionResult.transactionDate)}
					</p>
				</div>
				<div className="text-right">
					<p className="text-xs text-green-500">Mã sổ</p>
					<p className="text-sm font-bold text-green-700">
						{savingsBookResult.bookCode}
					</p>
				</div>
			</div>

			{/* 3 cột ngang */}
			<div className="grid grid-cols-3 gap-4">
				{/* Thông tin sổ */}
				<div className="bg-white border border-gray-200 rounded-xl p-5">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
							<LuBookOpen size={14} />
						</div>
						<p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
							Thông tin sổ
						</p>
					</div>
					{[
						{ label: 'Mã sổ', value: savingsBookResult.bookCode },
						{
							label: 'Loại tiết kiệm',
							value: selectedType?.name ?? '—',
						},
						{
							label: 'Ngày mở',
							value: formatDate(savingsBookResult.openDate),
						},
						{
							label: 'Kỳ hạn',
							value:
								selectedType?.termMonths === 0
									? 'Không kỳ hạn'
									: `${selectedType?.termMonths} tháng`,
						},
						{
							label: 'Lãi suất',
							value: selectedType
								? `${selectedType.interestRate}% / năm`
								: '—',
						},
						{ label: 'Trạng thái', value: 'Đang hoạt động' },
					].map(({ label, value }) => (
						<div
							key={label}
							className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
						>
							<span className="text-xs text-gray-400">
								{label}
							</span>
							<span className="text-xs font-medium text-gray-800">
								{value}
							</span>
						</div>
					))}
				</div>

				{/* Khách hàng */}
				<div className="bg-white border border-gray-200 rounded-xl p-5">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
							{initials}
						</div>
						<p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
							Khách hàng
						</p>
					</div>
					{[
						{ label: 'Họ và tên', value: customerData.fullName },
						{ label: 'CMND/CCCD', value: customerData.idNumber },
						{ label: 'Địa chỉ', value: customerData.address },
					].map(({ label, value }) => (
						<div
							key={label}
							className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
						>
							<span className="text-xs text-gray-400">
								{label}
							</span>
							<span className="text-xs font-medium text-gray-800 text-right max-w-[60%]">
								{value}
							</span>
						</div>
					))}
				</div>

				{/* Giao dịch khởi tạo */}
				<div className="bg-white border border-gray-200 rounded-xl p-5">
					<p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
						Giao dịch khởi tạo
					</p>
					{[
						{ label: 'Mã GD', value: `#${transactionResult.id}` },
						{ label: 'Loại', value: 'Gởi ban đầu' },
						{
							label: 'Ngày',
							value: formatDate(
								transactionResult.transactionDate,
							),
						},
					].map(({ label, value }) => (
						<div
							key={label}
							className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
						>
							<span className="text-xs text-gray-400">
								{label}
							</span>
							<span className="text-xs font-medium text-gray-800">
								{value}
							</span>
						</div>
					))}
					<div className="mt-4 bg-blue-50 rounded-lg px-3 py-3 flex justify-between items-center">
						<span className="text-xs text-blue-400">
							Số tiền gởi
						</span>
						<span className="text-base font-bold text-blue-700">
							{formatMoney(transactionResult.amount)}
						</span>
					</div>
				</div>
			</div>

			{/* Action */}
			<div className="flex justify-center pt-1">
				<button
					onClick={onReset}
					className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
				>
					<LuPlus size={15} /> Mở sổ mới
				</button>
			</div>
		</div>
	);
}
