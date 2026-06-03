# THUYẾT TRÌNH: HỆ THỐNG QUẢN LÝ TIẾT KIỆM (Savings Account System)

## I. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

**Technology Stack:**

- Backend: NestJS (Node.js framework)
- Database: Prisma (ORM)
- Authentication: JWT Token
- API Architecture: REST API
- Global Prefix: `/api`

**Module chính:**

1. **Users Module** - Quản lý người dùng
2. **Auth Module** - Xác thực JWT
3. **SavingsType Module** - Quản lý loại tiết kiệm (QĐ6)
4. **Customers Module** - Quản lý khách hàng
5. **SavingsBook Module** - Quản lý sổ tiết kiệm
6. **Transactions Module** - Ghi chép giao dịch
7. **Reports Module** - Báo cáo tháng

---

## II. CÁC BIỂU MẪU VÀ CHỨC NĂNG

### **BM1 – MỞ SỔ TIẾT KIỆM**

**Endpoint:** `POST /api/savings-book`

**Chức năng:** Tạo mới một sổ tiết kiệm cho khách hàng

**Yêu cầu dữ liệu:**

```typescript
{
  customerId: number,           // ID khách hàng
  savingsTypeId: number,        // Loại tiết kiệm (không kỳ hạn, 3 tháng, 6 tháng...)
  openDate: string,             // Ngày mở sổ (ISO format)
  balance: number               // Số tiền gởi ban đầu
}
```

**Xác thực & Quy tắc:**

1. ✅ Kiểm tra khách hàng tồn tại
2. ✅ Kiểm tra loại tiết kiệm tồn tại và đang hoạt động (`isActive = true`)
3. ✅ Kiểm tra số tiền gởi ≥ tiền tối thiểu ban đầu (`minInitDeposit` - được config qua QĐ6)
4. ✅ Tự động tạo mã số sổ theo format: `STK-YYYY-000001` (ví dụ: STK-2025-000001)
5. ✅ Tạo transaction loại `INITIAL_DEPOSIT`

**Kết quả:**

- Tạo record SavingsBook với status = OPEN
- Tạo transaction ghi nhận khoản gởi ban đầu
- Return sổ tiết kiệm + transaction

**Implementation File:** `savings-book.service.ts` (lines 23-104)

---

### **BM2 – GỞI THÊM TIỀN**

**Endpoint:** `POST /api/savings-book/deposit`

**Chức năng:** Gởi thêm tiền vào sổ tiết kiệm đã mở

**Yêu cầu dữ liệu:**

```typescript
{
  customerId: number,           // ID khách hàng
  savingsBookId: number,        // ID sổ tiết kiệm
  transactionDate: string,      // Ngày gởi (ISO format)
  amount: number                // Số tiền gởi thêm
}
```

**Xác thực & Quy tắc:**

**Chung:**

- ✅ Kiểm tra khách hàng tồn tại
- ✅ Kiểm tra sổ tiết kiệm tồn tại
- ✅ Kiểm tra sổ không đóng (status ≠ CLOSED)
- ✅ Kiểm tra khách hàng khớp với sổ
- ✅ Số tiền gởi thêm ≥ tiền tối thiểu (`minAddDeposit` - default 100.000đ)

**Loại Không Kỳ Hạn (termMonths = 0):**

- ✅ Phải gởi sau N ngày kể từ mở sổ (N = `minWithdrawDays` - default 15 ngày)
- ✅ Có thể gởi bất cứ lúc nào

**Loại Có Kỳ Hạn (termMonths > 0):**

- ✅ Chỉ được gởi đúng vào ngày kỳ hạn (1 kỳ, 2 kỳ, 3 kỳ...)
- ✅ Ngày gởi phải khớp chính xác với ngày đáo hạn (ví dụ: nếu mở 1/1/2025, kỳ hạn 3 tháng, chỉ được gởi vào 1/4/2025, 1/7/2025...)
- ✅ Số tháng gởi phải là bội số của kỳ hạn

**Kết quả:**

