// 🧩 Import từ Redux Toolkit để tạo async thunk và slice
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// 🧠 Import User API và hàm giải mã token (JWT)
import { UserApi, decodeToken } from "../../apis/core/user.api";

// 🧾 Kiểu dữ liệu User (TypeScript)
import type { User } from "../../types/User.type";

/* eslint-disable @typescript-eslint/no-explicit-any */
// ⚙️ Tắt cảnh báo TypeScript cho trường hợp dùng `any` (ví dụ err: any)


/* ==========================
   1️⃣ ĐỊNH NGHĨA STATE AUTH
   - cấu trúc state dùng để quản lý auth trong Redux
========================== */
interface AuthState {
  user: User | null;     // 🔸 Thông tin người dùng hiện tại (null nếu chưa login)
  token: string | null;  // 🔸 JWT token (lưu khi login thành công)
  loading: boolean;      // 🔸 Cờ đang loading (dùng để hiển thị spinner, disable button...)
  error: string | null;  // 🔸 Thông báo lỗi (nếu có)
}

/* 🧱 Giá trị khởi tạo của state */
const initialState: AuthState = {
  user: null,                                 // Chưa có user đăng nhập
  token: localStorage.getItem("token") || null, // Nếu có token trong localStorage → giữ lại
  loading: false,                             // Ban đầu không đang tải
  error: null,                                // Ban đầu không lỗi
};


/* ==========================
   2️⃣ ASYNC ACTIONS (createAsyncThunk)
   - Các hành động bất đồng bộ (gọi API)
========================== */

/**
 * 🔹 login:
 * - Gọi UserApi.signIn(email, password)
 * - Nếu thành công lưu token + user vào localStorage
 * - Trả res (token + user) để reducer cập nhật state
 */
export const login = createAsyncThunk(
  "auth/login", // 👈 key action (dùng trong devtools/log)
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue } // 👈 helper để trả lỗi có cấu trúc về reducer
  ) => {
    try {
      // 📡 Gọi API đăng nhập (UserApi.signIn trả về { token, user })
      const res = await UserApi.signIn(email, password);

      // 💾 Lưu token & user vào localStorage để giữ session khi reload
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // ✅ Trả dữ liệu về cho reducer (fulfilled)
      return res;
    } catch (err: any) {
      // ❌ Trả lỗi có kiểm soát về reducer (rejected)
      return rejectWithValue(err.message);
    }
  }
);

/**
 * 🔹 fetchUserFromToken:
 * - Dùng khi trang reload hoặc app khởi tạo và token đã có sẵn trong localStorage
 * - Giải mã token để lấy userId → gọi API lấy user thực tế
 */
export const fetchUserFromToken = createAsyncThunk(
  "auth/fetchUserFromToken",
  async (token: string, { rejectWithValue }) => {
    try {
      // 🧩 Giải mã token (payload thường chứa userId)
      const payload = await decodeToken(token);

      // ❌ Nếu payload không đúng cấu trúc hoặc thiếu userId → báo lỗi
      if (!payload || !payload.userId) throw new Error("Token không hợp lệ!");

      // 📡 Lấy thông tin user từ DB bằng userId
      const user = await UserApi.getById(Number(payload.userId));

      // ✅ Trả về user cho reducer cập nhật state
      return user;
    } catch (err: any) {
      // ❌ Token sai / expired / lỗi mạng -> reject với lỗi message
      return rejectWithValue(err.message);
    }
  }
);


/* ==========================
   3️⃣ TẠO SLICE AUTH (reducers + extraReducers)
========================== */

const authSlice = createSlice({
  name: "auth",      // 🔖 Tên slice (dùng trong store)
  initialState,      // 🏁 Giá trị khởi tạo
  reducers: {
    /**
     * 🔴 logout:
     * - Xóa token và user khỏi Redux state
     * - Xóa dữ liệu liên quan trong localStorage
     */
    logout(state) {
      state.user = null;                    // Xóa user trong state
      state.token = null;                   // Xóa token trong state
      localStorage.removeItem("token");     // Xóa token trong localStorage
      localStorage.removeItem("user");      // Xóa user trong localStorage
      state.error = null;                   // Xóa lỗi (nếu có)
      state.loading = false;                // Reset loading
    },
  },

  /**
   * extraReducers xử lý lifecycle của các async thunk:
   * - pending: khi request bắt đầu
   * - fulfilled: khi request thành công
   * - rejected: khi request thất bại
   */
  extraReducers: (builder) => {
    builder
      /* ====== LOGIN ====== */
      .addCase(login.pending, (state) => {
        state.loading = true;    // Bật spinner / disable UI
        state.error = null;      // Xóa lỗi cũ
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;            // Dừng loading
        state.token = action.payload.token; // Lưu token vào state
        state.user = action.payload.user;   // Lưu user vào state
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;                 // Dừng loading
        state.error = action.payload as string; // Ghi lỗi để hiển thị
      })

      /* ====== FETCH USER FROM TOKEN ====== */
      .addCase(fetchUserFromToken.fulfilled, (state, action) => {
        // Khi decode token và lấy user thành công → cập nhật user
        state.user = action.payload;
      })
      .addCase(fetchUserFromToken.rejected, (state, action) => {
        // Nếu token sai hoặc hết hạn → lưu lỗi (bạn có thể gọi logout ở chỗ khác)
        state.error = action.payload as string;
      });
  },
});


/* ==========================
   4️⃣ EXPORT ACTIONS + REDUCER
========================== */

// ✅ Export action logout để component có thể dispatch(logout())
export const { logout } = authSlice.actions;

// ✅ Export reducer để combine vào store
export default authSlice.reducer;
