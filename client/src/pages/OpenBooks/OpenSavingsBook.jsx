import { useEffect, useState } from 'react';
import { LuBookOpen, LuCheck } from 'react-icons/lu';
import PageHeader from '../../components/ui/PageHeader';
import Step1 from './Step1';
import Step2 from './Step2';
import { getSavingsTypes } from '../../services/savings-type';
import Step3 from './Step3';
import { toast } from 'react-toastify';
import { createCustomer } from '../../services/customer';
import { createSavingsBook } from '../../services/savings-book';

function today() {
	return new Date().toISOString().split('T')[0];
}

function StepBar({ current }) {
	const steps = [
		{ num: 1, label: 'Khách hàng' },
		{ num: 2, label: 'Sổ tiết kiệm' },
		{ num: 3, label: 'Xác nhận' },
	];
	return (
		<div className="flex items-center gap-0 mb-8">
			{steps.map((s, i) => {
				const isDone = current > s.num;
				const isActive = current === s.num;
				return (
					<div key={s.num} className="flex items-center">
						<div className="flex items-center gap-2.5">
							<div
								className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all
									${isDone ? 'bg-green-600 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
							>
								{isDone ? <LuCheck size={13} /> : s.num}
							</div>
							<span
								className={`text-sm ${isActive ? 'text-gray-800 font-medium' : isDone ? 'text-gray-500' : 'text-gray-400'}`}
							>
								{s.label}
							</span>
						</div>
						{i < steps.length - 1 && (
							<div className="w-12 h-px bg-gray-200 mx-3 flex-shrink-0" />
						)}
					</div>
				);
			})}
		</div>
	);
}

export default function OpenSavingsBook() {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [savingsTypes, setSavingsTypes] = useState([]);

	const [customerData, setCustomerData] = useState({
		id: null, // ID khách hàng (lấy từ Step1 khi tìm/tạo KH)
		fullName: '',
		idNumber: '',
		address: '',
		isExisting: false,
	});

	const [bookData, setBookData] = useState({
		savingsTypeId: null, // ID loại tiết kiệm
		openDate: today(), // Ngày mở sổ (ISO string)
		amountRaw: '', // Số tiền dạng string thô, parse sang number khi submit
	});

	const handleSubmit = async () => {
		try {
			setLoading(true);

			let customerId = customerData.id;

			if (!customerData.isExisting) {
				const customerResponse = await createCustomer({
					fullName: customerData.fullName,
					idNumber: customerData.idNumber,
					address: customerData.address,
				});
				customerId = customerResponse.data.id;
			}

			const payload = {
				customerId,
				savingsTypeId: bookData.savingsTypeId,
				openDate: bookData.openDate,
				balance: parseInt(bookData.amountRaw, 10),
			};

			console.log(payload);

			const response = await createSavingsBook(payload);
			toast.success(response.message);
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	const fetchSavingsTypes = async () => {
		try {
			setLoading(true);
			const response = await getSavingsTypes();
			setSavingsTypes(response.data);
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSavingsTypes();
	}, []);

	return (
		<div className="p-6">
			<PageHeader
				icon={LuBookOpen}
				title={'Mở sổ tiết kiệm'}
				badge={'BM1'}
				subtitle={'Đăng ký khách hàng và tạo sổ tiết kiệm mới'}
			/>

			<StepBar current={step} />

			{step === 1 && (
				<Step1
					data={customerData}
					setData={setCustomerData}
					onNext={() => setStep(2)}
				/>
			)}
			{step === 2 && (
				<Step2
					bookData={bookData}
					setBookData={setBookData}
					savingsTypes={savingsTypes}
					onNext={() => setStep(3)}
					onBack={() => {
						setStep(1);
						setCustomerData({
							customerId: null,
							fullName: '',
							idNumber: '',
							address: '',
							isExisting: false,
						});
					}}
				/>
			)}
			{step === 3 && (
				<Step3
					customerData={customerData}
					bookData={bookData}
					onBack={() => setStep(2)}
					onSubmit={handleSubmit}
					loading={loading}
					savingsTypes={savingsTypes}
				/>
			)}
		</div>
	);
}
