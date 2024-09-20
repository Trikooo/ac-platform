import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(20, "Name must not exceed 20 characters."),
  description: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string(),
  subcategories: z.array(z.string().uuid(), { required_error: "Subcategories must be an array of UUIDs" }).optional(), // Ensure subcategories is an array of UUIDs

})


export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(20, "Name must not exceed 20 characters."),
  description: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  subcategories: z.array(z.string().uuid(), { required_error: "Subcategories must be an array of UUIDs" }).optional(), // Ensure subcategories is an array of UUIDs

})



// Define the Product schema
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"), // Ensure name is not empty
  description: z.string().optional(),
  price: z.number().int().positive("Price must be a positive integer"), // Positive integer for price
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"), // Non-negative integer for stock
  barcode: z.string().min(1, "barcode is required"), // Optional barcode as a UUID or null
  categoryId: z.string().uuid().nullable().optional(), // Optional categoryId as a UUID or null
  tags: z.array(z.string()), // Array of non-empty strings
  keyFeatures: z.array(z.string()),
  brand: z.string().optional(), // Optional brand
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]), // Enum for product status
  length: z.number().nonnegative().optional(), // Optional non-negative number for length
  width: z.number().nonnegative().optional(), // Optional non-negative number for width
  height: z.number().nonnegative().optional(), // Optional non-negative number for height
  weight: z.number().nonnegative().optional(), // Optional non-negative number for weight
  imageUrls: z.array(z.string()).nonempty() 
});

// Type inference for TypeScript
export type ProductSchemaType = z.infer<typeof productSchema>;


export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required"), // Ensure name is not empty
  description: z.string().optional(), // Ensure description is not empty
  price: z.number().int().positive("Price must be a positive integer"), // Positive integer for price
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"), // Non-negative integer for stock
  barcode: z.string().min(1, "barcode is required"), // Optional barcode as a UUID or null
  categoryId: z.string().uuid().nullable().optional(), // Optional categoryId as a UUID or null
  tags: z.array(z.string()), // Array of non-empty strings
  keyFeatures: z.array(z.string()),
  brand: z.string().optional(), // Optional brand
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]), // Enum for product status
  length: z.number().nonnegative().optional(), // Optional non-negative number for length
  width: z.number().nonnegative().optional(), // Optional non-negative number for width
  height: z.number().nonnegative().optional(), // Optional non-negative number for height
  weight: z.number().nonnegative().optional(), // Optional non-negative number for weight
  imageUrls: z.array(z.string()).nonempty()
});