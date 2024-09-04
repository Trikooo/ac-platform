import { CreateProductT } from "@/types/types";

export function createProductFormData(product: Partial<CreateProductT>) {
  const formData = new FormData();

  formData.append("name", product.name ?? "");
  formData.append("description", product.description ?? "");
  formData.append("price", product.price?.toString() ?? "");
  formData.append("stock", product.stock?.toString() ?? "");
  formData.append("barcode", product.barcode ?? "");
  formData.append("categoryId", product.categoryId ?? "");
  formData.append("tags", product.tags ?? "");
  formData.append("keyFeatures", JSON.stringify(product.keyFeatures) ?? "[]");
  formData.append("brand", product.brand ?? "");
  formData.append("status", product.status ?? "ACTIVE");
  formData.append("length", product.length ?? "");
  formData.append("width", product.width ?? "");
  formData.append("height", product.height ?? "");
  formData.append("weight", product.weight ?? "");

  if (product.images && product.images.length > 0) {
    product.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
  }
}

export function createCategoryFormData(category: any) {}
