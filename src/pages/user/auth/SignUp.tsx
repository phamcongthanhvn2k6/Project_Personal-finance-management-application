import { useState } from "react";
import { useNavigate } from "react-router-dom";
import background from "../../../assets/background.png";
import { Apis } from "../../../apis"; // 🌐 Import object chứa các API (userApi, categoryApi,...)

/**
 * ✅ SIGN UP COMPONENT
 *  - Cho phép người dùng tạo tài khoản mới
 *  - Có validate ở client
 *  - Gọi API để lưu người dùng vào database (db.json hoặc backend)
 */
export default function SignUp() {
  // 🧭 Hook điều hướng sau khi đăng ký thành công
  const navigate = useNavigate();

  /**
   * 🧩 State quản lý dữ liệu trong input
   *  - Mỗi property đại diện cho 1 field trong form
   */
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });

  /**
   * ⚠️ State chứa lỗi từng field
   *  - errors.fullName -> lỗi họ tên
   *  - errors.email -> lỗi email
   *  - errors.global -> lỗi chung khi gọi API
   */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * ✅ Khi đăng ký thành công → success = true
   *  - Show dòng "Sign Up Successfully ✅"
   */
  const [success, setSuccess] = useState(false);

  /**
   * ⏳ loading = true khi đang gửi API
   *  - Dùng để tắt button, hiển thị text "Signing Up..."
   */
  const [loading, setLoading] = useState(false);

  /**
   * ✅ Hàm validate dữ liệu form trước khi gửi lên API
   *  - Trả về object chứa lỗi
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Họ tên bắt buộc nhập
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required!";

    // Email bắt buộc và phải đúng format
    if (!form.email.trim()) newErrors.email = "Email is required!";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format!";

    // Password bắt buộc, phải tối thiểu 6 ký tự
    if (!form.password.trim()) newErrors.password = "Password is required!";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters!";

    // confirmPassword bắt buộc và phải trùng password
    if (!form.confirmPassword.trim())
      newErrors.confirmPassword = "Please confirm your password!";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match!";

    return newErrors;
  };

  /**
   * 🖱️ Xử lý khi người dùng bấm "Sign Up"
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ❌ Ngăn reload trang mặc định của form

    setErrors({}); // Reset lỗi cũ

    // ✅ Kiểm tra dữ liệu input
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors); // Có lỗi → hiển thị lỗi
      return;
    }

    try {
      setLoading(true); // Bật trạng thái loading

      /**
       * ✅ Kiểm tra email trùng
       *  - Gọi API tìm user với email nhập vào
       *  - Nếu đã tồn tại → báo lỗi và dừng xử lý
       */
      const exist = await Apis.user.getByEmail(form.email);
      if (exist) {
        setErrors({ email: "Email already exists!" });
        setLoading(false);
        return;
      }

      /**
       * ✅ Tạo object user mới
       *  - id sinh tạm bằng timestamp (Date.now)
       *  - gender, status gán mặc định (có thể mở rộng về sau)
       */
      const newUser = {
        id: Date.now(),
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || "Unknown",
        gender: true,
        status: true,
      };

      // 🚀 Gửi dữ liệu user lên server để lưu
      await Apis.user.signUp(newUser);

      // ✅ Thành công → bật success
      setSuccess(true);
      setLoading(false);

      // ✅ Điều hướng sang trang đăng nhập sau 1 giây
      setTimeout(() => navigate("/signin"), 1000);
      navigate("/signin");
    } catch (err) {
      console.error(err);
      setErrors({ global: "Error while signing up!" }); // lỗi chung
      setLoading(false);
    }
  };

  // ✅ JSX giao diện
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${background})` }} // Ảnh nền toàn màn hình
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-96 relative">
        {/* Tiêu đề */}
        <h1 className="text-center text-2xl font-bold mb-4">Sign Up</h1>

        {/* ✅ Thông báo đăng ký thành công */}
        {success && (
          <p className="text-center text-green-600 font-semibold animate-bounce mt-3">
            Sign Up Successfully ✅
          </p>
        )}

        {/* ❌ Lỗi tổng (ví dụ lỗi server) */}
        {errors.global && (
          <p className="text-red-500 text-center mb-3">{errors.global}</p>
        )}

        {/* ✅ FORM INPUT */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* HỌ TÊN */}
          <div>
            <input
              type="text"
              placeholder="Full name..."
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-500"
              }`}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              type="email"
              placeholder="Email here..."
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-500"
              }`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* MẬT KHẨU */}
          <div>
            <input
              type="password"
              placeholder="Password here..."
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-500"
              }`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* XÁC NHẬN MẬT KHẨU */}
          <div>
            <input
              type="password"
              placeholder="Confirm password here..."
              className={`w-full border p-2 rounded focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-500"
              }`}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* BUTTON SUBMIT */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
            disabled={loading} // Tắt nút khi đang đăng ký
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* LIÊN KẾT CHUYỂN SANG ĐĂNG NHẬP */}
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/signin" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
