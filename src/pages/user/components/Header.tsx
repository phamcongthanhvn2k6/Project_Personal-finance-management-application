import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };

  return (
    <header className="w-full bg-indigo-600 text-white px-6 py-3 flex justify-between items-center shadow-md relative">
      <h1 className="font-semibold text-lg flex items-center gap-2">
        <i className="fa-solid fa-wallet text-yellow-300"></i>
        Tài Chính Cá Nhân K24_Rikkei
      </h1>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
        >
          <i className="fa-solid fa-user"></i>
          <span>Tài Khoản</span>
          <i
            className={`fa-solid fa-chevron-down transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          ></i>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white text-gray-700 rounded shadow-lg z-50">
            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
            >
              <i className="fa-solid fa-id-card mr-2"></i> Thông tin cá nhân
            </button>

            <button
              onClick={() => setShowConfirm(true)}
              className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
            >
              <i className="fa-solid fa-right-from-bracket mr-2"></i> Đăng xuất
            </button>
          </div>
        )}
      </div>

      {/* ✅ Popup xác nhận đăng xuất */}
      {showConfirm && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999]">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-2">Xác nhận đăng xuất</h2>
            <p className="text-gray-600 mb-5">Bạn có chắc chắn muốn đăng xuất?</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Đăng xuất
              </button>

              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
