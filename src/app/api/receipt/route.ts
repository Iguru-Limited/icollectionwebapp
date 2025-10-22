import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { API_ENDPOINTS } from "@/lib/utils/constants";
import type { SaveReceiptRequest, SaveReceiptResponse } from "@/types/receipt";

export async function POST(request: NextRequest) {
  try {
    // Get the session to access user token
    const session = await getServerSession(authOptions);

    if (!session?.user?.token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body: Omit<SaveReceiptRequest, "route"> = await request.json();

    // Prepare the full request payload
    const payload: SaveReceiptRequest = {
      route: "app_save_raw_data",
      ...body,
    };

    // Make request to the external API
    const apiUrl = API_ENDPOINTS.RECEIPT_URL;

    // Log the data being sent to the receipt API
    console.log("=== RECEIPT API REQUEST ===");
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));
    console.log("API URL:", apiUrl);
    console.log("===========================");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if needed
        // "Authorization": `Bearer ${session.user.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("=== RECEIPT API ERROR ===");
      console.error("Status:", response.status);
      console.error("Error response:", errorText);
      console.error("=========================");
      return NextResponse.json(
        { success: false, error: "Failed to save receipt" },
        { status: response.status }
      );
    }

    const data: SaveReceiptResponse = await response.json();

    // Log the successful response
    console.log("=== RECEIPT API RESPONSE ===");
    console.log("Response data:", JSON.stringify(data, null, 2));
    console.log("============================");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Save receipt error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}