- Tạo transaction loại `DEPOSIT`
- Cập nhật balance của sổ (tăng)
- Return transaction + sổ tiết kiệm mới

**Implementation File:** `savings-book.service.ts` (lines 137-222)

---

### **BM3 – RÚT TIỀN**

**Endpoint:** `POST /api/savings-book/withdraw`

**Chức năng:** Rút tiền từ sổ tiết kiệm, tính lãi

**Yêu cầu dữ liệu:**

```typescript
{
  customerId: number,           // ID khách hàng
  savingsBookId: number,        // ID sổ tiết kiệm
  transactionDate: string,      // Ngày rút (ISO format)
  amount?: number               // Số tiền rút (chỉ dùng cho sổ không kỳ hạn)
}
```

#### **Loại Không Kỳ Hạn:**

**Điều kiện rút:**

- ✅ Phải gởi từ N ngày trở lên (default 15 ngày, config qua QĐ6)
- ✅ Rút được một phần (amount ≤ balance hiện có)
- ✅ Có thể rút lẻ lãi suất không kỳ hạn

**Tính lãi (cho phần rút):**

```
Lãi = Số tiền rút × Lãi suất × (Số ngày thực gửi / 365)

Ví dụ:
- Rút 1.000.000đ
- Lãi suất không kỳ hạn: 0.5%
- Gửi 30 ngày
- Lãi = 1.000.000 × 0.005 × (30 / 365) = 410.96đ
```

**Tình trạng sổ sau rút:**

- Nếu rút hết → sổ tự động đóng (status = CLOSED, set closeDate)
- Nếu rút một phần → sổ vẫn OPEN, balance giảm

#### **Loại Có Kỳ Hạn:**

**Điều kiện rút:**

- ❌ Không được rút trước hạn (trước khi đủ 1 kỳ đầu tiên)
- ✅ Phải rút hết toàn bộ (không được rút một phần)
- ✅ Không thể rút và gởi cùng ngày
- ✅ Ngày rút phải ≥ ngày đáo hạn kỳ đầu tiên

**Tính lãi (khi có gởi thêm nhiều lần):**

Lãi được tính riêng cho từng khoản gởi:

```
Bước 1: Tính số kỳ đủ
  số_kỳ_đủ = floor((Ngày rút - Ngày gởi khoản đó) / Số ngày 1 kỳ)
  ngày_đủ_kỳ = số_kỳ_đủ × số_ngày_1_kỳ

Bước 2: Tính số ngày lẻ
  ngày_lẻ = (Ngày rút - Ngày gởi) - ngày_đủ_kỳ

Bước 3: Tính lãi từng phần
  Lãi đủ kỳ = Số tiền khoản này × Lãi suất kỳ hạn × (ngày_đủ_kỳ / 365)
  Lãi lẻ = Số tiền khoản này × Lãi suất không kỳ hạn × (ngày_lẻ / 365)

Bước 4: Cộng toàn bộ
  Tổng lãi = Σ(Lãi đủ kỳ + Lãi lẻ) của tất cả khoản

Ví dụ: Sổ 6 tháng, lãi suất 5%, lãi không kỳ hạn 0.5%, gởi 2 khoản cách nhau 6 tháng, rút sau 13 tháng
- Khoản 1 (gởi ngày 1/1): 1.000.000đ → 12 tháng đủ kỳ + 1 tháng lẻ
  + Lãi đủ kỳ = 1.000.000 × 0.05 × (360/365) = 49.315đ
  + Lãi lẻ = 1.000.000 × 0.005 × (30/365) = 41đ
- Khoản 2 (gởi ngày 1/7): 1.000.000đ → 6 tháng đủ kỳ + 1 tháng lẻ
  + Lãi đủ kỳ = 1.000.000 × 0.05 × (180/365) = 2.466đ
  + Lãi lẻ = 1.000.000 × 0.005 × (30/365) = 41đ
- Tổng lãi ≈ 51.863đ
```

**Tình trạng sổ sau rút:**

- Luôn rút hết → sổ tự động đóng (status = CLOSED, set closeDate)

**Kết quả:**

