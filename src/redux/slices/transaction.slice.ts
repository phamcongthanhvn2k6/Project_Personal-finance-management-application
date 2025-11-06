// src/redux/slices/transaction.slice.ts

// 🔧 IMPORT: Redux Toolkit
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { Apis } from "../../apis/index";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ✅ Định nghĩa cấu trúc Transaction
export interface Transaction {
  id: string;
  createdDate: string;
  total: number;
  description: string;
  categoryId: string;
  monthlyCategoryId: string;
}

// ✅ State của transaction slice
interface TransactionState {
  list: Transaction[];
  loading: boolean;
  error: string | null;
}

// ✅ State mặc định
const initialState: TransactionState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Lấy giao dịch theo monthlyCategoryId
export const fetchTransactions = createAsyncThunk(
  "transactions/fetch",
  async (monthlyCategoryId: string, { rejectWithValue }) => {
    try {
      return await Apis.transaction.getByMonthly(monthlyCategoryId);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// ✅ Thêm giao dịch mới
export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (payload: Omit<Transaction, "id">, { rejectWithValue }) => {
    try {
      return await Apis.transaction.create(payload);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// ✅ Xóa giao dịch theo ID
export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await Apis.transaction.remove(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

// ✅ Tạo Slice
const transactionSlice = createSlice({
  name: "transactions",
  initialState,

  // 🆕 reducers đồng bộ
  reducers: {
    // ✅ RESET giao dịch khi đổi tháng
    resetTransactions: (state) => {
      state.list = [];          // Xóa toàn bộ giao dịch cũ
      state.loading = false;    // Ngừng loading
      state.error = null;       // Xóa lỗi cũ
    },
  },

  // ✅ xử lý kết quả async Thunk
  extraReducers(builder) {
    builder
      // fetchTransactions pending
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // fetchTransactions fulfilled
      .addCase(
        fetchTransactions.fulfilled,
        (state, action: PayloadAction<Transaction[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )

      // addTransaction thành công → push vào list
      .addCase(
        addTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          state.list.push(action.payload);
        }
      )

      // deleteTransaction thành công → filter ra khỏi list
      .addCase(
        deleteTransaction.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.list = state.list.filter((t) => t.id !== action.payload);
        }
      );
  },
});

// ✅ Export action để dùng khi đổi tháng
export const { resetTransactions } = transactionSlice.actions;

// ✅ Export reducer để đưa vào store
export default transactionSlice.reducer;
