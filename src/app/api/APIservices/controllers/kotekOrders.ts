import { Order, Prisma, PrismaClient } from "@prisma/client";
import { KotekOrderSchema } from "../lib/validation";
import { KotekOrder, PaginationMetadata, Wilayas } from "@/types/types";
import { DefaultArgs } from "@prisma/client/runtime/library";
import prisma from "../lib/prisma";
import { deleteNoestOrder } from "./noest";
import { AxiosError } from "axios";
import { z } from "zod";
import { getWilayaData } from "./wilayaData";
import { calculateShipping } from "@/utils/generalUtils";

export async function getAllKotekOrders(
  userRole: string, // Add user role parameter
  page: number = 1,
  limit: number = 10
) {
  try {
    // Role-based access control
    if (userRole !== "ADMIN") {
      throw new Error("Unauthorized: Only admins can retrieve all orders");
    }

    // Validate pagination parameters
    const pageNumber = Math.max(1, page);
    const pageSize = Math.min(100, Math.max(1, limit));
    const skip = (pageNumber - 1) * pageSize;

    // Fetch total count of orders
    const totalOrders = await prisma.order.count();

    // Fetch orders with pagination
    const kotekOrders = await prisma.order.findMany({
      skip: skip,
      take: pageSize,
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            price: true,
            quantity: true,
            noestReady: true,
            trackingId: true,
            product: {
              select: {
                imageUrls: true,
                name: true,
                weight: true,
              },
            },
            tracking: {
              select: {
                trackingNumber: true,
                trackingStatus: true,
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Optional: sort by most recent first
      },
    });

    return {
      orders: kotekOrders,
      pagination: <PaginationMetadata>{
        currentPage: pageNumber,
        pageSize: pageSize,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / pageSize),
        hasNextPage: skip + pageSize < totalOrders,
        hasPrevPage: pageNumber > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching all Kotek Orders:", error);
    throw error;
  }
}
export async function getAllUserKotekOrders(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    // Validate userId
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Validate pagination parameters
    const pageNumber = Math.max(1, page);
    const pageSize = Math.min(100, Math.max(1, limit));
    const skip = (pageNumber - 1) * pageSize;

    // Fetch total count of user's orders
    const totalUserOrders = await prisma.order.count({
      where: { userId },
    });

    // Fetch user's orders with pagination
    const kotekOrders = await prisma.order.findMany({
      where: { userId },
      skip: skip,
      take: pageSize,
      include: {
        items: {
          select: {
            productId: true,
            price: true,
            quantity: true,
            noestReady: true,
            product: {
              select: {
                imageUrls: true,
                name: true,
                weight: true,
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Optional: sort by most recent first
      },
    });

    return {
      orders: kotekOrders,
      pagination: <PaginationMetadata>{
        currentPage: pageNumber,
        pageSize: pageSize,
        total: totalUserOrders,
        totalPages: Math.ceil(totalUserOrders / pageSize),
        hasNextPage: skip + pageSize < totalUserOrders,
        hasPrevPage: pageNumber > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching Kotek Orders:", error);
    throw error;
  }
}

export async function getKotekOrderById(kotekOrderId: string) {
  try {
    // Fetch a specific Kotek Order with related items and address
    const kotekOrder = await prisma.order.findUnique({
      where: { id: kotekOrderId },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            price: true,
            quantity: true,
            noestReady: true,
            trackingId: true,
            product: {
              select: {
                imageUrls: true,
                name: true,
                weight: true,
              },
            },
            tracking: {
              select: {
                trackingNumber: true,
                trackingStatus: true,
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!kotekOrder) {
      throw new Error("Kotek Order not found");
    }

    return kotekOrder;
  } catch (error) {
    console.error("Error fetching Kotek Order:", error);
    throw error;
  }
}

export async function updateKotekOrder(
  kotekOrderId: string,
  kotekOrderData: Partial<KotekOrder>,
  trackingNumber?: string,
  noestValidation?: boolean,
  trackingNumbers?: string[]
): Promise<Order> {
  try {
    const validatedKotekOrder =
      KotekOrderSchema.partial().parse(kotekOrderData);
    let refinedOrder = validatedKotekOrder;
    let itemsNeedingTracking: string[] = [];

    if (trackingNumber) {
      const refined = refineOrderUpdate(
        { ...validatedKotekOrder, id: kotekOrderId } as unknown as KotekOrder,
        trackingNumber
      );
      refinedOrder = refined.newOrder as unknown as typeof validatedKotekOrder;
      itemsNeedingTracking = refined.itemsNeedingTracking;
    }
    // Use a transaction for atomicity
    const updatedKotekOrder = await prisma.$transaction(async (tx) => {
      if (refinedOrder.status === "CANCELLED") {
        await tx.tracking.deleteMany({
          where: { orderId: kotekOrderId },
        });
      }
      // Create tracking record
      let tracking: { id: string } | null = null;
      if (
        trackingNumber &&
        itemsNeedingTracking.length > 0 &&
        !noestValidation
      ) {
        tracking = await tx.tracking.create({
          data: {
            trackingNumber: trackingNumber,
            orderId: kotekOrderId,
            trackingStatus: "PROCESSING",
          },
        });
      }
      if (trackingNumbers && trackingNumbers.length > 0 && noestValidation) {
        await tx.tracking.updateMany({
          where: {
            trackingNumber: {
              in: trackingNumbers, // Update all tracking numbers in the array
            },
          },
          data: {
            trackingStatus: "DISPATCHED", // Update the tracking status to "DISPATCHED"
          },
        });
      }

      // Fetch only trackingStatus for all trackings of this order
      const trackings = await tx.tracking.findMany({
        where: {
          orderId: kotekOrderId,
        },
        select: {
          trackingStatus: true,
          trackingNumber: true,
        },
      });
      const trackingStatuses = trackings.map(
        (tracking) => tracking.trackingStatus
      );
      // Check if all trackings are dispatched
      const allDispatched =
        trackingStatuses.length !== 0 &&
        trackingStatuses.every((t) => t === "DISPATCHED") &&
        refinedOrder.status === "PROCESSING";
      // Update order status to DISPATCHED if all trackings are dispatched
      const orderStatus = allDispatched ? "DISPATCHED" : refinedOrder.status;
      // Update Kotek Order
      return await tx.order.update({
        where: { id: kotekOrderId },
        data: {
          status: orderStatus,
          totalAmount: refinedOrder.totalAmount,
          subtotalAmount: refinedOrder.subtotalAmount,
          addressId: refinedOrder.addressId,
          guestAddress: refinedOrder.guestAddress
            ? refinedOrder.guestAddress
            : undefined,
          shippingPrice: refinedOrder.shippingPrice,
          items: refinedOrder.items
            ? {
                deleteMany: {}, // Remove existing items
                create: refinedOrder.items.map((item) => ({
                  quantity: item.quantity,
                  price: item.price,
                  productId: item.productId,
                  noestReady: item.noestReady,
                  ...(tracking &&
                  item.id &&
                  itemsNeedingTracking.includes(item.id)
                    ? { trackingId: tracking.id }
                    : { trackingId: item.trackingId }),
                })),
              }
            : undefined,
        },
        include: {
          items: {
            include: {
              tracking: true,
              product: {
                select: {
                  imageUrls: true,
                  weight: true,
                  name: true,
                },
              },
            },
          },
          address: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    return updatedKotekOrder;
  } catch (error) {
    console.error("Error updating Kotek Order:", error);
    throw error;
  }
}

export async function deleteKotekOrder(kotekOrderId: string) {
  try {
    // Verify the order belongs to the user before deleting
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: kotekOrderId,
      },
    });

    if (!existingOrder) {
      throw new Error("Kotek Order not found or does not belong to the user");
    }

    // Delete the Kotek Order (Prisma will cascade delete related items)
    const deletedKotekOrder = await prisma.order.delete({
      where: { id: kotekOrderId },
    });

    return deletedKotekOrder;
  } catch (error) {
    console.error("Error deleting Kotek Order:", error);
    throw error;
  }
}

export async function secondCreateKotekOrder(
  userId: string | null,
  kotekOrderData: KotekOrder
) {
  try {
    // Validate Kotek Order data
    let validatedData = KotekOrderSchema.parse({
      ...kotekOrderData,
      userId,
    });

    if (!validatedData.addressId && validatedData.userId)
      throw new Error("logged-in users must provide an addressId");

    if (!validatedData.guestAddress && !validatedData.addressId)
      throw new Error("Either addressId or guestId must be provided");
    validatedData = await validatePrices(validatedData);
    const createQuery: Prisma.OrderCreateArgs<DefaultArgs> = {
      data: {
        status: validatedData.status,
        totalAmount: validatedData.totalAmount,
        subtotalAmount: validatedData.subtotalAmount,
        shippingPrice: validatedData.shippingPrice,
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    };

    if (userId && validatedData.addressId) {
      createQuery.data.user = {
        connect: { id: userId },
      };
      createQuery.data.address = {
        connect: { id: validatedData.addressId },
      };
    }
    if (validatedData.guestAddress) {
      createQuery.data.guestAddress = validatedData.guestAddress;
    }
    const newKotekOrder = await prisma.order.create(createQuery);

    return newKotekOrder;
  } catch (error) {
    console.error("Error creating Kotek Order:", error);
    throw error;
  }
}

function refineOrderUpdate(order: KotekOrder, trackingNumber: string) {
  const { items } = order;
  const { status } = order;
  const newOrder = { ...order };

  // Assign tracking number to eligible items
  const itemsNeedingTracking = items
    .map((item) => {
      if (!item.trackingId && item.noestReady && item.id) {
        return item.id;
      }
    })

    .filter((id) => id !== undefined); // Removes undefined values

  // Update order status if all items are noestReady
  if (items.every((item) => item.noestReady === true) && status === "PENDING") {
    newOrder.status = "PROCESSING";
  }
  return { itemsNeedingTracking, newOrder };
}
export async function cancelOrder(order: KotekOrder): Promise<{
  deletedCount: number;
  failedAt: string | null;
  failureReason: string | null;
  order?: Order;
}> {
  if (!order.id) {
    throw new Error("Order ID is missing, cannot update order status");
  }

  const trackingNumbers = order.items
    .map((item) => item.tracking?.trackingNumber)
    .filter(
      (trackingNumber): trackingNumber is string => trackingNumber !== undefined
    );

  let deletedCount = 0;

  // Delete tracking numbers if they exist and the order is PROCESSING
  for (const trackingNumber of trackingNumbers) {
    try {
      await deleteNoestOrder(trackingNumber);
      deletedCount++;
    } catch (error) {
      if (error instanceof AxiosError && error.status === 422) {
        console.warn(`Tracking number ${trackingNumber} already deleted.`);
        continue; // Skip and continue with the next tracking number
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        deletedCount,
        failedAt: trackingNumber,
        failureReason: errorMessage,
      };
    }
  }

  // Only update order if all deletions succeeded
  const updatedItems = order.items.map(
    ({ tracking, trackingId, ...itemWithoutTracking }) => ({
      ...itemWithoutTracking,
      noestReady: false,
    })
  );

  const updatedOrder = await updateKotekOrder(order.id, {
    status: "CANCELLED",
    items: updatedItems,
  });

  return {
    deletedCount,
    failedAt: null,
    failureReason: null,
    order: updatedOrder,
  };
}

type ItemType = {
  quantity: number;
  price: number;
  productId: string;
  noestReady: boolean;
  id?: string;
  trackingId?: string | null;
};

async function validatePrices(
  data: z.infer<typeof KotekOrderSchema>
): Promise<z.infer<typeof KotekOrderSchema>> {
  const { items, guestAddress } = data;
  let { shippingPrice } = data;

  // Get unique product IDs
  const productIds = [...new Set(items.map((item) => item.productId))];

  // Fetch all products in a single query
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      name: true,
      imageUrls: true,
      weight: true,
      price: true,
    },
  });

  // Create a map for quick product lookup
  const productMap = new Map(products.map((product) => [product.id, product]));

  // Validate and update each item
  const validatedItems = items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    // Validate price matches database price
    if (item.price !== product.price) {
      item.price = product.price;
    }
    return item;
  }) as [ItemType, ...ItemType[]]; // Type assertion for tuple

  // Calculate totals
  const subtotalAmount = validatedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  // Validate guestAddress baseShippingPrice
  if (guestAddress) {
    const wilayaData: Wilayas = JSON.parse(getWilayaData());
    if (guestAddress.stopDesk) {
      guestAddress.baseShippingPrice =
        wilayaData[guestAddress.wilayaLabel].noest.prices.stopDesk;
    } else {
      wilayaData[guestAddress.wilayaLabel].noest.prices.home;
    }
  }
  // Validate shippingPrice
  if (guestAddress) {
    shippingPrice = calculateShipping(
      subtotalAmount,
      guestAddress.baseShippingPrice
    );
  } else if (data.addressId) {
    const address = await prisma.address.findUnique({
      where: {
        id: data.addressId,
      },
    });
    if (address) {
      shippingPrice = calculateShipping(
        subtotalAmount,
        address?.baseShippingPrice
      );
    } else throw new Error(`Address with id: ${data.addressId} not found.`);
  }
  // Return updated data with validated items and recalculated totals
  return {
    ...data,
    guestAddress,
    shippingPrice,
    subtotalAmount,
    items: validatedItems,
    totalAmount: subtotalAmount + shippingPrice,
  };
}
