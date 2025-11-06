import { Home, Users, Layers, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/slices/authSlice";

export default function Sidebar() {
  // ✅ Hook điều hướng giữa các trang
  const navigate = useNavigate();

  // ✅ Lấy URL hiện tại -> dùng để xác định menu nào đang active
  const location = useLocation();

  // ✅ Dispatch để gọi action Redux (logout)
  const dispatch = useDispatch();

  // ✅ hiển thị / ẩn popup xác nhận đăng xuất
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Danh sách menu sidebar
  // Mỗi mục có tên, icon, đường dẫn
  const menu = [
    { name: "Dashboard", icon: <Home size={18} />, to: "/admin/dashboard" },
    { name: "Users", icon: <Users size={18} />, to: "/admin/users-manager" },
    { name: "Category", icon: <Layers size={18} />, to: "/admin/category-manager" },
  ];

  // ✅ Hàm xử lý đăng xuất
  const handleLogout = () => {
    dispatch(logout());               // Xóa token + thông tin user trong Redux
    navigate("/signin");              // Điều hướng về trang đăng nhập
  };

  return (
    <>
      {/* ✅ Sidebar cố định bên trái */}
      <aside className="fixed left-0 top-[56px] bottom-0 w-60 bg-white border-r border-gray-200 z-10 flex flex-col">
        
        {/* ✅ Danh sách menu */}
        <nav className="mt-2 flex-1">
          {menu.map((m) => {
            // ✅ Kiểm tra xem menu này có trùng URL hiện tại hay không
            const isActive = location.pathname.startsWith(m.to);

            return (
              <button
                key={m.name}
                onClick={() => navigate(m.to)}   // Chuyển trang khi bấm
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition relative text-left
                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600" // ✅ Tô màu nếu active
                      : "text-gray-700 hover:bg-gray-50" // ✅ Hover đẹp
                  }` }
              >
                {/* ✅ Thanh highlight bên trái khi menu active */}
                <span
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-md ${
                    isActive ? "bg-indigo-600" : "bg-transparent"
                  }`}
                />
                
                {/* Icon */}
                <span className="mr-1">{m.icon}</span>

                {/* Tên menu */}
                <span>{m.name}</span>
              </button>
            );
          })}
        </nav>

        {/* ✅ Nút đăng xuất */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowConfirm(true)}   // Hiện popup xác nhận
            className="w-full flex items-center gap-3 text-sm text-gray-700 hover:text-red-500 transition"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ✅ POPUP XÁC NHẬN ĐĂNG XUẤT */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999]">
          
          {/* Hộp xác nhận */}
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center animate-scaleIn">
            <h2 className="text-lg font-semibold mb-2">Xác nhận đăng xuất</h2>
            <p className="text-gray-600 mb-5">Bạn có chắc muốn thoát khỏi hệ thống?</p>

            <div className="flex justify-center gap-4">
              {/* ✅ Đăng xuất thật sự */}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Đăng xuất
              </button>

              {/* ✅ Đóng popup, không logout */}
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
    </>
  );
}
