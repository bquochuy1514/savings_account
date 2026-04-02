// Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../logo/Logo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  

  return (
    <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between font-sans">
      {/* Logo */}
      <Logo />

      {/* Nav - ẩn trên mobile */}
      <nav className="hidden md:flex items-center gap-8">
        {["Sản phẩm", "Tính năng", "Bảng giá", "Blog"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors no-underline"
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Buttons */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/login"
          className="hidden md:block text-sm font-medium text-gray-800
          border border-gray-200 rounded-lg px-[18px] py-2
          hover:bg-gray-50 transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium text-white
          bg-indigo-500 rounded-lg px-[18px] py-2
          hover:bg-indigo-600 active:scale-95 transition-all"
        >
          Đăng ký
        </Link>

        {/* Hamburger - chỉ hiện trên mobile */}
        <button
          className="md:hidden p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect y="4" width="22" height="2" rx="1" fill="currentColor" />
            <rect y="10" width="22" height="2" rx="1" fill="currentColor" />
            <rect y="16" width="22" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div
          className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100
          flex flex-col px-6 py-4 gap-4 md:hidden z-50"
        >
          {["Sản phẩm", "Tính năng", "Bảng giá", "Blog"].map((item) => (
            <a key={item} href="#" className="text-sm text-gray-600">
              {item}
            </a>
          ))}
          <button
            className="text-sm font-medium text-gray-800 border border-gray-200
            rounded-lg px-4 py-2 w-full"
          >
            Đăng nhập
          </button>
        </div>
      )}
    </header>
  );
}
