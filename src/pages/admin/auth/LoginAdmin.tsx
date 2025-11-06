import { useEffect, useState } from "react"; 
// ✅ useEffect: xử lý side effects (check đăng nhập, redirect)
// ✅ useState: quản lý state cục bộ của form

import { useDispatch, useSelector } from "react-redux";
// ✅ useDispatch: dùng để dispatch action Redux
// ✅ useSelector: lấy state từ Redux store (authAdmin)

import { useNavigate } from "react-router-dom";
// ✅ useNavigate: điều hướng sang trang khác sau khi login thành công

import { adminLogin } from "../../../redux/slices/authSliceAdmin";
// ✅ action async (createAsyncThunk) để login admin

import type { RootState, AppDispatch } from "../../../redux/store";
// ✅ AppDispatch: kiểu cho dispatch (hỗ trợ gợi ý parameters)
// ✅ RootState: kiểu cho useSelector giúp tránh lỗi sai kiểu dữ liệu

import "../../../index.css"; 
// ✅ chứa animation như @keyframes animate-shake hoặc fadeIn


// ✅ Component LoginAdmin
export default function LoginAdmin() {

  // ✅ Dispatch được khai đúng kiểu để khi gọi dispatch(adminLogin()) có gợi ý TypeScript
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Điều hướng sang dashboard khi đăng nhập thành công
  const navigate = useNavigate();

  // ✅ Lấy state từ Redux Slice authAdmin
  const { loading, admin } = useSelector((s: RootState) => s.authAdmin);
  // loading: true khi đang xử lý login
  // admin: object của admin sau khi login thành công

  // ✅ State form: email + password
  const [form, setForm] = useState({ email: "", password: "" });

  // ✅ touched giúp highlight input lỗi chỉ khi người dùng đã chạm vào
  const [touched, setTouched] = useState({ email: false, password: false });

  // ✅ message + messageType dùng để hiển thị thông báo khi login success/fail
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  // ✅ Nếu admin ở Redux store đã có (login thành công):
  // ✅ hiển thị thông báo + redirect sau 1 giây
  useEffect(() => {
    if (admin) {
      setMessage("✅ Login successful! Redirecting...");
      setMessageType("success");

      // ✅ Chờ 1 giây rồi điều hướng sang trang dashboard
      const timer = setTimeout(() => navigate("/admin/dashboard"), 1000);

      return () => clearTimeout(timer); // tránh memory leak khi unmount
    }
  }, [admin, navigate]);


  // ✅ Khi bấm nút Login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // chặn reload trang mặc định của form

    // ✅ Check trống email và password → highlight lỗi
    if (!form.email || !form.password) {
      setTouched({ email: true, password: true });
      return;
    }

    // ✅ Dispatch async thunk để login
    dispatch(adminLogin(form))
      .unwrap()          // 🔥 unwrap() giúp catch trực tiếp .then / .catch theo Promise
      .then(() => {
        // ✅ Thành công
        setMessage("✅ Login successful! Redirecting...");
        setMessageType("success");

        setTimeout(() => navigate("/admin/dashboard"), 1000);
      })
      .catch(() => {
        // ❌ Sai email hoặc password
        setMessage("❌ Incorrect email or password.");
        setMessageType("error");
      });
  };

  // ✅ Boolean kiểm tra input có lỗi hay không
  const emailError = touched.email && !form.email;
  const passwordError = touched.password && !form.password;


  // ✅ JSX UI
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {/* Form chính */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md animate-fadeIn"
      >
        {/* Header */}
        <h2 className="text-4xl font-bold text-center mb-1 font-poppins">
          Financial <span className="text-indigo-600">Manager</span>
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Please sign in as administrator
        </p>

        {/* Hiển thị thông báo trạng thái login */}
        {message && (
          <p
            className={`text-center text-sm mb-4 font-medium transition-all duration-300 ${
              messageType === "success"
                ? "text-green-600"
                : messageType === "error"
                ? "text-red-500"
                : ""
            }`}
          >
            {message}
          </p>
        )}

        {/* INPUT EMAIL */}
        <div className="mb-5">
          <input
            type="email"
            placeholder="Please enter your admin email..."
            className={`w-full rounded-lg p-3 bg-gray-50 border outline-none transition-all duration-200 ${
              emailError
                ? "border-red-500 placeholder-red-400 animate-shake"  // ❌ lỗi → viền đỏ + lắc input
                : "border-gray-300 focus:ring-2 focus:ring-indigo-500" // ✅ hợp lệ → hiệu ứng focus đẹp
            }`}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} // cập nhật state
            onBlur={() => setTouched({ ...touched, email: true })}       // đánh dấu đã chạm
          />

          {/* Text báo lỗi dưới input */}
          {emailError && (
            <p className="text-red-500 text-xs mt-1">
              Please enter your email.
            </p>
          )}
        </div>

        {/* INPUT PASSWORD */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Please enter your password..."
            className={`w-full rounded-lg p-3 bg-gray-50 border outline-none transition-all duration-200 ${
              passwordError
                ? "border-red-500 placeholder-red-400 animate-shake"
                : "border-gray-300 focus:ring-2 focus:ring-indigo-500"
            }`}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onBlur={() => setTouched({ ...touched, password: true })}
          />

          {/* Text báo lỗi */}
          {passwordError && (
            <p className="text-red-500 text-xs mt-1">
              Please enter your password.
            </p>
          )}
        </div>

        {/* NÚT SUBMIT */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading} // ✅ khóa nút khi đang login
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 - Admin Control Panel
        </p>
      </form>
    </div>
  );
}
