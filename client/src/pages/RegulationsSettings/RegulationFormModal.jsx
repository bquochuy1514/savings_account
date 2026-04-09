import { useState, useEffect, useMemo } from 'react';
import { LuX, LuSave, LuPercent, LuCalendarDays, LuCircleDollarSign, LuFileText, LuSettings2 } from 'react-icons/lu';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegulationFormModal({ isOpen, onClose, onSuccess, editingType }) {
  const [formData, setFormData] = useState({
    name: '',
    termMonths: '',
    interestRate: '',
    minWithdrawDays: '',
    minInitDeposit: '',
    minAddDeposit: '',
    isActive: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingType) {
        setFormData({
          name: editingType.name || '',
          termMonths: editingType.termMonths?.toString() || '',
          interestRate: editingType.interestRate?.toString() || '',
          minWithdrawDays: editingType.minWithdrawDays?.toString() || '',
          minInitDeposit: editingType.minInitDeposit?.toString() || '',
          minAddDeposit: editingType.minAddDeposit?.toString() || '',
          isActive: editingType.isActive ?? true
        });
      } else {
        setFormData({
          name: '',
          termMonths: '',
          interestRate: '',
          minWithdrawDays: '',
          minInitDeposit: '1000000', 
          minAddDeposit: '100000',  
          isActive: true
        });
      }
      setErrors({});
    }
  }, [isOpen, editingType]);

  const isFormValid = useMemo(() => {
    const required = [
      formData.name, 
      formData.termMonths, 
      formData.interestRate, 
      formData.minInitDeposit, 
      formData.minAddDeposit
    ];
    
    // Chỉ yêu cầu nhập số ngày rút tối thiểu nếu là Không kỳ hạn (term = 0)
    if (Number(formData.termMonths) === 0) {
      required.push(formData.minWithdrawDays);
    }
    
    return required.every(field => field != null && String(field).trim() !== '');
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const rawValue = String(value).replace(/\D/g, ''); 
    setFormData(prev => ({ ...prev, [name]: rawValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const term = Number(formData.termMonths);
      const withdrawDays = term === 0 ? Number(formData.minWithdrawDays) : 0;

      const payload = {
        name: String(formData.name).trim(),
        termMonths: term,
        interestRate: parseFloat(String(formData.interestRate).replace(',', '.')),
        minWithdrawDays: withdrawDays, 
        minInitDeposit: Number(formData.minInitDeposit),
        minAddDeposit: Number(formData.minAddDeposit),
        isActive: Boolean(formData.isActive)
      };

      if (editingType) {
        const typeId = editingType.id || editingType._id;
        await api.put(`/savings-type/${typeId}`, payload); 
        toast.success('Cập nhật cấu hình thành công!');
      } else {
        await api.post('/savings-type', payload);
        toast.success('Thêm loại cấu hình mới thành công!');
      }
      onSuccess();
    } catch (error) {
      console.error("❌ LỖI API:", error);
      
      if (error.fieldErrors) {
        setErrors(error.fieldErrors);
        const firstErrorMsg = Object.values(error.fieldErrors)[0];
        toast.error(`Lỗi dữ liệu: ${firstErrorMsg}`);
      } else if (error.message) {
        const msg = Array.isArray(error.message) ? error.message[0] : error.message;
        toast.error(`Lỗi: ${msg}`);
      } else {
        toast.error('Có lỗi xảy ra khi lưu quy định.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
           
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {editingType ? 'Chỉnh sửa Cấu hình' : 'Tạo mới Cấu hình'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Thiết lập các tham số cho loại sổ tiết kiệm</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 p-2 rounded-xl transition-colors cursor-pointer shadow-sm">
            <LuX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8">
            
            {/* Cột 1: Thông tin cơ bản */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Thông tin cơ bản</h3>
              
              <Input label={<>Tên loại tiết kiệm <span className="text-red-400">*</span></>} name="name" value={formData.name} onChange={handleChange} placeholder="VD: Không kỳ hạn, 3 tháng..." icon={<LuFileText size={16} />} error={errors.name} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" label={<>Kỳ hạn (tháng) <span className="text-red-400">*</span></>} name="termMonths" value={formData.termMonths} onChange={handleChange} placeholder="0 = KKH" icon={<LuCalendarDays size={16} />} error={errors.termMonths} />
                <Input type="number" step="0.01" label={<>Lãi suất (%) <span className="text-red-400">*</span></>} name="interestRate" value={formData.interestRate} onChange={handleChange} placeholder="VD: 5.5" icon={<LuPercent size={16} />} error={errors.interestRate} />
              </div>
            </div>

            {/* Cột 2: Quy định dòng tiền */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Hạn mức & Rút tiền</h3>
              
              <Input label={<>Mở sổ tối thiểu (VNĐ) <span className="text-red-400">*</span></>} name="minInitDeposit" value={formData.minInitDeposit ? Number(formData.minInitDeposit).toLocaleString('vi-VN') : ''} onChange={handleCurrencyChange} placeholder="VD: 1.000.000" icon={<LuCircleDollarSign size={16} />} error={errors.minInitDeposit} />
              <Input label={<>Gửi thêm tối thiểu (VNĐ) <span className="text-red-400">*</span></>} name="minAddDeposit" value={formData.minAddDeposit ? Number(formData.minAddDeposit).toLocaleString('vi-VN') : ''} onChange={handleCurrencyChange} placeholder="VD: 100.000" icon={<LuCircleDollarSign size={16} />} error={errors.minAddDeposit} />
              
              <Input 
                type="number" 
                label={<>Số ngày gửi tối thiểu để rút {Number(formData.termMonths) === 0 && <span className="text-red-400">*</span>}</>} 
                name="minWithdrawDays" 
                value={Number(formData.termMonths) === 0 ? formData.minWithdrawDays : 0} 
                onChange={handleChange} 
                placeholder="VD: 15" 
                icon={<LuCalendarDays size={16} />} 
                error={errors.minWithdrawDays} 
                disabled={Number(formData.termMonths) !== 0}
              />
            </div>
            
            {/* Trạng thái */}
            <div className="col-span-full pt-4 mt-2 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl">
              <div>
                <p className="font-semibold text-gray-800">Trạng thái hoạt động</p>
                <p className="text-xs text-gray-500 mt-0.5">Xác định xem khách hàng có thể mở loại sổ này không.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className={`ml-3 text-sm font-bold ${formData.isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {formData.isActive ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                </span>
              </label>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Button variant="secondary" type="button" onClick={onClose} className="px-6 rounded-xl cursor-pointer">
              Hủy bỏ
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!isFormValid} icon={<LuSave size={18} />} className="px-8 rounded-xl shadow-md cursor-pointer">
              {editingType ? 'Cập nhật cấu hình' : 'Khởi tạo cấu hình'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}