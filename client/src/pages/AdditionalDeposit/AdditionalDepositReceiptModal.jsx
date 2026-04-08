import { LuCheck, LuPrinter, LuX } from 'react-icons/lu';
import Button from '../../components/ui/Button';

export default function AdditionalDepositReceiptModal({ isOpen, onClose, receiptData }) {
  if (!isOpen || !receiptData) return null;

  const { transactionResult, savingsBookResult, customerSnapshot } = receiptData;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden print:w-full print:max-w-none print:shadow-none print:bg-white print:text-black">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 print:hidden">
          <div className="flex items-center gap-2 text-green-600">
            <LuCheck size={20} className="stroke-2" />
            <span className="font-semibold text-sm">Gửi tiền thành công</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <LuX size={20} />
          </button>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center border-b border-gray-200 pb-4 mb-4 mt-8">
          <h2 className="text-2xl font-bold uppercase tracking-wider">Phiếu Gửi Tiền</h2>
          <p className="text-sm text-gray-500 mt-1">Mã GD: #{transactionResult?.id}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Amount block */}
            <div className="bg-blue-50/50 rounded-xl p-4 text-center border border-blue-100/50 print:border-0 print:bg-transparent print:p-0 print:mb-6">
              <p className="text-xs text-blue-600/80 uppercase font-medium tracking-wider mb-1 print:text-gray-500">Số tiền gửi</p>
              <p className="text-3xl font-bold text-blue-700 print:text-black">
                {Number(transactionResult?.amount).toLocaleString('vi-VN')} <span className="text-lg text-blue-600/80 print:text-gray-700">VNĐ</span>
              </p>
            </div>

            <div className="text-sm text-gray-600 space-y-3 pt-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50 print:border-gray-200">
                <span className="text-gray-500">Mã sổ tiết kiệm:</span>
                <span className="font-medium text-gray-900">{savingsBookResult?.bookCode}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50 print:border-gray-200">
                <span className="text-gray-500">Khách hàng:</span>
                <span className="font-medium text-gray-900">{customerSnapshot?.fullName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50 print:border-gray-200">
                <span className="text-gray-500">CCCD/CMND:</span>
                <span className="font-medium text-gray-900">{customerSnapshot?.idNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50 print:border-gray-200">
                <span className="text-gray-500">Kỳ hạn:</span>
                <span className="font-medium text-gray-900">{customerSnapshot?.termName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50 print:border-gray-200">
                <span className="text-gray-500">Số dư hiện tại:</span>
                <span className="font-medium text-green-600 print:text-black">{Number(savingsBookResult?.balance).toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50 print:border-gray-200">
                <span className="text-gray-500">Ngày giao dịch:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(transactionResult?.transactionDate)}
                </span>
              </div>
            </div>
            
            {/* Signature section for print only */}
            <div className="hidden print:flex justify-between mt-12 px-8">
              <div className="text-center">
                <p className="font-medium text-sm text-black">Khách hàng</p>
                <p className="text-xs text-gray-500 mt-1">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm text-black">Giao dịch viên</p>
                <p className="text-xs text-gray-500 mt-1">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 print:hidden">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button onClick={handlePrint} icon={<LuPrinter size={16} />}>
            In biên lai
          </Button>
        </div>
      </div>
    </div>
  );
}