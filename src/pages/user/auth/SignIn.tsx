import { useState } from "react";
import { useNavigate } from "react-router-dom";
import background from "../../../assets/background.png";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { login } from "../../../redux/slices/authSlice";

/**
 * SignIn.tsx
 * - Trang đăng nhập người dùng (client-side)
 * - File này đã được chú thích rất chi tiết từng phần để bạn hiểu rõ luồng dữ liệu,
 *   validation, interaction với Redux (thunk login), và điều hướng (react-router).
 */

/* ==========================
   🎯 Component chính: SignIn
   ========================== */
export default function SignIn() {
  // ====== Redux dispatch ======
  // AppDispatch là kiểu dispatch đã cấu hình trong store (để hỗ trợ async thunk)
  const dispatch = useDispatch<AppDispatch>();

  // ====== Router navigation ======
  // useNavigate dùng để chuyển trang sau khi đăng nhập thành công
  const navigate = useNavigate();

  // ====== Lấy trạng thái auth từ Redux ======
  // loading: true khi login đang chạy
  // error: chuỗi lỗi do login thunk trả về (nếu có)
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // ====== Local form state ======
  // form: lưu email + password hiện tại
  const [form, setForm] = useState({ email: "", password: "" });

  // ====== Validation errors ======
  // errors có thể chứa:
  // - errors.email, errors.password: lỗi validate từng field
  // - errors.global: lỗi chung (ví dụ: sai mật khẩu)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ====== Success flag ======
  // Khi login thành công sẽ set true để show thông báo nhỏ
  const [success, setSuccess] = useState(false);

  /* ==========================
     🔎 Hàm validateForm (client-side)
     - Trả về object lỗi (empty nếu hợp lệ)
     - Việc validate giúp UX tốt hơn: người dùng biết thiếu gì trước khi gửi lên server
     ========================== */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // ---- Email: bắt buộc + định dạng cơ bản ----
    if (!form.email.trim()) {
      newErrors.email = "Email is required!";
    } else {
      // Regex đơn cho email (không quá khắt khe nhưng đủ cho hầu hết trường hợp)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Invalid email format!";
      }
    }

    // ---- Password: bắt buộc ----
    if (!form.password.trim()) {
      newErrors.password = "Password is required!";
    }

    return newErrors;
  };

  /* ==========================
     ✳️ handleSubmit
     - Ngăn form reload trang (preventDefault)
     - Validate phía client
     - Gọi redux thunk `login({email, password})`
       + Khi thunk fulfilled -> điều hướng
       + Khi thunk rejected -> đặt lỗi global để hiển thị
     - Sử dụng async/await để xử lý kết quả action trả về
     ========================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ngăn reload trang

    // reset lỗi trước khi validate / submit
    setErrors({});

    // validate local
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      // Nếu có lỗi validate -> hiển thị và dừng xử lý
      setErrors(formErrors);
      return;
    }

    // Gửi action login lên Redux (thunk) — trả về một action result
    // Nếu bạn dùng .unwrap() thì sẽ ném lỗi trực tiếp; ở đây chúng ta kiểm tra kết quả bằng match
    const result = await dispatch(login({ email: form.email, password: form.password }));

    // Kiểm tra action result: fulfilled hay rejected
    // login.fulfilled.match(result) là cách an toàn để kiểm tra kiểu action trả về
    if (login.fulfilled.match(result)) {
      // ✅ Đăng nhập thành công:
      setSuccess(true); // show message thành công
      // Option: bạn có thể lưu thêm state, gọi API lấy profile... ở đây đơn giản redirect
      setTimeout(() => navigate("/"), 1000); // delay nhỏ cho UX
    } else {
      // ❌ Đăng nhập thất bại:
      // result.payload thường chứa thông tin lỗi từ rejectWithValue
      const payloadMessage = (result.payload as string) || "Login failed!";
      setErrors({ global: payloadMessage });
    }
  };

  /* ==========================
     🧩 Render JSX
     - Background ảnh (tùy chỉnh bằng import)
     - Form có validation inline (hiển thị lỗi ngay dưới input)
     - Nút bị disable khi loading để tránh double submit
     ========================== */
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${background})` }} // ảnh nền, cover toàn màn hình
    >
      {/* Container form: mờ nhẹ (bg-opacity) để thấy background */}
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-96 relative">
        {/* Tiêu đề */}
        <h1 className="text-center text-2xl font-bold mb-4">🔐 Sign In</h1>

        {/* Thông báo thành công */}
        {success && (
          <p className="text-center text-green-600 font-semibold animate-bounce mt-3">
            Sign In Successfully ✅
          </p>
        )}

        {/* Hiển thị lỗi: ưu tiên lỗi global (server) nếu có, nếu không hiển thị lỗi validate */}
        {(error || errors.global) && (
          <p className="text-red-500 text-center mb-3">
            {errors.global || error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* ---------- Email input ---------- */}
          <div>
            <input
              type="email"
              placeholder="Email here..."
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                // Nếu có lỗi email -> viền đỏ + ring đỏ, ngược lại ring xanh nhẹ
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-500"
              }`}
            />
            {/* Hiện lỗi validate email ngay dưới input */}
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* ---------- Password input ---------- */}
          <div>
            <input
              type="password"
              placeholder="Password here..."
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-500"
              }`}
            />
            {/* Hiện lỗi validate password */}
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* ---------- Submit button ---------- */}
          <button
            type="submit"
            className="w-full bg-[#4F46E5] text-white p-2 rounded hover:bg-[#1308f2] transition"
            disabled={loading} // disable khi đang xử lý login
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Link chuyển sang trang Sign Up */}
        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
