import { NextRequest, NextResponse } from "next/server";
import {
  createAddress,
  deleteAddress,
  getAllAddresses,
  updateAddress,
} from "../APIservices/controllers/addresses";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required." },
        { status: 400 }
      );
    }
    const addresses = await getAllAddresses(userId);
    if (addresses && addresses.length > 0) {
      return NextResponse.json({ addresses: addresses }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "No addresses found for this user" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("GET Address Error:", error);
    return NextResponse.json(
      {
        message: "Failed to retrieve addresses",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const addressData = await request.json();

    const address = await createAddress(userId, addressData);
    return NextResponse.json({ address: address }, { status: 201 });
  } catch (error) {
    console.error("POST Address Error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the Prisma error code for unique constraint violations
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "An address with these details already exists" },
          { status: 409 } // Conflict status code
        );
      }

      // Handle other Prisma-specific errors
      switch (error.code) {
        case "P2003": // Foreign key constraint failed
          return NextResponse.json(
            { message: "Related record not found" },
            { status: 404 }
          );
        case "P2025": // Record not found
          return NextResponse.json(
            { message: "Resource not found" },
            { status: 404 }
          );
        default:
          return NextResponse.json(
            {
              message: "Database error occurred",
              errorCode: error.code,
            },
            { status: 500 }
          );
      }
    }

    // Catch-all for unexpected errors
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const addressId = request.nextUrl.searchParams.get("addressId");

    if (!userId || !addressId) {
      return NextResponse.json(
        { message: "User ID and Address ID are required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const addressData = await request.json();

    const updatedAddress = await updateAddress(addressId, addressData);

    if (updatedAddress) {
      return NextResponse.json({ address: updatedAddress }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Failed to update the address" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("PUT Address Error:", error);
    return NextResponse.json(
      {
        message: "Failed to update address",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const addressId = request.nextUrl.searchParams.get("addressId");

    if (!addressId) {
      return NextResponse.json(
        { message: "User ID and Address ID are required" },
        { status: 400 }
      );
    }

    const deletedAddress = await deleteAddress(addressId);

    if (deletedAddress) {
      return NextResponse.json(
        { message: "Address deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Address not found or could not be deleted" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("DELETE Address Error:", error);
    return NextResponse.json(
      {
        message: "Failed to delete address",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
