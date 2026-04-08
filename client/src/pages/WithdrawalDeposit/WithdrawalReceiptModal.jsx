import { LuReceipt, LuCheck, LuPrinter, LuX } from 'react-icons/lu';
import { toast } from 'react-toastify';

export default function WithdrawalReceiptModal({ isOpen, onClose, receiptData }) {
  if (!isOpen || !receiptData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-green-50 px-6 py-6 text-center border-b border-green-100 relative">
          <div className="absolute top-6 right-6 text-green-200 opacity-50">
            <LuReceipt size={48} />
          </div>
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm relative z-10">
            <LuCheck size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 relative z-10">Giao dịch thành công!</h2>
          <p className="text-sm text-gray-500 mt-1 relative z-10">Biên lai rút tiền tiết kiệm • #{receiptData?.transactionResult?.id || 'N/A'}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin định danh</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Khách hàng</span>
              <span className="font-semibold text-gray-800">{receiptData?.customerSnapshot?.fullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">CMND / CCCD</span>
              <span className="font-mono text-gray-800">{receiptData?.customerSnapshot?.idNumber || 'N/A'}</span>
            </div>
            <div className="h-px bg-gray-200 w-full my-2"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Mã sổ tiết kiệm</span>
              <span className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{receiptData?.savingsBookResult?.bookCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Loại kỳ hạn</span>
              <span className="font-medium text-gray-800">{receiptData?.customerSnapshot?.termName || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-3 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chi tiết giao dịch</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Ngày giao dịch</span>
              <span className="font-medium text-gray-800">
                {receiptData?.transactionResult?.transactionDate ? new Date(receiptData.transactionResult.transactionDate).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Số tiền gốc rút</span>
              <span className="font-medium text-gray-800">
                {Math.round(receiptData?.transactionResult?.amount || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Tiền lãi nhận được</span>
              <span className="font-medium text-green-600">
                + {Math.round(receiptData?.transactionResult?.interest || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
            <span className="font-semibold text-blue-800">Tổng tiền nhận</span>
            <span className="text-2xl font-bold text-blue-700">
              {Math.round((receiptData?.transactionResult?.amount || 0) + (receiptData?.transactionResult?.interest || 0)).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button onClick={() => toast.info('Đang gửi lệnh đến máy in...')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <LuPrinter size={18} /> In biên lai
          </button>
          <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
            <LuX size={18} /> Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
