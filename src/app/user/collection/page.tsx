"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/store/appStore";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { ArrowLeft, Receipt, FolderPlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface AdditionalCollection {
  id: string;
  collectionType: string;
  amount: string;
}

export default function CollectionPage() {
  const router = useRouter();
  useSession(); // Keep session active
  const selectedVehicleId = useAppStore((s) => s.selectedVehicleId);
  const template = useCompanyTemplateStore((s) => s.template);
  
  const [additionalCollections, setAdditionalCollections] = useState<AdditionalCollection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      collectionType: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto max-w-md px-4 py-4 pb-20">
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
              <Receipt className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Collections</h2>
            </div>

            <Card className="bg-white rounded-xl p-8 text-center">
              <div className="inline-block p-6 rounded-full border-2 border-dashed border-purple-300 mb-4">
                <Receipt className="w-12 h-12 text-purple-300" />
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
                <FolderPlus className="w-5 h-5 text-purple-600" />
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="inline-block p-4 rounded-full border-2 border-purple-300 hover:border-purple-500 transition-colors mb-4">
                      <Plus className="w-8 h-8 text-purple-600" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Select Collection Type</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      {collectionTypes.map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            addCollection();
                            setIsDialogOpen(false);
                          }}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
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
                    <div className="grid grid-cols-2 gap-3">
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12">
                      <Plus className="w-5 h-5 mr-2" />
                      ADD COLLECTION
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Select Collection Type</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      {collectionTypes.map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            addCollection();
                            setIsDialogOpen(false);
                          }}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Process Collection Button */}
                <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-12">
                  <Receipt className="w-5 h-5 mr-2" />
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