- Tạo transaction loại `WITHDRAWAL` (có field `interest`)
- Cập nhật balance = 0, status = CLOSED, closeDate
- Return transaction + sổ tiết kiệm

**Implementation File:** `savings-book.service.ts` (lines 224-431)

- Loại không kỳ hạn: lines 257-307
- Loại có kỳ hạn: lines 311-429

---

### **BM4 – TRA CỨU SỔ TIẾT KIỆM**

**Endpoint:** `GET /api/savings-book`

**Chức năng:** Danh sách tất cả sổ tiết kiệm

**Yêu cầu:** (Không có parameter)

**Kết quả trả về:**

```json
[
	{
		"id": 1,
		"bookCode": "STK-2025-000001",
		"customerId": 1,
		"savingsTypeId": 1,
		"openDate": "2025-01-01",
		"closeDate": null,
		"balance": 1500000,
		"status": "OPEN",
		"customer": {
			/* thông tin khách hàng */
		},
		"savingsType": {
			/* loại tiết kiệm */
		}
	}
]
```

**Columns hiển thị (BM4):**

- STT (số thứ tự)
- Mã Số (bookCode)
- Loại Tiết Kiệm (savingsType.name)
- Khách Hàng (customer.name)
- Số Dư (balance)

**Endpoint chi tiết:** `GET /api/savings-book/:id`

**Implementation File:** `savings-book.service.ts` (lines 106-134)

---

### **BM5 – BÁO CÁO THÁNG**

#### **BM5.1 – Doanh số hoạt động theo ngày**

**Endpoint:** `GET /api/reports/daily-activity?date=2025-01-15`

**Chức năng:** Báo cáo giao dịch trong 1 ngày

**Parameter:**

```
date: string (ISO format: YYYY-MM-DD)
```

**Xử lý:**

1. Query tất cả transaction trong ngày đó
2. Group by loại tiết kiệm
3. Tính:
    - **Tổng Thu** = Sum(INITIAL_DEPOSIT + DEPOSIT)
    - **Tổng Chi** = Sum(WITHDRAWAL)
    - **Chênh Lệch** = Tổng Thu - Tổng Chi

**Kết quả trả về:**

```json
{
	"date": "2025-01-15",
	"rows": [
		{
			"stt": 1,
			"savingsTypeName": "Không kỳ hạn",
			"totalDeposit": 5000000,
			"totalWithdrawal": 1000000,
			"difference": 4000000
		},
		{
			"stt": 2,
			"savingsTypeName": "3 tháng",
			"totalDeposit": 10000000,
			"totalWithdrawal": 0,
			"difference": 10000000
		}
	]
}
```

**Columns báo cáo (BM5.1):**

- Ngày
- STT (số thứ tự)
- Loại Tiết Kiệm
- Tổng Thu
- Tổng Chi
- Chênh Lệch

**Implementation File:** `reports.service.ts` (lines 24-94)

---

#### **BM5.2 – Mở/Đóng sổ theo tháng**

**Endpoint:** `GET /api/reports/monthly-books?savingsTypeId=1&month=1&year=2025`

**Chức năng:** Báo cáo số sổ mở/đóng trong 1 tháng cho 1 loại tiết kiệm

**Parameter:**

```
savingsTypeId: number    // ID loại tiết kiệm
month: number            // Tháng (1-12)
year: number             // Năm
```

**Xử lý:**

1. Query sổ được **mở** trong tháng đó (where openDate in month, savingsTypeId match)
2. Query sổ được **đóng** trong tháng đó (where closeDate in month, savingsTypeId match)
3. Group by ngày
4. Tính:
    - **Số Sổ Mở** = Count(openDate = ngày đó)
    - **Số Sổ Đóng** = Count(closeDate = ngày đó)
    - **Chênh Lệch** = Số Sổ Mở - Số Sổ Đóng

**Kết quả trả về:**

```json
{
	"savingsTypeName": "3 tháng",
	"month": 1,
	"year": 2025,
	"rows": [
		{
			"stt": 1,
			"date": "2025-01-05",
			"opened": 10,
			"closed": 2,
			"difference": 8
		},
		{
			"stt": 2,
			"date": "2025-01-20",
			"opened": 5,
			"closed": 3,
			"difference": 2
		}
	]
}
```

