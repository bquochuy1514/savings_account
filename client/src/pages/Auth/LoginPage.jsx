import Logo from "../../components/logo/Logo";

// LoginPage.jsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Cột trái */}
      <div className="hidden md:flex flex-col justify-between flex-1 bg-[#1a1a2e] p-10">
        <div className="flex items-center justify-center gap-2.5">
          <Logo height={50} />
        </div>

        <div>
          <p className="text-white/85 text-lg font-light leading-relaxed mb-3">
            "Thiết kế tốt không chỉ là cách nhìn — <br />
            đó là cách mọi thứ hoạt động."
          </p>
          <p className="text-white/40 text-sm">— Steve Jobs</p>
        </div>

        <div className="flex gap-1.5">
          <div className="w-5 h-1.5 rounded-full bg-indigo-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Cột phải */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">
            Đăng nhập
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Nhập thông tin để tiếp tục
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full h-11 pl-9 pr-4 text-sm border border-gray-200 rounded-xl
                  outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="mb-4">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full h-11 pl-9 pr-10 text-sm border border-gray-200 rounded-xl
                  outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {/* eye icon */}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between my-5">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                className="accent-indigo-500 w-3.5 h-3.5"
              />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-sm text-indigo-500 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          <button
            className="w-full h-11 bg-indigo-500 hover:bg-indigo-600 text-white text-sm
            font-medium rounded-xl transition"
          >
            Đăng nhập
          </button>

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
            {/* Google SVG */}
            Tiếp tục với Google
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Chưa có tài khoản?{" "}
            <a href="#" className="text-indigo-500 font-medium hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
