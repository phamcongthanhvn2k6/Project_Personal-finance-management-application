import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import LoginAdmin from "./pages/admin/auth/LoginAdmin";
import AdminDashboard from "./pages/admin/AdminDashBoard";
import type { JSX } from "react";
import AdminUserManager from "./pages/admin/AdminUserManager";
import AdminCategoryManager from "./pages/admin/AdminCategoryManager";
/* 🛡️ Protected Route cho Admin */
function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const { token } = useSelector((state: RootState) => state.authAdmin);
  return token ? children : <Navigate to="/admin/login" replace />;
}

/* 🚀 Router dành riêng cho hệ thống Admin */
export default function RouterSetupAdmin() {
  return (
    <Routes>
      {/* ✅ chỉ viết 'login' vì đang nằm dưới /admin/* */}
      <Route path="login" element={<LoginAdmin />} />

      <Route path="dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />

    <Route path="users-manager"
        element={
          <ProtectedAdminRoute>
            <AdminUserManager />
          </ProtectedAdminRoute>
        }
      />

      <Route path="category-manager"
        element={
          <ProtectedAdminRoute>
            <AdminCategoryManager />
          </ProtectedAdminRoute>
        }
      />

      {/* 🔁 Nếu route sai → về /admin/login */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
