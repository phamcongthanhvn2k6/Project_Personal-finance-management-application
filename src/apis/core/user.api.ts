import axios from "axios";
import * as jose from "jose";
import type { User } from "../../types/User.type";

/* ========================
   🔧 CẤU HÌNH MÔI TRƯỜNG
   - Lấy URL server và JWT secret từ file .env
   - Nếu không có .env thì fallback vào default
======================== */

const SERVER = import.meta.env.VITE_SV_HOST || "http://localhost:3001";
// 🔑 SECRET_KEY dùng để mã hóa JWT, lấy từ .env, nếu thiếu dùng chuỗi dự phòng
const SECRET_KEY = import.meta.env.VITE_JWT_TOKEN || "fallback_secret_key";
// Mã hóa chuỗi secret sang dạng Uint8Array để jose sử dụng
const SECRET = new TextEncoder().encode(SECRET_KEY);

/* ========================
   🔐 JWT TOKEN FUNCTIONS
======================== */

/**
 * ✅ Tạo JWT Token khi người dùng đăng nhập thành công
 * - payload chứa userId
 * - thuật toán HS256
 * - thời gian hết hạn 2 giờ
 */
export async function createToken(userId: number) {
  if (!SECRET || SECRET.length === 0) throw new Error("SECRET key is missing!");

  return await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" }) // Định nghĩa thuật toán mã hóa
    .setIssuedAt()                        // Set thời gian tạo token
    .setExpirationTime("2h")              // Token hết hạn sau 2 tiếng
    .sign(SECRET);                        // Ký bằng key
}

/**
 * ✅ Giải mã token gửi từ client
 * - kiểm tra token hợp lệ hay hết hạn
 * - nếu lỗi → return null
 */
export async function decodeToken(token: string) {
  if (!token) throw new Error("Token is empty!");
  if (!SECRET || SECRET.length === 0) throw new Error("SECRET key is missing!");

  try {
    const { payload } = await jose.jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });
    return payload; // trả về { userId: ... }
  } catch (err) {
    console.error("Invalid or expired token:", err);
    return null;
  }
}

/* ========================
   👤 USER API FUNCTIONS
======================== */
export const UserApi = {
  /**
   * ✅ Đăng nhập
   * - Check email tồn tại
   * - Check mật khẩu đúng
   * - Nếu đúng → tạo token JWT và trả user + token
   */
  async signIn(email: string, password: string): Promise<{ token: string; user: User }> {
    // Tìm user theo email
    const res = await axios.get(`${SERVER}/users?email=${email}`);
    if (res.data.length === 0) throw new Error("Không tìm thấy người dùng!");

    const user: User = res.data[0];

    // So sánh mật khẩu
    if (user.password !== password) throw new Error("Mật khẩu không chính xác!");
    if( user.status === false) throw new Error("Người Dùng Đã Bị Chặn");
    // ✅ Mật khẩu OK → tạo token chứa userId
    const token = await createToken(user.id);

    return { token, user };
  },

  /**
   * ✅ Đăng ký
   * - Kiểm tra email trùng
   * - Nếu không trùng → tạo user mới
   */
  async signUp(userData: Partial<User>) {
    const exist = await axios.get(`${SERVER}/users?email=${userData.email}`);
    if (exist.data.length > 0) throw new Error("Email đã tồn tại!");

    // Tạo object user đầy đủ
    const newUser: User = {
      id: Date.now(),              // Fake ID trên json-server
      fullName: userData.fullName || "New User",
      email: userData.email || "",
      password: userData.password || "",
      phone: userData.phone || "",
      gender: userData.gender || false,
      status: true,
    };

    // Gửi request thêm user
    const res = await axios.post(`${SERVER}/users`, newUser);
    return res.data;
  },

  /**
   * ✅ Lấy user theo ID
   */
  async getById(id: number) {
    const res = await axios.get(`${SERVER}/users/${id}`);
    return res.data;
  },

  /**
   * ✅ Lấy tất cả user
   */
  async getAll() {
    const res = await axios.get(`${SERVER}/users`);
    return res.data;
  },

  /**
   * ✅ Lấy user theo email
   */
  async getByEmail(email: string) {
    const res = await axios.get(`${SERVER}/users?email=${email}`);
    return res.data.length > 0 ? res.data[0] : null;
  },

  /**
   * ✅ Cập nhật thông tin user (PATCH)
   */
  async update(id: number | string, data: Partial<User>) {
    const res = await axios.patch(`${SERVER}/users/${id}`, data);
    return res.data;
  },

  /**
   * ✅ Xoá user theo ID
   */
  async remove(id: number | string) {
    const res = await axios.delete(`${SERVER}/users/${id}`);
    return res.data;
  },

  /**
   * ✅ Cập nhật thông tin cá nhân (Profile)
   * - cách tách biệt, giúp code rõ ràng hơn
   */
  async updateUserInfo(id: number, data: Partial<User>) {
    const res = await axios.patch(`${SERVER}/users/${id}`, data);
    return res.data;
  },
};
