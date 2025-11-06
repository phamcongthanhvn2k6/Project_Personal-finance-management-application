import axios from "axios";                 // 📦 Dùng axios để gọi API HTTP
import * as jose from "jose";              // 🔐 Thư viện dùng tạo & xác thực JWT
import type { Admin } from "../../types/Admin.type"; // 📄 Kiểu dữ liệu Admin

// ==========================
// 🔧 CẤU HÌNH TOKEN & SERVER
// ==========================

// ✅ URL API Server (lấy từ biến môi trường nếu có, nếu không sẽ dùng localhost)
const SERVER = import.meta.env.VITE_SV_HOST || "http://localhost:3001";

// ✅ Secret key dùng mã hóa JWT cho Admin
// (ưu tiên lấy từ biến môi trường, tránh bị lộ mã bí mật)
const SECRET_KEY = import.meta.env.VITE_ADMIN_JWT || "admin_secret_key";

// ✅ Chuyển chuỗi SECRET thành mảng byte để jose có thể sử dụng
const SECRET = new TextEncoder().encode(SECRET_KEY);


// ===================================
// ✅ HÀM TẠO TOKEN CHO ADMIN (JWT SIGN)
// ===================================

export async function createAdminToken(adminId: number) {
  return await new jose.SignJWT({ adminId })           // ✅ Payload chứa adminId
    .setProtectedHeader({ alg: "HS256" })              // ✅ Thuật toán mã hóa
    .setIssuedAt()                                     // ✅ Thời gian tạo token
    .setExpirationTime("2h")                           // ✅ Hết hạn sau 2 giờ
    .sign(SECRET);                                     // ✅ Ký token bằng SECRET
}


// ===================================
// ✅ HÀM GIẢI MÃ TOKEN ADMIN (VERIFY)
// ===================================

export async function decodeAdminToken(token: string) {
  try {
    // ✅ Kiểm tra token hợp lệ, không hết hạn và được ký đúng SECRET
    const { payload } = await jose.jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });
    return payload; // ✅ Trả về payload chứa adminId
  } catch {
    return null;    // ❌ Token sai / hết hạn => trả null
  }
}


// =======================
// ✅ ADMIN API LÀM VIỆC VỚI DB
// =======================

export const AdminApi = {

  // ✅ Đăng nhập Admin
  async signIn(
    email: string,
    password: string
  ): Promise<{ token: string; admin: Admin }> {

    // 🔍 Tìm admin theo email trong db.json
    const res = await axios.get(`${SERVER}/admins?email=${email}`);

    // ❌ Không tồn tại email
    if (res.data.length === 0)
      throw new Error("Không tìm thấy admin!");

    // ✅ Admin tồn tại → Lấy ra user
    const admin: Admin = res.data[0];

    // ❌ Mật khẩu sai
    if (admin.password !== password)
      throw new Error("Mật khẩu không chính xác!");

    // ✅ Tạo JWT token chứa adminId
    const token = await createAdminToken(admin.id);

    // ✅ Trả dữ liệu cho FE
    return { token, admin };
  },

  // ✅ Lấy thông tin admin theo ID
  async getById(id: number) {
    const res = await axios.get(`${SERVER}/admins/${id}`);
    return res.data; // ✅ Trả về thông tin admin
  },
};
