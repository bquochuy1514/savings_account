import { useState } from "react";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleRegister(e) {
    e.preventDefault();
    console.log(formData);
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Registration successful:", data);
        toast.info(data.message);
      });
  }

  return (
    <div className="min-h-screen flex">
      {/* Cột trái */}
      <div className="hidden md:flex flex-col justify-between flex-1 bg-[#1a1a2e] p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-sm ${i % 3 === 0 ? "bg-indigo-400" : "bg-indigo-400/40"}`}
                />
              ))}
            </div>
          </div>
          <span className="text-[17px] font-semibold text-white">
            Nova<span className="text-indigo-400">UI</span>
          </span>
        </div>

        <div className="flex flex-col gap-6">
          {[
            {
              title: "Miễn phí mãi mãi",
              desc: "Không cần thẻ tín dụng, không giới hạn thời gian dùng thử.",
            },
            {
              title: "Component sẵn dùng",
              desc: "Hơn 200+ component được thiết kế chuyên nghiệp.",
            },
            {
              title: "Cập nhật liên tục",
              desc: "Component mới được thêm vào mỗi tuần.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/85 mb-1">
                  {item.title}
                </p>
                <p className="text-xs text-white/35 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/25">
          © 2025 NovaUI. All rights reserved.
        </p>
      </div>

      {/* Cột phải */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">
            Tạo tài khoản
          </h2>
          <p className="text-sm text-gray-400 mb-7">
            Điền thông tin bên dưới để bắt đầu
          </p>

          <form onSubmit={handleRegister}>
            {/* Họ tên */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Họ tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Họ và tên đầy đủ"
                className="w-full h-11 px-3 text-sm border border-gray-200 rounded-xl
                  outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full h-11 px-3 text-sm border border-gray-200 rounded-xl
                  outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Mật khẩu */}
            <div className="mb-4">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full h-11 px-3 text-sm border border-gray-200 rounded-xl
                  outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="mb-5">
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full h-11 px-3 text-sm border border-gray-200 rounded-xl
                  outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
              <input
                type="checkbox"
                className="accent-indigo-500 mt-0.5 w-3.5 h-3.5 flex-shrink-0"
              />
              <span className="text-[12.5px] text-gray-500 leading-relaxed">
                Tôi đồng ý với{" "}
                <a href="#" className="text-indigo-500 hover:underline">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="text-indigo-500 hover:underline">
                  Chính sách bảo mật
                </a>
              </span>
            </label>

            <button
              type="submit"
              className="w-full h-11 bg-indigo-500 hover:bg-indigo-600 text-white text-sm
                font-medium rounded-xl transition"
            >
              Tạo tài khoản
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">hoặc</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            className="w-full h-11 border border-gray-200 rounded-xl text-sm text-gray-700
            flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            Đăng ký với Google
          </button>

          <p className="text-center text-sm text-gray-400 mt-5">
            Đã có tài khoản?{" "}
            <a href="#" className="text-indigo-500 font-medium hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
