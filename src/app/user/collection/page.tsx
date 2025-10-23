"use client";
import { useState } from "react";
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
import { RiSendPlaneFill } from "react-icons/ri";
import { IoWalletOutline } from "react-icons/io5";

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
  
  // Initialize the save receipt hook
  const { saveReceipt } = useSaveReceipt();

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
      amount: "0.00",
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
      toast.error("Please add at least one collection before processing");
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
            <div className="flex items-center space-x-2 mb-4">
              <IoReceiptOutline className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Collections</h2>
            </div>

            <Card className="bg-white rounded-xl p-8 text-center">
              <div className="inline-block p-6 rounded-full border-2 border-dashed border-purple-300 mb-4">
                <IoReceiptOutline className="w-12 h-12 text-purple-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Collections Today
              </h3>
              <p className="text-sm text-gray-500">
                No receipt reports have been recorded for this vehicle today. Start by creating a new collection.
              </p>
            </Card>
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
              <Card className="bg-white rounded-xl p-8 text-center">
                <button 
                  className="inline-block p-4 rounded-full border-2 border-purple-300 hover:border-purple-500 transition-colors mb-4"
                  onClick={addCollection}
                >
                  <Plus className="w-8 h-8 text-purple-600" />
                </button>
                <h3 className="text-base font-medium text-gray-700 mb-1">
                  No additional collections added yet
                </h3>
                <p className="text-sm text-gray-500">
                  Tap the button below to add extra collections
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {additionalCollections.map((collection, index) => (
                  <Card key={collection.id} className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">
                        Collection #{index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCollection(collection.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Collection Type
                        </label>
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
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Amount (KES)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={collection.amount}
                          onChange={(e) =>
                            updateCollection(collection.id, "amount", e.target.value)
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Total Card */}
                <Card className="bg-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Additional Collections Total</span>
                    <span className="text-xl font-bold">Ksh {totalAmount.toFixed(2)}</span>
                  </div>
                </Card>

                {/* Add Collection Button */}
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12"
                  onClick={addCollection}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  ADD COLLECTION
                </Button>

                {/* Process Collection Button */}
                <Button 
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-12"
                  onClick={handleProcessCollection}
                >
                  <RiSendPlaneFill className="w-5 h-5 mr-2" />
                  PROCESS COLLECTION
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
