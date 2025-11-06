export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  status: boolean;
}

export interface MonthlyCategoryItem {
  id: number;
  categoryId: string;
  budget: number;
}
