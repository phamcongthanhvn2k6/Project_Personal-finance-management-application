// 🧩 Import Redux Toolkit
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// 🧠 Import các hàm gọi API xử lý dữ liệu người dùng
import { UserApi } from "../../apis/core/user.api";
import type { User } from "../../types/User.type";

/* ===================================================
   1️⃣ CÁC HÀNH ĐỘNG BẤT ĐỒNG BỘ (ASYNC ACTIONS)
=================================================== */

/**
 * 🔹 Lấy toàn bộ danh sách người dùng từ server (db.json)
 * - Dùng trong trang quản lý (AdminUserManager)
 * - Gọi UserApi.getAll()
 */
export const fetchUsers = createAsyncThunk("user/fetchAll", async () => {
  const res = await UserApi.getAll();
  return res;
});

/**
 * 🔹 Cập nhật thông tin người dùng hiện tại
 * - Gọi PATCH tới `/users/:id`
 * - Dùng cho trang Hồ sơ cá nhân (ProfileSection + ChangeInfoModal)
 */
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async ({ id, data }: { id: number; data: Partial<User> }) => {
    const updated = await UserApi.updateUserInfo(id, data);
    return updated;
  }
);

/**
 * 🔹 Bật/tắt trạng thái hoạt động (status) của người dùng
 * - Nhận vào id người dùng
 * - Lấy thông tin hiện tại, sau đó đảo ngược trạng thái status
 * - Cập nhật lại server qua UserApi.update()
 */
export const toggleUserStatus = createAsyncThunk(
  "user/toggleStatus",
  async (id: number) => {
    const user = await UserApi.getById(id);
    const updated = await UserApi.update(id, { status: !user.status });
    return updated;
  }
);

/**
 * 🔹 Xóa người dùng khỏi hệ thống
 * - Gọi API DELETE tới `/users/:id`
 * - Trả về id để reducer loại bỏ user khỏi danh sách
 */
export const deleteUser = createAsyncThunk("user/delete", async (id: number) => {
  await UserApi.remove(id);
  return id; // để Redux filter ra khỏi danh sách
});

/* ===================================================
   2️⃣ KHAI BÁO KIỂU DỮ LIỆU
=================================================== */

interface UserState {
  users: User[]; // Danh sách người dùng
  loading: boolean;
  error: string | null;
}

/* ===================================================
   3️⃣ TRẠNG THÁI BAN ĐẦU
=================================================== */

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

/* ===================================================
   4️⃣ TẠO SLICE USER (GỒM REDUCER + EXTRA REDUCERS)
=================================================== */

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ===== 🟢 FETCH USERS ===== */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Không thể tải danh sách người dùng!";
      })

      /* ===== 🟡 UPDATE PROFILE ===== */
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        // ✅ Cập nhật trong danh sách nếu có
        const idx = state.users.findIndex((u) => u.id === updatedUser.id);
        if (idx !== -1) {
          state.users[idx] = updatedUser;
        }

        // ✅ Đồng bộ thông tin user trong localStorage (không thay token)
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        if (auth?.user && auth.user.id === updatedUser.id) {
          auth.user = updatedUser;
          localStorage.setItem("auth", JSON.stringify(auth));
        }
      })

      /* ===== 🟡 TOGGLE STATUS ===== */
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
      })

      /* ===== 🔴 DELETE USER ===== */
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

/* ===================================================
   5️⃣ EXPORT RA NGOÀI
=================================================== */

export default userSlice.reducer;
