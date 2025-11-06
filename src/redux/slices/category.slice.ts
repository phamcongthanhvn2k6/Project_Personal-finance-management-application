// ✅ Import createAsyncThunk: dùng để tạo action bất đồng bộ
// ✅ Import createSlice: tạo slice Redux
// ✅ Import PayloadAction: định nghĩa kiểu dữ liệu cho actions
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ✅ Import Apis để gọi API server
import { Apis } from "../../apis";

/* eslint-disable @typescript-eslint/no-explicit-any */
// ✅ Tạm tắt cảnh báo TypeScript cho kiểu `any`


/* =====================================================
   🧾 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU CATEGORY
===================================================== */

// ✅ Mỗi Category sẽ có cấu trúc thế này
export interface Category {
  id: number;         // ID của danh mục
  name: string;       // Tên danh mục
  imageUrl: string;   // Link hình ảnh
  status: boolean;    // Trạng thái (true: hiện, false: ẩn)
}

// ✅ Kiểu dữ liệu cho Redux state
interface CategoryState {
  categories: Category[];        // Danh sách tất cả category
  loading: boolean;              // Trạng thái loading (đang gọi API)
  error: string | null;          // Lỗi nếu có
  openModal: boolean;            // Trạng thái mở modal thêm/sửa
  currentCategory: Category | null; // Lưu category đang sửa
}

// ✅ State mặc định ban đầu
const initialState: CategoryState = {
  categories: [],        // Mặc định chưa có dữ liệu
  loading: false,
  error: null,
  openModal: false,      // Modal đang đóng
  currentCategory: null, // Không có category nào đang sửa
};


/* =====================================================
   🧩 2. ASYNC THUNKS (GỌI API)
===================================================== */

/**
 * ✅ fetchCategories
 * → API: GET /categories
 * → Lấy toàn bộ danh mục từ server
 */
export const fetchCategories = createAsyncThunk(
  "category/fetchAll",            // 👈 Tên action
  async (_, { rejectWithValue }) => {
    try {
      const res = await Apis.category.getAll(); // Gọi API lấy tất cả category
      return res;                               // Trả về API để Redux xử lý
    } catch (err: any) {
      // Nếu lỗi, trả reject để reducer biết thất bại
      return rejectWithValue(err.message || "Failed to fetch categories");
    }
  }
);


/**
 * ✅ addCategory
 * → API: POST /categories
 * → Thêm danh mục mới
 */
export const addCategory = createAsyncThunk(
  "category/add",
  async (
    data: { name: string; imageUrl: string; status?: boolean },
    { rejectWithValue }
  ) => {
    try {
      // Nếu không truyền status → mặc định TRUE
      const payload = { ...data, status: data.status ?? true };

      const res = await Apis.category.create(payload); // Gửi dữ liệu lên server
      return res;                                      // Trả response cho reducer
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to add category");
    }
  }
);


/**
 * ✅ updateCategory
 * → API: PUT /categories/:id
 * → Cập nhật danh mục theo id
 */
export const updateCategory = createAsyncThunk(
  "category/update",
  async (
    { id, data }: { id: number | string; data: Partial<Category> }, // Partial = cho phép truyền 1 phần thuộc tính
    { rejectWithValue }
  ) => {
    try {
      const res = await Apis.category.update(id, data); // Gọi API update
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update category");
    }
  }
);


/**
 * ✅ toggleCategoryStatus
 * → Đảo trạng thái: active -> inactive, inactive -> active
 * → Không cần truyền object, chỉ cần id
 */
export const toggleCategoryStatus = createAsyncThunk<
  Category,          // ✅ Dữ liệu trả về
  number,            // ✅ Dữ liệu truyền vào
  { rejectValue: string; state: { categories: CategoryState } } // ✅ Truy cập state khi cần
>(
  "category/toggleStatus",
  async (id, { getState, rejectWithValue }) => {
    try {
      // Lấy danh sách category hiện tại trong state
      const state = getState();

      // Tìm category có id tương ứng
      const current = state.categories.categories.find(
        (c) => Number(c.id) === Number(id)
      );

      if (!current) return rejectWithValue("Category not found");

      // Gọi API để đổi trạng thái (true <-> false)
      const updated = await Apis.category.update(id, {
        status: !current.status,
      });

      return updated as Category;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to toggle category status");
    }
  }
);


/* =====================================================
   🧩 3. SLICE (CHỨA ACTION + REDUCER)
===================================================== */

const categorySlice = createSlice({
  name: "categories",          // Tên slice
  initialState,                // State khởi tạo
  reducers: {
    /**
     * ✅ Mở modal thêm/sửa category
     * action.payload = category muốn sửa (hoặc null nếu thêm mới)
     */
    openModal: (state, action: PayloadAction<Category | null>) => {
      state.openModal = true;
      state.currentCategory = action.payload ?? null;
    },

    /**
     * ✅ Đóng modal và reset category đang sửa
     */
    closeModal: (state) => {
      state.openModal = false;
      state.currentCategory = null;
    },

    /**
     * ✅ Set lại danh sách category (option dùng socket, realtime...)
     */
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
  },

  // ✅ Xử lý kết quả của async thunks
  extraReducers: (builder) => {
    /* ===== ✅ FETCH CATEGORY ===== */
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;   // Bắt đầu load
        state.error = null;     // Xóa lỗi cũ
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Đảm bảo payload là array
        state.categories = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || "Fetch failed";
      });


    /* ===== ✅ ADD CATEGORY ===== */
    builder
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        // Thêm category mới vào danh sách
        state.categories.push(action.payload as Category);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || "Add failed";
      });


    /* ===== ✅ UPDATE CATEGORY ===== */
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload as Category;

        // Tìm phần tử cũ và thay bằng phần tử mới
        const index = state.categories.findIndex(
          (c) => Number(c.id) === Number(updated.id)
        );

        if (index !== -1) state.categories[index] = updated;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Update failed";
      });


    /* ===== ✅ TOGGLE STATUS ===== */
    builder
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload as Category;

        // Tìm vị trí category và cập nhật lại
        const index = state.categories.findIndex(
          (c) => Number(c.id) === Number(updated.id)
        );

        if (index !== -1) state.categories[index] = updated;
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Toggle status failed";
      });
  },
});

/* =====================================================
   ✅ EXPORT ACTIONS + REDUCER
===================================================== */

// ✅ Export các action để component có thể dispatch
export const { openModal, closeModal, setCategories } = categorySlice.actions;

// ✅ Export reducer để đưa vào store
export default categorySlice.reducer;
