import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { API_ENDPOINTS } from "@/lib/utils/constants";
import type {
	ReportByVehicleDateRequest,
	ReportByVehicleDateResponse,
} from "@/types/receipt";

// POST /api/report-by-vehicle-date
// Body: { company_id: number, vehicle_id: number, date: string }
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.token) {
			return NextResponse.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Parse the request body (route will be added below)
		const body: Omit<ReportByVehicleDateRequest, "route"> = await request.json();

		// Basic validation
		if (
			typeof body?.company_id !== "number" ||
			typeof body?.vehicle_id !== "number" ||
			typeof body?.date !== "string"
		) {
			return NextResponse.json(
				{ success: false, error: "Invalid request payload" },
				{ status: 400 }
			);
		}

		const payload: ReportByVehicleDateRequest = {
			route: "app_get_raw_data_by_vehicle",
			...body,
		};

		const apiUrl = API_ENDPOINTS.URL_1;

		// Logging
		console.log("=== REPORT VEHICLE-DATE API REQUEST ===");
		console.log("Payload:", JSON.stringify(payload, null, 2));
		console.log("API URL:", apiUrl);
		console.log("=======================================");

		const response = await fetch(apiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// "Authorization": `Bearer ${session.user.token}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("=== REPORT VEHICLE-DATE API ERROR ===");
			console.error("Status:", response.status);
			console.error("Error:", errorText);
			console.error("====================================");
			return NextResponse.json(
				{ success: false, error: "Failed to fetch vehicle report" },
				{ status: response.status }
			);
		}

		const data: ReportByVehicleDateResponse = await response.json();

		console.log("=== REPORT VEHICLE-DATE API RESPONSE ===");
		console.log("Response:", JSON.stringify(data, null, 2));
		console.log("========================================");

		return NextResponse.json(data);
	} catch (error) {
		console.error("Report vehicle-date error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 }
		);
	}
}