**Columns báo cáo (BM5.2):**

- Loại Tiết Kiệm
- Tháng
- STT (số thứ tự)
- Ngày
- Số Sổ Mở
- Số Sổ Đóng
- Chênh Lệch

**Implementation File:** `reports.service.ts` (lines 96-165)

---

## III. QĐ6 – THAY ĐỔI QUY ĐỊNH

### **Quản lý Loại Tiết Kiệm**

**Endpoint:** `POST /api/savings-type` (Tạo) | `PUT /api/savings-type/:id` (Cập nhật)

**Chức năng:**

- Thêm loại kỳ hạn mới
- Bỏ loại kỳ hạn không dùng
- Thay đổi lãi suất
- Thay đổi tiền gởi tối thiểu

**Yêu cầu dữ liệu (Tạo):**

```typescript
{
  name: string,                 // Ví dụ: "Không kỳ hạn", "3 tháng", "6 tháng"
  termMonths: number,           // 0 = không kỳ hạn, 3 = 3 tháng, 6 = 6 tháng...
  interestRate: number,         // Lãi suất (%, ví dụ: 0.5, 5, 5.5)
  minInitDeposit: number,       // Tiền gởi ban đầu tối thiểu (đ)
  minAddDeposit: number,        // Tiền gởi thêm tối thiểu (đ)
  minWithdrawDays: number,      // Số ngày tối thiểu trước khi rút (chỉ cho không kỳ hạn)
  isActive: boolean             // Có sử dụng không? true = sử dụng, false = bỏ dùng
}
```

**Ví dụ tạo:**

```bash
POST /api/savings-type
{
  "name": "Không kỳ hạn",
  "termMonths": 0,
  "interestRate": 0.5,
  "minInitDeposit": 1000000,
  "minAddDeposit": 100000,
  "minWithdrawDays": 15,
  "isActive": true
}

POST /api/savings-type
{
  "name": "3 tháng",
  "termMonths": 3,
  "interestRate": 5.0,
  "minInitDeposit": 1000000,
  "minAddDeposit": 100000,
  "minWithdrawDays": 0,
  "isActive": true
}
```

**Xác thực:**

- ✅ Không được trùng kỳ hạn (không thể có 2 loại "không kỳ hạn")
- ✅ Kiểm tra loại tiết kiệm tồn tại khi update
- ✅ Chỉ manager và admin mới được tạo/cập nhật

**Endpoint khác:**

- `GET /api/savings-type` - Danh sách tất cả loại tiết kiệm
- `GET /api/savings-type/active` - Danh sách loại tiết kiệm đang sử dụng
- `GET /api/savings-type/:id` - Chi tiết 1 loại tiết kiệm

**Implementation File:**

- `savings-type.service.ts` (lines 13-73)
- `savings-type.controller.ts` (lines 20-64)

---

## IV. QUẢN LÝ DỮ LIỆU HỖTRỢ

### **Quản lý Khách Hàng**

**Endpoint:** `/api/customers`

**Chức năng:**

- Tạo khách hàng mới
- Cập nhật thông tin khách hàng
- Tra cứu khách hàng

**Thông tin khách hàng:**

```
- ID
- Họ tên
- CMND/CCCD
- Địa chỉ
- Số điện thoại
```

**Implementation File:** `customers.module.ts`, `customers.service.ts`

---

### **Quản lý Người Dùng & Xác Thực**

**Endpoint:** `/api/users`, `/api/auth`

**Chức năng:**

- Đăng ký tài khoản
- Đăng nhập (JWT Token)
- Phân quyền (Admin, Manager, Staff)
- Refresh token

**Role & Quyền:**

- **ADMIN** - Quản trị toàn hệ thống
- **MANAGER** - Quản lý loại tiết kiệm (QĐ6), báo cáo
- **STAFF** - Tạo/cập nhật sổ, gởi rút tiền, tra cứu

