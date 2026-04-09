import { useState } from 'react';
import { LuX, LuUserPlus } from 'react-icons/lu';
import Input from '../../components/ui/Input';
import { registerService } from '../../services/auth';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

export default function CreateUserModal({ onClose, fetchUsers }) {
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { fullName, email, password, confirmPassword } = form;
        try {
            setLoading(true);
            setError('');
            setFieldErrors({});
            const response = await registerService(
                fullName,
                email,
                password,
                confirmPassword,
            );
            toast.success(response.message || 'Đăng ký thành công!');
            setForm({
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
            fetchUsers();
        } catch (err) {
            if (err.fieldErrors) {
                setFieldErrors(err.fieldErrors);
            } else {
                setError(err.message || 'Đăng nhập thất bại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 transition-opacity">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                Tạo tài khoản mới
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Cấp quyền truy cập hệ thống cho nhân viên
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 p-2 rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                        <LuX size={20} />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-5 mb-8">
                        <Input
                            label={<>Họ và tên <span className="text-red-400">*</span></>}
                            value={form.fullName}
                            name="fullName"
                            onChange={handleChange}
                            placeholder="VD: Nguyễn Văn A"
                            error={fieldErrors.fullName}
                        />

                        <Input
                            label={<>Địa chỉ Email <span className="text-red-400">*</span></>}
                            value={form.email}
                            name="email"
                            onChange={handleChange}
                            placeholder="example@sotietkiem.com"
                            error={fieldErrors.email}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Input
                                label={<>Mật khẩu <span className="text-red-400">*</span></>}
                                type="password"
                                value={form.password}
                                name="password"
                                onChange={handleChange}
                                placeholder="••••••••"
                                error={fieldErrors.password}
                                showTogglePassword
                            />

                            <Input
                                label={<>Xác nhận mật khẩu <span className="text-red-400">*</span></>}
                                type="password"
                                value={form.confirmPassword}
                                name="confirmPassword"
                                onChange={handleChange}
                                placeholder="••••••••"
                                error={fieldErrors.confirmPassword}
                                showTogglePassword
                            />
                        </div>

                        {/* Thông báo lỗi tổng quát */}
                        {error && (
                            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600 animate-in fade-in">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button 
                            onClick={onClose} 
                            variant="secondary" 
                            type="button"
                            className="px-6 rounded-xl cursor-pointer"
                        >
                            Hủy bỏ
                        </Button>
                        <Button 
                            type="submit" 
                            isLoading={loading}
                            className="px-8 rounded-xl shadow-md cursor-pointer"
                        >
                            Tạo tài khoản
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}