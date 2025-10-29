"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/appStore";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { ArrowLeft,  Plus, Trash2 } from "lucide-react";
import { IoReceiptOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { PrintService } from "@/lib/utils/printService";
import { toast } from "sonner";
import { useSaveReceipt } from "@/hooks/receipt/useSaveReceipt";
import { TopNavigation } from "@/components/ui/top-navigation";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoWalletOutline } from "react-icons/io5";
import { useReportByVehicleDate } from "@/hooks/report/useReportByVehicleDate";

interface AdditionalCollection {
  id: string;
  collectionType: string;
  amount: string;
}

export default function CollectionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const selectedVehicleId = useAppStore((s) => s.selectedVehicleId);
  const template = useCompanyTemplateStore((s) => s.template);
  
  const [additionalCollections, setAdditionalCollections] = useState<AdditionalCollection[]>([]);
  // UI local state
  
  // Initialize the save receipt hook
  const { saveReceipt } = useSaveReceipt();
  const { fetchReport, data: reportData } = useReportByVehicleDate();

  // Get the selected vehicle
  const selectedVehicle = template?.vehicles.find(
    (v) => v.vehicle_id === selectedVehicleId
  );

  // Get company collection defaults for the popup
  const collectionDefaults = template?.company_collection_defaults || [];

  // Group collection defaults by collection title
  const collectionTypes = Array.from(
    new Set(collectionDefaults.map((field) => field.collection.title))
  );

  const addCollection = () => {
    const newCollection: AdditionalCollection = {
      id: Date.now().toString(),
      collectionType: collectionTypes[0] || "",
      amount: "",
    };
    setAdditionalCollections([...additionalCollections, newCollection]);
  };

  const removeCollection = (id: string) => {
    setAdditionalCollections(additionalCollections.filter((c) => c.id !== id));
  };

  const updateCollection = (id: string, field: keyof AdditionalCollection, value: string) => {
    setAdditionalCollections(
      additionalCollections.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const totalAmount = additionalCollections.reduce(
    (sum, c) => sum + (parseFloat(c.amount) || 0),
    0
  );

  // Fetch today's collections total for this vehicle ONCE per (vehicleId, companyId, date)
  const lastFetchKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const companyId = session?.user?.company?.company_id;
    if (!selectedVehicleId || !companyId) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const ymd = `${y}-${m}-${d}`;
    const key = `${selectedVehicleId}-${companyId}-${ymd}`;
    if (lastFetchKeyRef.current === key) return; // prevent duplicate calls
    lastFetchKeyRef.current = key;
    fetchReport(Number(selectedVehicleId), ymd);
  }, [selectedVehicleId, session?.user?.company?.company_id, fetchReport]);

  const todaysTotal = useMemo(() => {
    const rows = reportData?.data?.rows ?? [];
    return rows.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
  }, [reportData]);

  const handleProcessCollection = async () => {
    // Validate session
    if (!session?.user) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    // Validate vehicle selection
    if (!selectedVehicle) {
      toast.error("No vehicle selected");
      return;
    }

    // Validate that we have collections
    if (additionalCollections.length === 0) {
      toast.error("Please add at least one collection before printing receipt");
      return;
    }

    // Validate that all collections have a type and amount
    const invalidCollections = additionalCollections.filter(
      (c) => !c.collectionType || parseFloat(c.amount) <= 0
    );

    if (invalidCollections.length > 0) {
      toast.error("Please fill in all collection types and amounts");
      return;
    }

    // Show loading toast and store its ID
    const toastId = toast.loading("Processing collection...");

    try {
      // Get current date and time in local timezone
      const now = new Date();
      
      // Format date as YYYY-MM-DD using local time (not UTC)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const tripDate = `${year}-${month}-${day}`;
      
      // Prepare slugs object from collections
      const slugs: { [key: string]: number } = {};
      additionalCollections.forEach(collection => {
        // Convert collection type to snake_case slug
        const slug = collection.collectionType.toLowerCase().replace(/\s+/g, '_');
        slugs[slug] = parseFloat(collection.amount);
      });

      // Prepare payload for API
      const payload = {
        meta: {
          number_plate: selectedVehicle?.number_plate || "",
          receipt_no: "",
          trip_date: tripDate,
        },
        slugs,
      };

      // Save receipt to API
      const result = await saveReceipt(
        selectedVehicleId || 0,
        payload
      );

      if (!result) {
        toast.dismiss(toastId);
        toast.error("Failed to save receipt");
        return;
      }

      // Update loading message
      toast.dismiss(toastId);
      const printToastId = toast.loading("Printing receipt...");

      // Now print the receipt using the receipt_text from API
      const printService = new PrintService();

      // Compute local datetime in format YYYY-MM-DD HH:MM:SS
      const nowLocal = new Date();
      const yyyy = nowLocal.getFullYear();
      const mm = String(nowLocal.getMonth() + 1).padStart(2, '0');
      const dd = String(nowLocal.getDate()).padStart(2, '0');
      const HH = String(nowLocal.getHours()).padStart(2, '0');
      const MM = String(nowLocal.getMinutes()).padStart(2, '0');
      const SS = String(nowLocal.getSeconds()).padStart(2, '0');
      const localDateTime = `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
      
      // Use the pre-formatted receipt text from API but override date/time to local
      const printResult = await printService.printReceiptText(
        result.data.receipt_text,
        { overrideDateTime: localDateTime }
      );
      
      // Dismiss printing toast
      toast.dismiss(printToastId);
      
      if (printResult.success) {
        toast.success(`Receipt #${result.data.receipt_number} saved and printed successfully!`);
        
        // Clear collections after successful print
        setAdditionalCollections([]);
        
        // Navigate back to user page
        setTimeout(() => {
          router.push("/user");
        }, 1500);
      } else {
        // Receipt saved but print failed
        toast.warning(`Receipt saved as #${result.data.receipt_number} but print failed: ${printResult.error}`);
        
        // Still clear and navigate since receipt was saved
        setAdditionalCollections([]);
        setTimeout(() => {
          router.push("/user");
        }, 2000);
      }
    } catch (error) {
      // Dismiss loading toast on error
      toast.dismiss(toastId);
      console.error('Process collection error:', error);
      toast.error('An error occurred while processing the collection');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <TopNavigation />
      <div className="container mx-auto px-4 py-4 pb-24 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/user")}
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-700">
            {selectedVehicle?.number_plate || "Vehicle"} NEW COLLECTION
          </h1>
        </div>

        <div className="space-y-6">
          {/* Today's Collections Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoReceiptOutline className="w-5 h-5 text-purple-700" />
                <h2 className="text-[15px] font-semibold text-gray-800">Today&apos;s Collections</h2>
                <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1">
                  Ksh {todaysTotal.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => selectedVehicleId && router.push(`/user/report/${selectedVehicleId}`)}
                className="text-xs font-semibold text-purple-700 hover:underline"
              >
                View all
              </button>
            </div>
            {/* Removed the info card beneath the total as requested */}
          </div>

          {/* Additional Collections Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <IoWalletOutline className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Additional Collections</h2>
              </div>
              {additionalCollections.length > 0 && (
                <Badge className="bg-purple-600 text-white rounded-full px-3">
                  {additionalCollections.length}
                </Badge>
              )}
            </div>

            {/* Additional Collections List */}
            {additionalCollections.length === 0 ? (
              <Card className="bg-white rounded-xl p-6 text-center">
                <div className="flex justify-center my-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-purple-600 text-white hover:bg-purple-700"
                    onClick={addCollection}
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>
                <h3 className="text-md font-medium text-gray-700 mb-1">
                  No collections added
                </h3>
                <p className="text-xs text-gray-500">
                  Tap the button above to add a collection.
                </p>
              </Card>
            ) : (
              <Card className="bg-white rounded-xl p-4 relative overflow-hidden">
                {/* Table-like header */}
                <div className="grid grid-cols-12 text-[11px] font-semibold text-gray-600 mb-2 px-2">
                  <div className="col-span-2">&nbsp;</div>
                  <div className="col-span-6">Collection Type</div>
                  <div className="col-span-4">Amount (KES)</div>
                </div>

                <div className="space-y-3">
                  {additionalCollections.map((collection, idx) => (
                    <div key={collection.id} className="grid grid-cols-12 items-center gap-2 p-3 border rounded-lg">
                      <div className="col-span-2 text-xs text-gray-500 font-semibold">#{idx + 1}</div>
                      <div className="col-span-6">
                        <Select
                          value={collection.collectionType}
                          onValueChange={(value) =>
                            updateCollection(collection.id, "collectionType", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {collectionTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.01"
                          value={collection.amount}
                          onChange={(e) => updateCollection(collection.id, "amount", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCollection(collection.id)}
                          className="text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Add Button */}
                <div className="mt-4">
                  <Button
                    type="button"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-purple-700 text-white hover:bg-purple-800 shadow-md"
                    onClick={addCollection}
                    aria-label="Add collection"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </div>

                {/* Total pill */}
                <div className="bg-purple-700 text-white rounded-xl px-4 py-3 mt-4 font-semibold flex items-center justify-between">
                  <span>Additional Collections Total</span>
                  <span>Ksh {totalAmount.toFixed(2)}</span>
                </div>
              </Card>
            )}
            {/* Bottom primary action */}
            <div className="mt-4">
              <Button
                className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-12"
                onClick={handleProcessCollection}
              >
                <RiSendPlaneFill className="w-5 h-5 mr-2" />
                PRINT RECEIPT
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}