import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LuArrowUpFromLine, 
  LuRefreshCw, 
  LuUser, 
  LuBookOpen, 
  LuCircleDollarSign, 
  LuCalendarDays 
} from 'react-icons/lu';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
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

  // --- STATE CHO LUỒNG UX MỚI ---
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [savingsBooks, setSavingsBooks] = useState([]);

  const dropdownRef = useRef(null);

  // Xử lý click ra ngoài để đóng dropdown khách hàng
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gọi API lấy dữ liệu thực tế thay cho Mock
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersRes, booksRes] = await Promise.all([
          getAllCustomer(),
          getSavingsBooks()
        ]);
        setCustomers(customersRes.data || customersRes || []);
        setSavingsBooks(booksRes.data || booksRes || []);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        toast.error('Không thể tải dữ liệu khách hàng hoặc sổ tiết kiệm.');
      }
    };
    fetchInitialData();
  }, []);

  // YÊU CẦU 1: Lọc danh sách khách hàng (Chỉ lấy người ĐÃ CÓ SỔ ĐANG HOẠT ĐỘNG và search theo text)
  const filteredCustomers = useMemo(() => {
    // Bước 1: Trích xuất ra một danh sách (Set) các ID khách hàng đang có ít nhất 1 sổ chưa đóng
    const activeCustomerIds = new Set(
      savingsBooks
        .filter(book => book.status !== 'CLOSED') // Lọc bỏ các sổ đã đóng
        .map(book => book.customerId)
    );

    // Bước 2: Lọc danh sách khách hàng gốc, chỉ giữ lại ai có ID nằm trong Set ở trên
    let availableCustomers = customers.filter(c => activeCustomerIds.has(c.id));

    // Bước 3: Áp dụng thanh tìm kiếm (nếu người dùng có gõ chữ)
    if (customerSearch) {
      const lower = customerSearch.toLowerCase();
      availableCustomers = availableCustomers.filter(c => 
        c.fullName?.toLowerCase().includes(lower) || 
        c.idNumber?.includes(lower)
      );
    }

    return availableCustomers;
  }, [customerSearch, customers, savingsBooks]);

  // YÊU CẦU 2: Lọc danh sách sổ tiết kiệm dựa trên Khách hàng đã chọn
  const filteredBooks = useMemo(() => {
    if (!selectedCustomer) return [];
    return savingsBooks.filter(b => b.customerId === selectedCustomer.id && b.status !== 'CLOSED');
  }, [selectedCustomer, savingsBooks]);

  const handleCustomerSearchChange = (e) => {
    setCustomerSearch(e.target.value);
    setShowCustomerDropdown(true);
    // Nếu đang có customer mà lại gõ text khác -> reset chuỗi chọn phía dưới (Progressive Disclosure)
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
    setSelectedBook(null); // Reset selection sổ
    setErrors({});
  };

  // YÊU CẦU 3 & 4: Logic chọn sổ và tự động điền/khóa Amount
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        customerId: Number(formData.customerId),
        savingsBookId: Number(formData.savingsBookId),
        transactionDate: new Date(formData.transactionDate).toISOString(),
        amount: Number(formData.amount),
      };

      // Giả định endpoint theo logic thông thường của REST API và tên module trên server
      await api.post('/savings-book/withdraw', payload);

      toast.success('Rút tiền thành công!');

      // Reset form sau khi thành công
      handleReset();
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
      {/* PageHeader đã được thêm Icon và Badge BM3 */}
      <PageHeader
        icon={LuArrowUpFromLine}
        title="Phiếu Rút Tiền"
        badge="BM3"
        subtitle="Thực hiện rút tiền từ sổ tiết kiệm"
      />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6 mt-6 w-full shadow-sm">
        <form onSubmit={handleSubmit}>
          
          {/* --- SECTION 1: Thông tin khách hàng & sổ --- */}
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
              {/* YÊU CẦU 1: Autocomplete Khách Hàng */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Khách hàng (Tên hoặc CCCD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LuUser size={16} />
                  </span>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={handleCustomerSearchChange}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Tìm kiếm theo Tên hoặc số CCCD..."
                    className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors.customerId ? 'border-red-300' : 'border-gray-200'}`}
                    required
                  />
                </div>
                {showCustomerDropdown && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto py-1">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(c => (
                        <li
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 last:border-0"
                        >
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

              {/* YÊU CẦU 2 & 4: Cascading Dropdown Mã Sổ */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Mã Sổ tiết kiệm <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LuBookOpen size={16} />
                  </span>
                  <select
                    value={formData.savingsBookId}
                    onChange={handleBookChange}
                    disabled={!selectedCustomer}
                    className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-8 appearance-none
                      ${!selectedCustomer
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-800'
                      } ${errors.savingsBookId ? 'border-red-300' : ''}
                    `}
                    required
                  >
                    <option value="" disabled>-- Chọn sổ tiết kiệm --</option>
                    {filteredBooks.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bookCode} (Kỳ hạn {b.savingsType?.termMonths === 0 ? 'Không' : `${b.savingsType?.termMonths} tháng`} - Số dư: {Number(b.balance).toLocaleString('vi-VN')}đ)
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

          {/* --- SECTION 2: Chi tiết giao dịch --- */}
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
              {/* YÊU CẦU 3 & 4: Logic Khóa & Disable Số tiền */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Số tiền rút (VNĐ) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LuCircleDollarSign size={16} />
                  </span>
                  <input
                    type={isTermDeposit ? "text" : "number"}
                    name="amount"
                    value={isTermDeposit && formData.amount ? formData.amount.toLocaleString('vi-VN') : formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    disabled={!selectedBook || isTermDeposit}
                    placeholder="Nhập số tiền cần rút"
                    className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3
                      ${(!selectedBook || isTermDeposit)
                        ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-medium'
                        : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400'
                      } ${errors.amount ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}
                    `}
                    required
                  />
                </div>
                {isTermDeposit && (
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-xs text-orange-600 font-medium">
                      * Sổ có kỳ hạn yêu cầu rút toàn bộ (Tất toán sổ)
                    </p>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-not-allowed">
                      <input type="checkbox" checked disabled className="rounded text-blue-500 cursor-not-allowed border-gray-300" />
                      Đồng ý tất toán sổ
                    </label>
                  </div>
                )}
              </div>

              {/* YÊU CẦU 4: Mở khóa theo luồng Ngày giao dịch */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Ngày giao dịch <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LuCalendarDays size={16} />
                  </span>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData(prev => ({...prev, transactionDate: e.target.value}))}
                    disabled={!selectedBook}
                    className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3
                      ${!selectedBook
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400'
                      } ${errors.transactionDate ? 'border-red-300' : ''}
                    `}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- BUTTONS --- */}
          <div className="pt-5 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 cursor-pointer text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <LuRefreshCw size={14} />
              Làm mới
            </button>
            
            <Button
              type="submit"
              isLoading={isLoading}
              icon={<LuArrowUpFromLine size={16} />}
              className="w-auto px-6"
            >
              Xác nhận rút tiền
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}