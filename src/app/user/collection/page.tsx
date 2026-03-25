'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/store/appStore';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useCompanyTemplate } from '@/hooks/useCompanyTemplate';
import { useCollectionSchema } from '@/hooks/collection/useCollectionSchema';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { IoReceiptOutline } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrintService } from '@/lib/utils/printService';
import { toast } from 'sonner';
import { useSaveReceipt } from '@/hooks/receipt/useSaveReceipt';
import { RiSendPlaneFill } from 'react-icons/ri';
import { IoWalletOutline } from 'react-icons/io5';
import { useReportByVehicleDate } from '@/hooks/report/useReportByVehicleDate';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VehicleTable } from '@/components/vehicles/VehicleTable';

interface CollectionFieldValue {
  slug: string;
  amount: string;
}

type PaymentMethod = 'cash' | 'mpesa' | 'mpesa_prompt';

export default function CollectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const selectedVehicleId = useAppStore((s) => s.selectedVehicleId);
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);
  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  const { data: tplData, isLoading: tplLoading, error: tplError } = useCompanyTemplate();
  const { data: schemaData, isLoading: schemaLoading, error: schemaError } = useCollectionSchema();

  const [collectionValues, setCollectionValues] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mpesaDialogOpen, setMpesaDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [mpesaRef, setMpesaRef] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [promptSent, setPromptSent] = useState(false);
  // Note: Do not auto-clear selected vehicle here to allow proceeding
  // from the VehicleTable to the collection form on this same route.

  // Populate template store if empty
  useEffect(() => {
    if (!template && tplData) {
      setTemplate(tplData);
    }
  }, [template, tplData, setTemplate]);

  // If coming from HomeTiles with clear flag, reset selected vehicle
  useEffect(() => {
    const clearFlag = searchParams.get('clear');
    if (clearFlag === '1') {
      setSelectedVehicleId(null);
    }
    // Run only on mount for initial URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset helper flags when switching method
  useEffect(() => {
    setPromptSent(false);
  }, [paymentMethod]);
  // UI local state

  // Initialize the save receipt hook
  const { saveReceipt } = useSaveReceipt();
  const { fetchReport, data: reportData } = useReportByVehicleDate();

  // Get the selected vehicle
  const selectedVehicle = template?.vehicles.find((v) => v.vehicle_id === selectedVehicleId);

  // Use dynamic collection schema from API instead of template
  const collectionFields = schemaData?.data || [];
  const collectionTypes = collectionFields.map((field) => field.title);

  // Debug: Log schema data
  useEffect(() => {
    console.log('Collection Schema Data:', schemaData);
    console.log('Collection Fields:', collectionFields);
    console.log('Collection Types:', collectionTypes);
    console.log('Schema Loading:', schemaLoading);
    console.log('Schema Error:', schemaError);
  }, [schemaData, collectionFields, collectionTypes, schemaLoading, schemaError]);

  // Fetch today's collections total for this vehicle ONCE per (vehicleId, companyId, date)
  const lastFetchKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const companyId = session?.user?.company?.company_id;
    if (!selectedVehicleId || !companyId) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
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

  // If no vehicle selected, show the vehicle table for selection (non-conditional hooks above)
  if (!selectedVehicle) {
    const vehicles = (template?.vehicles || []).map((v) => ({
      vehicle_id: v.vehicle_id,
      number_plate: v.number_plate,
      seats: v.seats,
    }));
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 py-4 pb-24 max-w-screen-xl">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/user')}
              className="mr-3"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-700">Select Vehicle for Collection</h1>
          </div>
          {template ? (
            <VehicleTable vehicles={vehicles} />
          ) : tplError ? (
            <Card className="p-8 text-center text-red-600">Failed to load vehicles</Card>
          ) : (
            <Card className="p-8 text-center text-gray-500">
              <div className="animate-pulse">
                {tplLoading ? 'Loading vehicles...' : 'Preparing vehicles...'}
              </div>
            </Card>
          )}
          {schemaError && (
            <Card className="p-4 mt-4 text-center text-amber-600">
              <p className="text-sm">Warning: Failed to load collection schema. Using fallback.</p>
            </Card>
          )}
        </div>
      </div>
    );
  }


  // Update collection value for a specific slug
  const updateCollectionValue = (slug: string, value: string) => {
    setCollectionValues(prev => ({ ...prev, [slug]: value }));
  };

  // Calculate total from all collection values
  const totalAmount = Object.values(collectionValues).reduce(
    (sum, amount) => sum + (parseFloat(amount) || 0),
    0,
  );

  // Check if any collection has a value
  const hasAnyCollection = Object.values(collectionValues).some(val => val && parseFloat(val) > 0);


  const handleProcessCollection = async (shouldPrint: boolean = true) => {
    // Validate session
    if (!session?.user) {
      toast.error('Session expired. Please log in again.');
      return;
    }

    // Validate vehicle selection
    if (!selectedVehicle) {
      toast.error('No vehicle selected');
      return;
    }

    // Validate that we have at least one collection with value
    if (!hasAnyCollection) {
      toast.error('Please enter at least one collection amount');
      return;
    }

    // Validate required fields from schema
    const missingRequired = collectionFields.filter(
      field => field.required && (!collectionValues[field.slug] || parseFloat(collectionValues[field.slug]) <= 0)
    );

    if (missingRequired.length > 0) {
      toast.error(`Please fill in required fields: ${missingRequired.map(f => f.title).join(', ')}`);
      return;
    }

    // Show loading toast and store its ID
    const toastId = toast.loading('Processing collection...');

    try {
      // Get current date and time in local timezone
      const now = new Date();

      // Format date as YYYY-MM-DD using local time (not UTC)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const tripDate = `${year}-${month}-${day}`;

      // Prepare slugs object from collection values
      const slugs: { [key: string]: number } = {};
      Object.entries(collectionValues).forEach(([slug, amount]) => {
        const value = parseFloat(amount);
        if (value > 0) {
          slugs[slug] = value;
        }
      });

      // Prepare payload for API
      const payload = {
        meta: {
          number_plate: selectedVehicle?.number_plate || '',
          receipt_no: '',
          trip_date: tripDate,
          // include optional payment metadata
          payment_method: paymentMethod,
          ...(paymentMethod === 'mpesa' && mpesaRef
            ? { mpesa_reference: mpesaRef.trim().toUpperCase() }
            : {}),
          ...(paymentMethod === 'mpesa_prompt' && mpesaPhone
            ? { mpesa_phone: mpesaPhone.trim() }
            : {}),
        },
        slugs,
      };

      // Save receipt to API
      const result = await saveReceipt(selectedVehicleId || 0, payload);

      if (!result) {
        toast.dismiss(toastId);
        toast.error('Failed to save receipt');
        return;
      }

        // Update loading message
      toast.dismiss(toastId);

      // Only print if requested
      if (shouldPrint) {
        const printToastId = toast.loading('Printing receipt...');

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
        const printResult = await printService.printReceiptText(result.data.receipt_text, {
          overrideDateTime: localDateTime,
        });

        // Dismiss printing toast
        toast.dismiss(printToastId);

        if (printResult.success) {
          toast.success(`Receipt #${result.data.receipt_number} saved and printed successfully!`);

          // Clear form after successful save
          setCollectionValues({});
          setPaymentMethod('cash');
          setMpesaRef('');
          setMpesaPhone('');

          // Navigate back to user page
          setTimeout(() => {
            router.push('/user');
          }, 1500);
        } else {
          // Receipt saved but print failed
          toast.warning(
            `Receipt saved as #${result.data.receipt_number} but print failed: ${printResult.error}`,
          );

          // Still clear and navigate since receipt was saved
          setCollectionValues({});
          setTimeout(() => {
            router.push('/user');
          }, 2000);
        }
      } else {
        // Save only, no printing
        toast.success(`Receipt #${result.data.receipt_number} saved successfully!`);

        // Clear collections after save
        setCollectionValues({});
        setPaymentMethod('cash');
        setMpesaRef('');
        setMpesaPhone('');

        // Navigate back to user page
        setTimeout(() => {
          router.push('/user');
        }, 1500);
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
      <div className="container mx-auto px-4 py-4 pb-24 max-w-screen-xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/user')} className="mr-3">
            <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-700">
            {selectedVehicle?.number_plate || 'Vehicle'} NEW COLLECTION
          </h1>
        </div>

        <div className="space-y-6">
          {/* Today's Collections Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IoReceiptOutline className="w-5 h-5 text-purple-700" />
                <h2 className="text-[20px] font-semibold text-gray-800">
                  Today&apos;s Collections
                </h2>
                <span className="ml-2 inline-flex items-center rounded-full bg-purple-700 text-white text-xl font-semibold px-3 py-1">
                  Ksh {todaysTotal.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() =>
                  selectedVehicleId && router.push(`/user/report/${selectedVehicleId}`)
                }
                className="text-xl font-semibold text-purple-700 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>
            {/* Removed the info card beneath the total as requested */}
          </div>

          {/* Collections Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <IoWalletOutline className="w-5 h-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Collections</h2>
            </div>

            {/* Schema-based Collection Fields */}
            {schemaLoading ? (
              <Card className="bg-white rounded-xl p-6 text-center">
                <div className="animate-pulse text-gray-500">Loading collection fields...</div>
              </Card>
            ) : collectionFields.length === 0 ? (
              <Card className="bg-white rounded-xl p-6 text-center text-amber-600">
                <p>No collection fields available</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {collectionFields.map((field) => (
                  <Card key={field.slug} className="bg-white rounded-xl p-4">
                    <label className="block mb-2">
                      <span className="text-base font-medium text-gray-700">
                        {field.title}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min={field.min ?? 0}
                      max={field.max ?? undefined}
                      value={collectionValues[field.slug] || ''}
                      onChange={(e) => updateCollectionValue(field.slug, e.target.value)}
                      placeholder={field.placeholder || '0.00'}
                      className="w-full text-lg"
                    />
                  </Card>
                ))}

                {/* Total Display */}
                {hasAnyCollection && (
                  <div className="bg-purple-700 text-white rounded-xl px-4 py-3 mt-4 font-semibold flex items-center justify-between">
                    <span>Total</span>
                    <span>Ksh {totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            {/* Payment Method Selection (appears only after entering collection values) */}
            {hasAnyCollection && (
              <div className="mt-6 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={paymentMethod} onValueChange={(v: string) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mpesa">M-Pesa (Reference)</SelectItem>
                      <SelectItem value="mpesa_prompt">M-Pesa Prompt (STK)</SelectItem>
                    </SelectContent>
                  </Select>
                  {paymentMethod === 'mpesa' && (
                    <div className="md:col-span-2 flex items-center gap-2">
                      <Input
                        value={mpesaRef}
                        onChange={(e) => setMpesaRef(e.target.value)}
                        onBlur={() => {
                          const ref = mpesaRef.trim();
                          const valid = /^[A-Za-z0-9]{7,12}$/.test(ref);
                          if (ref.length > 0) {
                            if (valid) toast.success('M-Pesa reference recorded');
                            else toast.error('Invalid M-Pesa reference');
                          }
                        }}
                        placeholder="Enter M-Pesa reference (e.g., QF91XYZ123)"
                      />
                    </div>
                  )}
                  {paymentMethod === 'mpesa_prompt' && (
                    <div className="md:col-span-2 flex items-center gap-2">
                      <Input
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="Phone (e.g., 07XXXXXXXX or +2547XXXXXXXX)"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const phone = mpesaPhone.replace(/\s+/g, '');
                          const valid = /^(\+254|0)7\d{8}$/.test(phone);
                          if (!valid) {
                            toast.error('Enter a valid Safaricom number');
                            return;
                          }
                          setPromptSent(true);
                          toast.success(`Prompt sent to ${phone}`);
                        }}
                      >
                        Send Prompt
                      </Button>
                    </div>
                  )}
                </div>
                {/* Confirm & Print for non-cash flows */}
                {paymentMethod === 'mpesa' && (
                  <div className="mt-4">
                    <Dialog open={mpesaDialogOpen} onOpenChange={setMpesaDialogOpen}>
                      <div>
                        <Button
                          className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-12"
                          onClick={() => {
                            const ref = mpesaRef.trim();
                            const valid = /^[A-Za-z0-9]{7,12}$/.test(ref);
                            if (!valid) {
                              toast.error('Please enter a valid M-Pesa reference');
                              return;
                            }
                            setMpesaDialogOpen(true);
                          }}
                          disabled={!hasAnyCollection}
                        >
                          Process Receipt
                        </Button>
                      </div>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save or Print Receipt?</DialogTitle>
                          <DialogDescription>
                            You are about to process a receipt for{' '}
                            <span className="font-semibold">
                              {selectedVehicle?.number_plate || 'vehicle'}
                            </span>{' '}
                            with M-Pesa reference{' '}
                            <span className="font-semibold">{mpesaRef.trim().toUpperCase()}</span>.
                            Total: <span className="font-semibold">Ksh {totalAmount.toFixed(2)}</span>
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                          <Button variant="outline" onClick={() => setMpesaDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={async () => {
                              setMpesaDialogOpen(false);
                              await handleProcessCollection(false);
                            }}
                          >
                            Save Only
                          </Button>
                          <Button
                            className="bg-purple-700 hover:bg-purple-800"
                            onClick={async () => {
                              setMpesaDialogOpen(false);
                              await handleProcessCollection(true);
                            }}
                          >
                            Save & Print
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                {paymentMethod === 'mpesa_prompt' && (
                  <div className="mt-4">
                    <Dialog open={mpesaDialogOpen} onOpenChange={setMpesaDialogOpen}>
                      <div>
                        <Button
                          className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-12"
                          onClick={() => {
                            const phone = mpesaPhone.replace(/\s+/g, '');
                            const valid = /^(\+254|0)7\d{8}$/.test(phone);
                            if (!valid) {
                              toast.error('Please enter a valid phone number');
                              return;
                            }
                            if (!promptSent) {
                              toast.error('Please send the M-Pesa prompt first');
                              return;
                            }
                            setMpesaDialogOpen(true);
                          }}
                          disabled={!hasAnyCollection}
                        >
                          Process Receipt
                        </Button>
                      </div>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save or Print Receipt?</DialogTitle>
                          <DialogDescription>
                            You are about to process a receipt for{' '}
                            <span className="font-semibold">
                              {selectedVehicle?.number_plate || 'vehicle'}
                            </span>{' '}
                            with M-Pesa prompt sent to{' '}
                            <span className="font-semibold">{mpesaPhone.trim()}</span>. Total:{' '}
                            <span className="font-semibold">Ksh {totalAmount.toFixed(2)}</span>
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2">
                          <Button variant="outline" onClick={() => setMpesaDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={async () => {
                              setMpesaDialogOpen(false);
                              await handleProcessCollection(false);
                            }}
                          >
                            Save Only
                          </Button>
                          <Button
                            className="bg-purple-700 hover:bg-purple-800"
                            onClick={async () => {
                              setMpesaDialogOpen(false);
                              await handleProcessCollection(true);
                            }}
                          >
                            Save & Print
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            )}

            {/* Bottom primary action with confirmation dialog (only for Cash) */}
            {paymentMethod === 'cash' && hasAnyCollection && (
              <div className="mt-4">
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <div>
                    <Button
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-xl h-12"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <RiSendPlaneFill className="w-5 h-5 mr-2" />
                      PRINT RECEIPT
                    </Button>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Print</DialogTitle>
                      <DialogDescription>
                        You are about to print a receipt for{' '}
                        <span className="font-semibold">
                          {selectedVehicle?.number_plate || 'vehicle'}
                        </span>{' '}
                        with total amount{' '}
                        <span className="font-semibold">Ksh {totalAmount.toFixed(2)}</span>.
                      </DialogDescription>
                    </DialogHeader>
                    {/* Optional quick summary */}
                    {hasAnyCollection && (
                      <div className="mt-2 max-h-48 overflow-auto rounded-md border p-2 text-xl">
                        {collectionFields
                          .filter(field => collectionValues[field.slug] && parseFloat(collectionValues[field.slug]) > 0)
                          .map((field, i) => (
                          <div key={field.slug} className="flex items-center justify-between py-1">
                            <span className="text-gray-600">
                              {i + 1}. {field.title}
                            </span>
                            <span className="font-semibold">Ksh {parseFloat(collectionValues[field.slug]).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-purple-700 hover:bg-purple-800"
                        onClick={async () => {
                          setConfirmOpen(false);
                          await handleProcessCollection();
                        }}
                      >
                        Confirm & Print
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
