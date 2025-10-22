export interface ElectronAPI {
  printReceipt: (receiptData: ReceiptData) => Promise<PrintResult>;
  getPrinters: () => Promise<PrinterResult>;
  saveSettings: (settings: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  loadSettings: () => Promise<{ success: boolean; settings: Record<string, unknown>; error?: string }>;
  platform: string;
  isElectron: boolean;
}

export interface ReceiptData {
  receiptId: string;
  date: string;
  time: string;
  vehicle: string;
  companyName: string;
  companyPhone?: string;
  servedBy: string;
  stage: string;
  items: Array<{
    type: string;
    amount: string;
  }>;
  total: string;
}

export interface PrintResult {
  success: boolean;
  printer?: string;
  error?: string;
}

export interface PrinterResult {
  success: boolean;
  printers?: Array<{
    name: string;
    displayName: string;
    description: string;
    isDefault: boolean;
  }>;
  error?: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
