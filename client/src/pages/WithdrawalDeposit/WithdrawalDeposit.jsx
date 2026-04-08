import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LuArrowUpFromLine, 
  LuUser, 
  LuBookOpen, 
  LuCircleDollarSign, 
  LuCalendarDays
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersRes, booksRes] = await Promise.all([
          getAllCustomer(),
          getSavingsBooks()
        ]);
        setCustomers(customersRes.data || customersRes || []);
        setSavingsBooks(booksRes.data || booksRes || []);
      } catch {
        toast.error('Không thể tải dữ liệu khách hàng hoặc sổ tiết kiệm.');
      }
    };
    fetchInitialData();
  }, []);

  const filteredCustomers = useMemo(() => {
    const activeCustomerIds = new Set(
      savingsBooks.filter(book => book.status !== 'CLOSED').map(book => book.customerId)
    );
    let availableCustomers = customers.filter(c => activeCustomerIds.has(c.id));
    if (customerSearch) {
      const lower = customerSearch.toLowerCase();
      availableCustomers = availableCustomers.filter(c => 
        c.fullName?.toLowerCase().includes(lower) || c.idNumber?.includes(lower)
      );
    }
    return availableCustomers;
  }, [customerSearch, customers, savingsBooks]);

  const filteredBooks = useMemo(() => {
    if (!selectedCustomer) return [];
    return savingsBooks.filter(b => b.customerId === selectedCustomer.id && b.status !== 'CLOSED');
  }, [selectedCustomer, savingsBooks]);

  const handleCustomerSearchChange = (e) => {
    setCustomerSearch(e.target.value);
    setShowCustomerDropdown(true);
    if (selectedCustomer) {
      setSelectedCustomer(null);
      setSelectedBook(null);
      setFormData(prev => ({ ...prev, customerId: '', savingsBookId: '', amount: '' }));
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(`${customer.idNumber} - ${customer.fullName}`);
    setShowCustomerDropdown(false);
    setFormData(prev => ({ ...prev, customerId: customer.id, savingsBookId: '', amount: '' }));
    setSelectedBook(null);
    setErrors({});
  };

  const handleBookChange = (e) => {
    const bookId = Number(e.target.value);
    const book = filteredBooks.find(b => b.id === bookId);
    setSelectedBook(book);
    
    if (book) {
      setFormData(prev => ({
        ...prev,
        savingsBookId: bookId,
        amount: (book.savingsType?.termMonths || 0) > 0 ? book.balance : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, savingsBookId: '', amount: '' }));
    }
    if (errors.savingsBookId || errors.amount) setErrors({});
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, amount: rawValue }));
    if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
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

  const isTermDeposit = selectedBook && (selectedBook.savingsType?.termMonths || 0) > 0;

  const isFormValid = useMemo(() => {
    if (!formData.customerId || !formData.savingsBookId || !formData.transactionDate) return false;
    if (!isTermDeposit && (!formData.amount || Number(formData.amount) <= 0)) return false;
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
        transactionDate: new Date(formData.transactionDate).toISOString(),
      };

      if (!isTermDeposit) {
        payload.amount = Number(formData.amount);
      }

      const response = await api.post('/savings-book/withdraw', payload);
      const rawResponse = response.data ? response.data : response;
      const actualReceiptData = rawResponse.data ? rawResponse.data : rawResponse;

      if (actualReceiptData && actualReceiptData.transactionResult) {
        setReceiptData({
          ...actualReceiptData,
          customerSnapshot: {
            fullName: selectedCustomer?.fullName,
            idNumber: selectedCustomer?.idNumber,
            termName: selectedBook?.savingsType?.termMonths === 0 ? 'Không kỳ hạn' : `${selectedBook?.savingsType?.termMonths} tháng`
          }
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
      } else if (error.response && error.response.data && error.response.data.message) {
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
          
          {/* --- SECTION 1 --- */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <LuUser size={14} />
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Thông tin tra cứu</p>
            </div>
            
            <div className="grid grid-cols-2 gap-5 pl-1">
              {/* Dùng onFocusCapture để bắt sự kiện focus cho dropdown mà không cần sửa component Input */}
              <div className="relative" ref={dropdownRef} onFocusCapture={() => setShowCustomerDropdown(true)}>
                <Input
                  label={<>Khách hàng (Tên hoặc CCCD) <span className="text-red-400">*</span></>}
                  name="customerSearch"
                  value={customerSearch}
                  onChange={handleCustomerSearchChange}
                  placeholder="Tìm kiếm theo Tên hoặc số CCCD..."
                  icon={<LuUser size={16} />}
                  error={errors.customerId}
                />
                
                {showCustomerDropdown && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto py-1">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(c => (
                        <li key={c.id} onClick={() => handleSelectCustomer(c)} className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0">
                          <span className="font-medium text-gray-800">{c.fullName}</span>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{c.idNumber}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-sm text-gray-500 text-center">Không tìm thấy khách hàng.</li>
                    )}
                  </ul>
                )}
              </div>

              {/* Select Sổ tiết kiệm vẫn giữ nguyên vì Component Input của bạn không hỗ trợ thẻ <select> */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Mã Sổ tiết kiệm <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LuBookOpen size={16} /></span>
                  <select
                    value={formData.savingsBookId}
                    onChange={handleBookChange}
                    disabled={!selectedCustomer}
                    className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-8 appearance-none ${!selectedCustomer ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800'} ${errors.savingsBookId ? 'border-red-300' : ''}`}
                    required
                  >
                    <option value="" disabled>-- Chọn sổ tiết kiệm --</option>
                    {filteredBooks.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bookCode} (Kỳ hạn {b.savingsType?.termMonths === 0 ? 'Không' : `${b.savingsType?.termMonths} tháng`} - Dư: {Number(b.balance).toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* --- SECTION 2 --- */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <LuCircleDollarSign size={14} />
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chi tiết giao dịch</p>
            </div>

            <div className="grid grid-cols-2 gap-5 pl-1">
              <div>
                {/* Áp dụng pointer-events-none và opacity để mô phỏng trạng thái disabled */}
                <Input
                  label={<>Số tiền rút (VNĐ) <span className="text-red-400">*</span></>}
                  name="amount"
                  value={formData.amount ? Number(formData.amount).toLocaleString('vi-VN') : ''}
                  onChange={handleAmountChange}
                  placeholder="VD: 1.000.000"
                  icon={<LuCircleDollarSign size={16} />}
                  error={errors.amount}
                  className={(!selectedBook || isTermDeposit) ? 'opacity-60 pointer-events-none' : ''}
                />
                {isTermDeposit && (
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-xs text-orange-600 font-medium">* Sổ có kỳ hạn yêu cầu rút toàn bộ (Tất toán sổ)</p>
                  </div>
                )}
              </div>

              <div>
                 <Input
                  type="date"
                  label={<>Ngày giao dịch <span className="text-red-400">*</span></>}
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData(prev => ({...prev, transactionDate: e.target.value}))}
                  icon={<LuCalendarDays size={16} />}
                  error={errors.transactionDate}
                  className={!selectedBook ? 'opacity-60 pointer-events-none' : ''}
                />
              </div>
            </div>
          </div>

          <div className="pt-5 flex justify-end gap-3 border-t border-gray-100">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              disabled={!isFormValid} 
              icon={<LuArrowUpFromLine size={16} />}
            >
              Xác nhận rút tiền
            </Button>
          </div>
        </form>
      </div>

      {/* Gọi Modal Component ở đây */}
      <WithdrawalReceiptModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        receiptData={receiptData} 
      />

    </div>
  );
}

// test commit new