// 🧩 Import hook và hàm cần thiết
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { decodeAdminToken } from "./apis/core/admin.api"; // ✅ hàm giải mã token admin
import { fetchAdminFromToken, logoutAdmin } from "./redux/slices/authSliceAdmin"; // ✅ redux actions
import type { AppDispatch } from "./redux/store";
import RouterSetupAdmin from "./RouterSetupAdmin"; // ✅ router riêng của admin

export default function AppAdmin() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 🧾 Lấy token của admin từ localStorage
    const token = localStorage.getItem("admin_token");

    // ✅ Các route công khai (không cần đăng nhập)
    const publicRoutes = ["/admin/login"];

    // 🟡 Nếu là route công khai thì bỏ qua
    if (publicRoutes.includes(location.pathname)) return;

    // ❌ Nếu chưa có token → ép về trang login admin
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // ✅ Nếu có token → kiểm tra tính hợp lệ
    const verifyAdminToken = async () => {
      const payload = await decodeAdminToken(token);

      // 📅 Kiểm tra token hết hạn hay không hợp lệ
      if (!payload || !payload.exp || payload.exp * 1000 < Date.now()) {
        // ❌ Token sai hoặc hết hạn
        dispatch(logoutAdmin());
        navigate("/admin/login");
      } else {
        // ✅ Token hợp lệ → Lấy thông tin admin theo ID
        dispatch(fetchAdminFromToken(token));
      }
    };

    verifyAdminToken();
  }, [dispatch, navigate, location.pathname]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🚀 Toàn bộ route dành cho admin */}
      <RouterSetupAdmin />
    </div>
  );
}
