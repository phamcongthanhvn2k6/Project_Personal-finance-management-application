// ==========================
// 📦 IMPORT CÁC THƯ VIỆN CẦN THIẾT
// ==========================
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"; // 🧠 Công cụ để tạo slice và thunk trong Redux Toolkit
import { AdminApi, decodeAdminToken } from "../../apis/core/admin.api"; // 📡 Import API Admin + hàm giải mã token
import type { Admin } from "../../types/Admin.type"; // 🧩 Kiểu dữ liệu Admin để đảm bảo type an toàn
/* eslint-disable @typescript-eslint/no-explicit-any */ // 🧯 Tắt cảnh báo `any` để tiện cho thao tác với dữ liệu linh hoạt


// ==========================
// 🧱 ĐỊNH NGHĨA KIỂU STATE CHO ADMIN AUTH
// ==========================
interface AuthAdminState {
  admin: Admin | null;     // ✅ Lưu thông tin admin hiện tại
  token: string | null;    // 🔐 Token xác thực (JWT)
  loading: boolean;        // ⏳ Trạng thái đang tải (hiển thị khi đang gọi API)
  error: string | null;    // ❌ Lưu thông báo lỗi nếu có
}


// ==========================
// 🎯 GIÁ TRỊ BAN ĐẦU CHO STATE
// ==========================
const initialState: AuthAdminState = {
  admin: null,                                           // Chưa có admin nào đăng nhập
  token: localStorage.getItem("admin_token") || null,    // Nếu có token trong localStorage → giữ lại (đăng nhập sẵn)
  loading: false,                                        // Ban đầu không tải
  error: null,                                           // Không có lỗi
};


// ==========================
// 🔐 THUNK 1: ĐĂNG NHẬP ADMIN
// ==========================

export const adminLogin = createAsyncThunk(
  "authAdmin/login", // 🔖 Tên action trong Redux (dùng cho debug / devtools)
  async (
    { email, password }: { email: string; password: string }, // 🎯 Dữ liệu đầu vào
    { rejectWithValue }                                       // ❗ Hàm xử lý lỗi từ Redux Toolkit
  ) => {
    try {
      // 📡 Gọi API đăng nhập từ AdminApi
      const res = await AdminApi.signIn(email, password);

      // 💾 Lưu token và thông tin admin vào localStorage
      localStorage.setItem("admin_token", res.token);
      localStorage.setItem("admin", JSON.stringify(res.admin));

      // ✅ Trả về dữ liệu cho reducer
      return res;
    } catch (err: any) {
      // ❌ Trả về lỗi cho reducer nếu thất bại
      return rejectWithValue(err.message);
    }
  }
);


// ==========================
// 🧩 THUNK 2: LẤY ADMIN TỪ TOKEN
// ==========================

export const fetchAdminFromToken = createAsyncThunk(
  "authAdmin/fetchFromToken", // 🔖 Tên action
  async (token: string, { rejectWithValue }) => {
    try {
      // 🔍 Giải mã token (JWT) để lấy thông tin payload
      const payload = await decodeAdminToken(token);

      // ❌ Token sai hoặc hết hạn
      if (!payload || !payload.adminId)
        throw new Error("Token không hợp lệ!");

      // 📡 Lấy thông tin admin thực tế từ server theo ID
      const admin = await AdminApi.getById(Number(payload.adminId));

      // ✅ Trả về admin để cập nhật state
      return admin;
    } catch (err: any) {
      // ❌ Nếu lỗi, gửi thông báo lỗi về reducer
      return rejectWithValue(err.message);
    }
  }
);


// ==========================
// 🧠 SLICE CHÍNH QUẢN LÝ STATE ADMIN AUTH
// ==========================

const authAdminSlice = createSlice({
  name: "authAdmin", // 🔖 Tên slice
  initialState,      // 🏁 Giá trị khởi tạo
  reducers: {
    // 🚪 Đăng xuất Admin
    logoutAdmin(state) {
      state.admin = null;                  // Xóa thông tin admin
      state.token = null;                  // Xóa token
      localStorage.removeItem("admin_token"); // Xóa token trong localStorage
      localStorage.removeItem("admin");       // Xóa thông tin admin
    },
  },

  // ==========================
  // 🧩 XỬ LÝ ACTION TỪ ASYNC THUNK
  // ==========================
  extraReducers: (builder) => {
    builder
      // ⏳ Khi bắt đầu đăng nhập
      .addCase(adminLogin.pending, (s) => {
        s.loading = true;   // Đang tải
        s.error = null;     // Xóa lỗi cũ
      })

      // ✅ Đăng nhập thành công
      .addCase(adminLogin.fulfilled, (s, a) => {
        s.loading = false;        // Dừng tải
        s.admin = a.payload.admin; // Cập nhật admin vào state
        s.token = a.payload.token; // Lưu token vào state
      })

      // ❌ Đăng nhập thất bại
      .addCase(adminLogin.rejected, (s, a) => {
        s.loading = false;                // Dừng tải
        s.error = a.payload as string;    // Ghi lỗi
      })

      // ✅ Lấy admin từ token thành công
      .addCase(fetchAdminFromToken.fulfilled, (s, a) => {
        s.admin = a.payload; // Cập nhật thông tin admin vào state
      });
  },
});


// ==========================
// 🚀 EXPORT ACTIONS & REDUCER
// ==========================

// ✅ Action đăng xuất để dùng trong UI
export const { logoutAdmin } = authAdminSlice.actions;

// ✅ Reducer chính để combine vào store
export default authAdminSlice.reducer;
