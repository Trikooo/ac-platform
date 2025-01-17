/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  GetAllProductsResponse,
  PaginationMetadata,
  ProductSearchParams,
  ProductSearchResponse,
} from "@/types/types";
import { Product } from "@prisma/client";
import { usePathname } from "next/navigation";

export function useGetAllProducts() {
  const fetchAllProducts = async (productSearchParams: ProductSearchParams) => {
    try {
      const response = await axios.get<
        GetAllProductsResponse | ProductSearchResponse
      >("/api/products", {
        params: productSearchParams,
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle Axios-specific errors
        throw error;
      }

      // Handle other types of errors
      throw new Error("An unexpected error occurred while fetching products");
    }
  };

  return useScrollPaginatedProducts(fetchAllProducts);
}

export function useScrollPaginatedProducts(
  fetchFunction: (
    productSearchParams: ProductSearchParams
  ) => Promise<ProductSearchResponse | GetAllProductsResponse>
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);
  const [productSearchParams, setProductSearchParams] =
    useState<ProductSearchParams>({
      currentPage: 1,
      pageSize: 10,
    });
  const currentPath = usePathname();
  const [storeCondition, setStoreCondition] = useState(
    !currentPath.includes("/admin")
  );
  useEffect(() => {
    setStoreCondition(!currentPath.includes("/admin"));
  }, [currentPath]);
  const fetchProducts = useCallback(
    async (newParams: ProductSearchParams) => {
      setLoading(true);
      setError(null);
      try {
        const { products: newProducts, pagination } = await fetchFunction(
          newParams
        );
        setProducts((prevProducts) => {
                    return pagination.currentPage === 1
            ? newProducts
            : [...prevProducts, ...newProducts];
        });

        setPagination(pagination);
      } catch (error) {
        setError(error as AxiosError);
      } finally {
        setLoading(false);
      }
    },
    [productSearchParams, fetchFunction, products.length]
  );

  // Initial fetch
  useEffect(() => {
    let newParams: ProductSearchParams;
        if (storeCondition) {
            newParams = { ...productSearchParams, store: true, currentPage: 1 };
      setProductSearchParams(newParams);
    } else {
            newParams = { ...productSearchParams, store: false, currentPage: 1 };
      setProductSearchParams(newParams);
    }
            fetchProducts(newParams);
  }, [storeCondition]);

  // Function to load more products
  const loadMoreProducts = useCallback(() => {
    if (!loading && pagination && pagination.hasNextPage) {
      const newParams = {
        ...productSearchParams,
        currentPage: productSearchParams.currentPage + 1,
      };
      setProductSearchParams(newParams);
      fetchProducts(newParams);
    }
  }, [loading, pagination, productSearchParams.currentPage, fetchProducts]);

  // Reset products when search params change
  const resetProducts = useCallback(
    (newParams: ProductSearchParams) => {
      setProducts([]);
      fetchProducts(newParams);
    },
    [fetchProducts, productSearchParams.query]
  );

  return {
    products,
    setProducts,
    loading,
    error,
    pagination,
    loadMoreProducts,
    resetProducts,
    productSearchParams,
    setProductSearchParams,
  };
}