**Implementation File:** `auth.module.ts`, `auth.guard.ts`

---

## V. CẤU TRÚC API

### **Base URL:** `http://localhost:8080/api`

### **Authentication:**

- Header: `Authorization: Bearer <JWT_TOKEN>`
- Tất cả endpoint (trừ login, register) cần JWT token

### **Response Format:**

```json
{
	"statusCode": 200,
	"message": "Mở sổ tiết kiệm thành công!",
	"data": {
		/* data */
	}
}
```

### **Error Format:**

```json
{
	"statusCode": 400,
	"message": "Số tiền gởi ban đầu tối thiểu là 1,000,000đ",
	"error": "Bad Request"
}
```

---

## VI. TÓMLƯỢC QƯỚC TRÌNH GIAO DỊCH

### **Quy Trình Mở Sổ:**

1. Người dùng (STAFF) nhập thông tin: Khách hàng, Loại tiết kiệm, Số tiền gởi ban đầu
2. Hệ thống kiểm tra điều kiện (số tiền ≥ minimum)
3. Tạo sổ (generate mã số STK)
4. Tạo transaction ghi nhận khoản gởi ban đầu
5. Return sổ + transaction

### **Quy Trình Gởi Thêm Tiền:**

1. Người dùng chọn sổ, nhập ngày gởi + số tiền
2. **Nếu không kỳ hạn:** Kiểm tra ngày gởi ≥ 15 ngày kể từ mở sổ
3. **Nếu có kỳ hạn:** Kiểm tra ngày gởi đúng vào ngày kỳ hạn
4. Tạo transaction loại DEPOSIT
5. Cập nhật balance (tăng)

### **Quy Trình Rút Tiền:**

1. Người dùng chọn sổ + nhập ngày rút (+ số tiền nếu không kỳ hạn)
2. **Nếu không kỳ hạn:**
    - Kiểm tra gửi ≥ 15 ngày
    - Kiểm tra số tiền ≤ số dư
    - Tính lãi: Số tiền × Lãi suất × (Số ngày / 365)
    - Nếu rút hết → Đóng sổ
3. **Nếu có kỳ hạn:**
    - Kiểm tra ≥ 1 kỳ đầu tiên
    - Phải rút hết
    - Tính lãi từng khoản gởi (phần đủ kỳ + phần lẻ)
    - Luôn đóng sổ
4. Tạo transaction loại WITHDRAWAL (có lãi)
5. Cập nhật balance = 0, status = CLOSED

---

## VII. ĐIỂM NỔI BẬT CỦA IMPLEMENTATION

✅ **Tính toán lãi chính xác:**

- Phân biệt phần đủ kỳ và phần lẻ ngày
- Tính lãi riêng cho từng khoản gởi

✅ **Kiểm soát giao dịch:**

- Xác thực điều kiện gởi/rút theo loại tiết kiệm
- Tự động đóng sổ khi rút hết tiền (loại có kỳ hạn)

✅ **Tạo mã sổ thông minh:**

- Format: `STK-YYYY-XXXXXX`
- Tự động tăng số thứ tự theo năm

✅ **Báo cáo linh hoạt:**

- Báo cáo theo ngày + loại tiết kiệm
- Báo cáo tháng về số sổ mở/đóng

✅ **Config quy định động:**

- Thay đổi lãi suất, tiền minimum mà không cần code
- Tất cả rule đều đọc từ database

✅ **Phân quyền rõ ràng:**

- Chỉ MANAGER/ADMIN mới tạo/cập nhật loại tiết kiệm
- STAFF chỉ được tạo giao dịch

---

## VIII. ĐỀ XUẤT CẢI TIẾN

⚠️ **Chưa implement:**

1. Tính lãi từng kỳ (lãi nhập lãi)
2. Báo cáo chi tiết hơn (lãi dồn, dư nợ...)
3. Limit rút tiền tối đa
4. Thông báo sắp đáo hạn

📌 **Cần chú ý:**

- Validation ngày tháng khi add months (date-fns library)
- Precision khi tính lãi (rounding errors)
- Concurrent withdrawal (race condition)
