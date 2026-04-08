import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
	LuFilePlus,
	LuArrowDownToLine,
	LuArrowUpFromLine,
	LuSearch,
	LuChartBar,
	LuSettings,
	LuLogIn,
	LuPiggyBank,
	LuLogOut,
	LuUsers,
} from 'react-icons/lu';
import { useAuth } from '../../contexts/UseAuth';
import { toast } from 'react-toastify';

const navItems = [
	{
		section: 'Nghiệp vụ',
		items: [
			{
				label: 'Tra cứu sổ',
				path: '/tra-cuu',
				icon: <LuSearch size={16} />,
			},
			{ label: 'Mở sổ', path: '/mo-so', icon: <LuFilePlus size={16} /> },
			{
				label: 'Gửi thêm tiền',
				path: '/gui-tien',
				icon: <LuArrowDownToLine size={16} />,
			},
			{
				label: 'Rút tiền',
				path: '/rut-tien',
				icon: <LuArrowUpFromLine size={16} />,
			},
		],
	},
	{
		section: 'Báo cáo',
		items: [
			{
				label: 'Báo cáo tháng',
				path: '/bao-cao',
				icon: <LuChartBar size={16} />,
			},
		],
	},
	{
		section: 'Cài đặt',
		items: [
			{
				label: 'Cài đặt quy định',
				path: '/quy-dinh',
				icon: <LuSettings size={16} />,
			},
		],
	},
];

const adminNavItems = [
	{
		section: 'Quản trị',
		items: [
			{
				label: 'Quản lý người dùng',
				path: '/quan-ly-nguoi-dung',
				icon: <LuUsers size={16} />,
			},
		],
	},
];

const ROLE_LABEL = {
	ADMIN: 'Quản trị viên',
	MANAGER: 'Quản lý',
	STAFF: 'Nhân viên',
};

export default function MainLayout() {
	const { user, isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path) => location.pathname === path;

	const handleLogout = async () => {
		const data = await logout();
		toast.success(data?.message || 'Đã đăng xuất.');
		navigate('/login');
	};

	const initials = user?.fullName
		? user.fullName
				.split(' ')
				.slice(-2)
				.map((w) => w[0])
				.join('')
				.toUpperCase()
		: '?';

	const renderNavGroup = (group) => (
		<div key={group.section} className="mb-4">
			<div className="text-[10px] uppercase tracking-widest text-gray-400 px-2 mb-1">
				{group.section}
			</div>
			{group.items.map((item) => (
				<button
					key={item.path}
					onClick={() => navigate(item.path)}
					className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-sm mb-0.5 transition-colors duration-150 text-left
						${
							isActive(item.path)
								? 'bg-blue-50 text-blue-700 font-medium'
								: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
						}`}
				>
					<span
						className={
							isActive(item.path)
								? 'text-blue-600'
								: 'text-gray-400'
						}
					>
						{item.icon}
					</span>
					{item.label}
				</button>
			))}
		</div>
	);

	return (
		<div className="flex h-screen bg-gray-50 font-sans">
			{/* Sidebar */}
			<aside className="w-52 flex flex-col bg-white border-r border-gray-200 flex-shrink-0">
				{/* Logo */}
				<div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200">
					<LuPiggyBank size={25} className="text-blue-600" />
					<div>
						<div className="text-sm font-semibold text-gray-800 leading-tight">
							Sổ tiết Kiệm
						</div>
						<div className="text-[10px] text-gray-400">
							Quản lý sổ tiết kiệm
						</div>
					</div>
				</div>

				{/* Nav */}
				<nav className="flex-1 overflow-y-auto py-3 px-2">
					{navItems.map(renderNavGroup)}
					{user?.role === 'ADMIN' &&
						adminNavItems.map(renderNavGroup)}
				</nav>

				{/* Bottom */}
				<div className="px-3 py-4 border-t border-gray-200">
					{isAuthenticated ? (
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2.5 px-1 py-1">
								<div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
									{initials}
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-xs font-medium text-gray-800 truncate">
										{user?.fullName}
									</div>
									<div className="text-[10px] text-gray-400">
										{ROLE_LABEL[user?.role] ?? user?.role}
									</div>
								</div>
							</div>
							<button
								onClick={handleLogout}
								className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors duration-150 cursor-pointer"
							>
								<LuLogOut size={14} />
								Đăng xuất
							</button>
						</div>
					) : (
						<button
							onClick={() => navigate('/login')}
							className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150 cursor-pointer"
						>
							<LuLogIn size={15} />
							Đăng nhập
						</button>
					)}
				</div>
			</aside>

			{/* Page content */}
			<main className="flex-1 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
}
