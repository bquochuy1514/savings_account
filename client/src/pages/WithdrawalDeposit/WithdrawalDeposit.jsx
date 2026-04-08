import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LuArrowUpFromLine, 
  LuRefreshCw, 
  LuUser, 
  LuBookOpen, 
  LuCircleDollarSign, 
  LuCalendarDays,
  LuCheck,
  LuPrinter,
  LuX
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

  // --- STATE TÌM KIẾM & DROPDOWN ---
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [savingsBooks, setSavingsBooks] = useState([]);
  const dropdownRef = useRef(null);

  // --- STATE MODAL BIÊN LAI ---
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

  // HÀM XỬ LÝ NHẬP TIỀN CÓ DẤU CHẤM
  const handleAmountChange = (e) => {
    // Chỉ lấy các ký tự số, loại bỏ chữ và dấu chấm/phẩy
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

 const handleSubmit = async (e) => {
    e.preventDefault();
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

      // Gọi API
      const response = await api.post('/savings-book/withdraw', payload);
      
      // IN RA CONSOLE ĐỂ KIỂM TRA (Nhấn F12 sang tab Console để xem)
      console.log("🔍 Data trả về từ Server:", response);

      // --- THUẬT TOÁN BÓC TÁCH DATA BẤT BẠI ---
      // 1. Lột lớp vỏ của Axios (nếu có)
      const rawResponse = response.data ? response.data : response;
      
      // 2. Lột tiếp lớp vỏ "data" của Backend (theo đúng JSON bạn gửi)
      const actualReceiptData = rawResponse.data ? rawResponse.data : rawResponse;

      // 3. Kiểm tra xem có chứa biên lai (transactionResult) không
      if (actualReceiptData && actualReceiptData.transactionResult) {
        setReceiptData(actualReceiptData); 
        setShowSuccessModal(true); // 🔥 Bật Modal Biên Lai lên!
      } else {
        // Nếu cấu trúc vẫn bị lệch, ít nhất vẫn báo Toast và không bị sập Web
        toast.success('Rút tiền thành công!');
        console.warn('⚠️ Lỗi: Không thể hiện Biên lai do sai cấu trúc JSON', actualReceiptData);
      }

      // Reset form nền phía sau
      handleReset();
      
      // Kéo lại data danh sách sổ để update trạng thái
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
          
          {/* --- SECTION 1: Thông tin khách hàng & sổ --- */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <LuUser size={14} />
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Thông tin tra cứu</p>
            </div>
            
            <div className="grid grid-cols-2 gap-5 pl-1">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Khách hàng (Tên hoặc CCCD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LuUser size={16} /></span>
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

          {/* --- SECTION 2: Chi tiết giao dịch --- */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <LuCircleDollarSign size={14} />
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Chi tiết giao dịch</p>
            </div>

            <div className="grid grid-cols-2 gap-5 pl-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Số tiền rút (VNĐ) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LuCircleDollarSign size={16} /></span>
                  <input
                    type="text" // Chuyển thành text để hiển thị dấu chấm
                    name="amount"
                    // LOGIC HIỂN THỊ DẤU CHẤM TẠI ĐÂY
                    value={formData.amount ? Number(formData.amount).toLocaleString('vi-VN') : ''}
                    onChange={handleAmountChange}
                    disabled={!selectedBook || isTermDeposit}
                    placeholder="VD: 1.000.000"
                    className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3 ${(!selectedBook || isTermDeposit) ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed font-semibold' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 font-semibold'} ${errors.amount ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : ''}`}
                    required
                  />
                </div>
                {isTermDeposit && (
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-xs text-orange-600 font-medium">* Sổ có kỳ hạn yêu cầu rút toàn bộ (Tất toán sổ)</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Ngày giao dịch <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><LuCalendarDays size={16} /></span>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData(prev => ({...prev, transactionDate: e.target.value}))}
                    disabled={!selectedBook}
                    className={`w-full py-2.5 text-sm border rounded-lg focus:outline-none transition-colors pl-9 pr-3 ${!selectedBook ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400'} ${errors.transactionDate ? 'border-red-300' : ''}`}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 cursor-pointer text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <LuRefreshCw size={14} /> Làm mới
            </button>
            <Button type="submit" isLoading={isLoading} icon={<LuArrowUpFromLine size={16} />} className="w-auto px-6">
              Xác nhận rút tiền
            </Button>
          </div>
        </form>
      </div>

      {/* --- MODAL BIÊN LAI RÚT TIỀN (Hiệu ứng mờ nền) --- */}
      {showSuccessModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            
            {/* Header Modal */}
            <div className="bg-green-50 px-6 py-8 text-center border-b border-green-100">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <LuCheck size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Giao dịch thành công!</h2>
              <p className="text-sm text-gray-500 mt-1">Biên lai rút tiền tiết kiệm</p>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Mã giao dịch</span>
                <span className="font-medium text-gray-800">#{receiptData.transactionResult.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Mã sổ tiết kiệm</span>
                <span className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{receiptData.savingsBookResult.bookCode}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Thời gian</span>
                <span className="font-medium text-gray-800">
                  {new Date(receiptData.transactionResult.transactionDate).toLocaleString('vi-VN')}
                </span>
              </div>

              <div className="my-4 border-t border-dashed border-gray-300"></div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Số tiền gốc rút</span>
                <span className="font-medium text-gray-800">
                  {Math.round(receiptData.transactionResult.amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Tiền lãi nhận được</span>
                <span className="font-medium text-green-600">
                  + {Math.round(receiptData.transactionResult.interest).toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                <span className="font-semibold text-blue-800">Tổng tiền nhận</span>
                <span className="text-xl font-bold text-blue-700">
                  {Math.round(receiptData.transactionResult.amount + receiptData.transactionResult.interest).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => toast.info('Đang in biên lai...')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                <LuPrinter size={18} /> In biên lai
              </button>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                <LuX size={18} /> Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

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

