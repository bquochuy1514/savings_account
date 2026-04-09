import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

/**
 * Input Component - Tái sử dụng linh hoạt
 *
 * Props:
 * @param {React.ReactNode}  label             - Nhãn hiển thị phía trên input (chấp nhận string hoặc JSX)
 * @param {string}           name              - Tên field (dùng cho handleChange)
 * @param {string}           value             - Giá trị hiện tại
 * @param {function}         onChange          - Hàm xử lý thay đổi
 * @param {string}           placeholder       - Placeholder text
 * @param {'text'|'password'|'email'|'number'} type - Kiểu input (mặc định 'text')
 * @param {string}           error             - Thông báo lỗi (nếu có)
 * @param {React.ReactNode}  icon              - Icon hiển thị bên trái bên trong input
 * @param {boolean}          showTogglePassword - Tự động thêm nút hiện/ẩn mật khẩu khi type='password'
 * @param {string}           autoComplete      - Giá trị autocomplete
 * @param {string}           className         - Class tuỳ chỉnh thêm cho thẻ input
 * @param {boolean}          disabled          - Trạng thái vô hiệu hóa input
 * @param {object}           rest              - Các props khác (nếu có)
 */

function Input({
	label,
	name,
	value,
	onChange,
	placeholder,
	type = 'text',
	error,
	icon,
	showTogglePassword = false,
	className = '',
	disabled = false,
	...rest
}) {
	const [visible, setVisible] = useState(false);

	const resolvedType = showTogglePassword
		? visible
			? 'text'
			: 'password'
		: type;

	return (
		<div className={`${className}`}>
			{label && (
				<label className="block text-xs font-medium text-gray-600 mb-1.5">
					{label}
				</label>
			)}

			<div className="relative">
				{icon && (
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
						{icon}
					</span>
				)}

				<input
					type={resolvedType}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					disabled={disabled}
					className={`
						w-full py-2.5 text-sm border border-gray-200 rounded-lg
						bg-gray-50 focus:bg-white focus:outline-none
						focus:ring-2 focus:ring-blue-100 focus:border-blue-400
						transition-colors placeholder:text-gray-300
						${icon ? 'pl-9' : 'pl-3'}
						${showTogglePassword ? 'pr-9' : 'pr-3'}
						${error ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}
						${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
					`}
					{...rest}
				/>

				{showTogglePassword && (
					<button
						type="button"
						onClick={() => setVisible((p) => !p)}
						tabIndex={-1}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
					>
						{visible ? <LuEyeOff size={15} /> : <LuEye size={15} />}
					</button>
				)}
			</div>

			{error && <p className="text-xs text-red-500 mt-1">{error}</p>}
		</div>
	);
}

export default Input;
