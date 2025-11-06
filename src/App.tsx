// 🧩 Import các hook và thành phần cần thiết 
import { useEffect } from "react";
import RouterSetup from "./RouterSetup"; // Cấu hình tất cả route của ứng dụng
import { decodeToken } from "./apis/core/user.api"; // Hàm giải mã JWT token
import { useNavigate, useLocation } from "react-router-dom"; // Dùng để điều hướng & lấy URL hiện tại
import { useDispatch } from "react-redux";
import { fetchUserFromToken, logout } from "./redux/slices/authSlice"; // Action của Redux
import type { AppDispatch } from "./redux/store"; // Kiểu dispatch cho TypeScript

// 🧱 Component chính của toàn ứng dụng người dùng
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // 🚫 Chặn người dùng (user) cố vào route admin
    if (location.pathname.startsWith("/admin")) {
      navigate("/"); // hoặc navigate("/signin");
      return;
    }

    // 🔹 Lấy token từ localStorage (nếu có)
    const token = localStorage.getItem("token");

    // 🔹 Danh sách các route “công khai” (không cần đăng nhập)
    const publicRoutes = ["/signin", "/signup", "/forgot-password"];

    // 🟡 Nếu người dùng đang ở 1 trong các route công khai → bỏ qua kiểm tra
    if (publicRoutes.includes(location.pathname)) return;

    // ❌ Nếu KHÔNG có token → ép về trang đăng nhập
    if (!token) {
      navigate("/signin");
      return;
    }

    // ✅ Nếu có token → kiểm tra tính hợp lệ
    const verifyToken = async () => {
      const payload = await decodeToken(token);

      if (!payload || !payload.exp || payload.exp * 1000 < Date.now()) {
        dispatch(logout());
        navigate("/signin");
      } else {
        dispatch(fetchUserFromToken(token));
      }
    };

    verifyToken();
  }, [dispatch, navigate, location.pathname]);

  return (
    <div>
      {/* RouterSetup định nghĩa route của người dùng như /signin, /signup, /home, ... */}
      <RouterSetup />
    </div>
  );
}

export default App;
