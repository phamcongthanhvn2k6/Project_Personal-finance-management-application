import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/user.slice";
import authAdminReducer from "./slices/authSliceAdmin";
import categoryReducer from "./slices/category.slice";
import monthlyCategoryReducer from "./slices/monthlyCategory.slice";
import transactionReducer from "./slices/transaction.slice";
import monthReducer from "./slices/month.slice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    authAdmin: authAdminReducer,
    categories: categoryReducer,
    monthlyCategories: monthlyCategoryReducer,
    transactions: transactionReducer,
    month: monthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
