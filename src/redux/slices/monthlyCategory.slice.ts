// 🧩 Import Redux Toolkit và Apis tổng hợp
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { Apis } from "../../apis"; // ✅ Dùng để gọi API monthlyCategory, user, transaction...
/* eslint-disable @typescript-eslint/no-explicit-any */
// Cho phép dùng `any` trong phần catch lỗi cho nhẹ nhàng khi dev


/* =========================================================
    1️⃣ DEFINING DATA TYPES (ĐỊNH NGHĨA KIỂU DỮ LIỆU)
========================================================= */

// ✅ Mỗi bản ghi monthlyCategory đại diện một "tháng" của user
export interface MonthlyCategory {
  id: string;          // ID trong database
  month: string;       // Tháng dạng YYYY-MM
  balence: number;     // Số tiền còn lại / nguồn thu
  userId: number;      // Thuộc về user nào
  categories: any[];   // Danh sách category con thuộc tháng này
}

// ✅ Kiểu quản lý state của Redux Slice
interface MonthlyCategoryState {
  list: MonthlyCategory[]; // Mảng các tháng của user
  loading: boolean;        // true khi đang gọi API
  error: string | null;    // Lưu lỗi khi request fail
}


/* =========================================================
    2️⃣ INITIAL STATE (TRẠNG THÁI BAN ĐẦU)
========================================================= */

const initialState: MonthlyCategoryState = {
  list: [],         // Chưa có dữ liệu tháng nào
  loading: false,   // Không đang load gì cả
  error: null,      // Chưa có lỗi
};


/* =========================================================
    3️⃣ ASYNC THUNKS (GỌI API BẤT ĐỒNG BỘ)
========================================================= */

/**
 * ✅ LẤY TẤT CẢ THÁNG THEO USER ID
 * Dùng khi user đăng nhập hoặc reload trang
 */
export const fetchMonthlyCategories = createAsyncThunk(
  "monthlyCategory/fetch", // tên action hiển thị trong Redux DevTool
  async (userId: number, { rejectWithValue }) => {
    try {
      const data = await Apis.monthlyCategory.getByUser(userId); // Gọi API lấy tất cả tháng của user
      return data; // Trả về dữ liệu để đẩy vào reducer
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


/**
 * ✅ UPSERT THÁNG
 * - Nếu user + month đã tồn tại → UPDATE
 * - Nếu chưa tồn tại → CREATE
 */
export const upsertMonthlyCategory = createAsyncThunk(
  "monthlyCategory/upsert",
  async (
    { userId, month, balence }: { userId: number; month: string; balence: number },
    { rejectWithValue }
  ) => {
    try {
      // 1️⃣ Kiểm tra xem bản ghi tháng này đã tồn tại chưa
      const existing = await Apis.monthlyCategory.getByUserAndMonth(userId, month);

      if (existing) {
        // ✅ Nếu tồn tại → UPDATE
        const updated = await Apis.monthlyCategory.update(existing.id, { balence });
        return updated; // đưa dữ liệu trả về redux
      }

      // ✅ Nếu không tồn tại → CREATE mới
      const newRecord = await Apis.monthlyCategory.create({
        userId,
        month,
        balence,
        categories: [], // mặc định rỗng
      });

      return newRecord;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


/* =========================================================
    ✅ ✅ ACTION MỚI — RESET MONTHLY CATEGORIES
    Dùng khi đổi tháng, đổi user → tránh dữ liệu cũ dính vào UI
========================================================= */

const monthlyCategorySlice = createSlice({
  name: "monthlyCategory",
  initialState,

  reducers: {
    // ✅ Xóa sạch dữ liệu cũ trong state
    resetMonthlyCategories: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* -------- FETCH MONTHLY -------- */
      .addCase(fetchMonthlyCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMonthlyCategories.fulfilled, (state, action: PayloadAction<MonthlyCategory[]>) => {
        state.loading = false;
        state.list = action.payload; // Ghi đè list bằng dữ liệu mới
      })

      .addCase(fetchMonthlyCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      /* -------- UPSERT MONTHLY -------- */
      .addCase(upsertMonthlyCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(upsertMonthlyCategory.fulfilled, (state, action: PayloadAction<MonthlyCategory>) => {
        state.loading = false;
        
        // Tìm trong list xem tháng này đã tồn tại chưa
        const index = state.list.findIndex((m) => m.id === action.payload.id);

        if (index !== -1) {
          // ✅ Nếu có → UPDATE tại chỗ
          state.list[index] = action.payload;
        } else {
          // ✅ Nếu chưa có → PUSH vào mảng
          state.list.push(action.payload);
        }
      })

      .addCase(upsertMonthlyCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});


// ✅ EXPORT ACTION MỚI
export const { resetMonthlyCategories } = monthlyCategorySlice.actions;

// ✅ EXPORT REDUCER CHO STORE
export default monthlyCategorySlice.reducer;
