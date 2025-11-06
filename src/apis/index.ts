
import { AdminApi } from "./core/admin.api";
import { CategoryApi } from "./core/category.api";
import { MonthlyCategoryApi } from "./core/monthlyCategory.api";
import { TransactionApi } from "./core/transaction.api";
import { UserApi } from "./core/user.api";

export const Apis = {
  user: UserApi,
  admin: AdminApi,
  category: CategoryApi,
  monthlyCategory: MonthlyCategoryApi,
  transaction: TransactionApi,
};
  