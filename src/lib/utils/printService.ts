/**
 * Receipt Data Interface
 * 
 * Defines the structure for receipt data used when manually building receipts.
 * Note: This is deprecated in favor of using the pre-formatted receipt_text from API.
 */
export interface ReceiptData {
  receiptId: string;      // Receipt number (e.g., "KAS-26")
  date: string;           // Date in format YYYY-MM-DD
  time: string;           // Time in format HH:MM:SS
  vehicle: string;        // Vehicle number plate
  companyName: string;    // Company name
  companyPhone?: string;  // Company phone number (optional)
  servedBy: string;       // Username of the person who created the receipt
  stage: string;          // Stage name (e.g., "THIKA", "NAIROBI CBD")
  items: Array<{          // Array of collection items
    type: string;         // Collection type (e.g., "Insurance", "Route Fee")
    amount: string;       // Amount as formatted string (e.g., "200.00")
  }>;
  total: string;          // Total amount as formatted string
}

/**
 * Print Result Interface
 * 
 * Returned by all print methods to indicate success or failure.
 */
export interface PrintResult {
  success: boolean;   // Whether the print operation was successful
  printer?: string;   // Name of the printer used (if available)
  error?: string;     // Error message (if operation failed)
}

/**
 * Print Service Class
 * 
 * Handles receipt printing for both web browsers and Electron desktop app.
 * Provides two methods:
 * 1. printReceiptText() - Prints pre-formatted text from API (RECOMMENDED)
 * 2. printReceipt() - Manually builds receipt from data (DEPRECATED)
 */
export class PrintService {
  private isElectron: boolean;

  /**
   * Constructor
   * 
   * Detects if the app is running in Electron or web browser.
   */
  constructor() {
    this.isElectron =
      typeof window !== "undefined" &&
      "electronAPI" in window &&
      window.electronAPI?.isElectron;
  }

  /**
   * Print Receipt Text (RECOMMENDED)
   * 
   * Prints a pre-formatted receipt text string from the API.
   * The API returns a fully formatted receipt with all data including:
   * - Company name and phone
   * - Receipt number
   * - Collection items with amounts
   * - Total amount
   * - Terms and conditions
   * - User, stage, date/time
   * - Footer
   * 
   * @param receiptText - Pre-formatted receipt text from API response
   * @returns Promise<PrintResult> - Result of the print operation
   * 
   * @example
   * const result = await printService.printReceiptText(apiResponse.data.receipt_text);
   */
  async printReceiptText(receiptText: string): Promise<PrintResult> {
    try {
      // Open a new browser window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Could not open print window");
      }

      // Generate HTML with the pre-formatted text
      const printContent = this.generateReceiptTextHTML(receiptText);
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load, then trigger browser print dialog
      return new Promise((resolve) => {
        printWindow.onload = () => {
          printWindow.print();
          
          // Close the print window after a short delay
          // This gives time for the print dialog to appear
          setTimeout(() => {
            printWindow.close();
            resolve({ success: true, printer: "Browser Print Dialog" });
          }, 1000);
        };
      });
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * Print Receipt (DEPRECATED - Use printReceiptText instead)
   * 
   * Manually builds and prints a receipt from structured data.
   * This method is kept for backward compatibility but should not be used
   * for new code since the API now provides pre-formatted receipt_text.
   * 
   * @param receiptData - Structured receipt data
   * @returns Promise<PrintResult> - Result of the print operation
   */
  async printReceipt(receiptData: ReceiptData): Promise<PrintResult> {
    if (this.isElectron) {
      // Use native Electron printing for desktop app
      return await window.electronAPI.printReceipt(receiptData);
    } else {
      // Use web browser printing
      return await this.webPrint(receiptData);
    }
  }

  /**
   * Get Printers
   * 
   * Returns a list of available printers.
   * In Electron: Returns actual system printers
   * In Web: Returns a placeholder for browser print dialog
   * 
   * @returns Promise with list of available printers
   */
  async getPrinters(): Promise<{
    success: boolean;
    printers?: Array<{ 
      name: string; 
      displayName: string; 
      isDefault: boolean 
    }>;
    error?: string;
  }> {
    if (this.isElectron) {
      // Get actual system printers from Electron
      return await window.electronAPI.getPrinters();
    } else {
      // Web browsers don't have direct printer access
      // Return a placeholder that represents the browser's print dialog
      return {
        success: true,
        printers: [
          {
            name: "browser",
            displayName: "Browser Print Dialog",
            isDefault: true,
          },
        ],
      };
    }
  }

  /**
   * Web Print (Private Method)
   * 
   * Handles printing in web browsers by creating a temporary window
   * with formatted HTML and triggering the browser's print dialog.
   * 
   * @param receiptData - Receipt data to print
   * @returns Promise<PrintResult> - Result of the print operation
   */
  private async webPrint(receiptData: ReceiptData): Promise<PrintResult> {
    try {
      // Open a new browser window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Could not open print window");
      }

      // Generate formatted HTML from receipt data
      const printContent = this.generateReceiptHTML(receiptData);
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load, then trigger print
      return new Promise((resolve) => {
        printWindow.onload = () => {
          printWindow.print();
          
          // Close window after print dialog appears
          setTimeout(() => {
            printWindow.close();
            resolve({ success: true, printer: "Browser Print Dialog" });
          }, 1000);
        };
      });
    } catch (error) {
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * Generate Receipt HTML (Private Method - DEPRECATED)
   * 
   * Generates HTML markup for a receipt from structured data.
   * This creates a formatted receipt with:
   * - Company header with name and phone
   * - Receipt number
   * - Line items with amounts
   * - Total
   * - Footer with terms, user, stage, date/time
   * 
   * Uses Courier New font to mimic thermal receipt printer output.
   * Width is set to 300px to approximate receipt paper width.
   * 
   * @param receiptData - Receipt data to format
   * @returns HTML string ready for printing
   */
  private generateReceiptHTML(receiptData: ReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt</title>
        <style>
          /* Print-specific styles - hide controls when printing */
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          /* Main receipt container styles */
          body {
            font-family: 'Courier New', monospace; /* Monospace font like thermal printers */
            font-size: 14px;
            font-weight: bolder;
            line-height: 1.6;
            margin: 0;
            padding: 10px;
            width: 300px;  /* Approximate receipt paper width */
            background: white;
          }
          
          /* Receipt content container */
          .receipt {
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          
          /* Header section styles */
          .company-name {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
          }
          .company-phone {
            margin: 0;
            font-size: 14px;
          }
          
          /* Divider lines */
          .divider {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
          }
          .divider-line {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
          }
          
          /* Receipt number */
          .vehicle {
            margin: 10px 0 5px 0;
            font-size: 14px;
          }
          
          /* Line items - flexbox for left/right alignment */
          .item {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 14px;
          }
          
          /* Total amount */
          .total {
            margin: 10px 0;
            font-size: 14px;
            font-weight: bold;
          }
          
          /* Terms and conditions */
          .terms {
            text-align: center;
            margin: 10px 0;
            font-size: 12px;
          }
          
          /* Footer information */
          .footer-info {
            margin: 3px 0;
            font-size: 14px;
          }
          .company-footer {
            margin-top: 5px;
            font-size: 14px;
          }
          
          /* Print/Close buttons - hidden when printing */
          .no-print {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #f0f0f0;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <!-- Control buttons (not visible when printing) -->
        <div class="no-print">
          <button onclick="window.print()">Print Receipt</button>
          <button onclick="window.close()">Close</button>
        </div>
        
        <!-- Receipt content -->
        <div class="receipt">
          <!-- Header: Company name and phone -->
          <p class="company-name">${receiptData.companyName}</p>
          ${receiptData.companyPhone ? `<p class="company-phone">${receiptData.companyPhone}</p>` : ''}
          <div class="divider"></div>
          
          <!-- Receipt number -->
          <p class="vehicle">${receiptData.receiptId}</p>
          
          <!-- Collection items -->
          ${receiptData.items
            .map(
              (item) => `
          <div class="item">
            <span>${item.type}</span>
            <span>${item.amount}</span>
          </div>`
            )
            .join("")}
          <div class="divider-line"></div>
          
          <!-- Total amount -->
          <p class="total">TOTAL ${receiptData.total}</p>
          
          <div class="divider-line"></div>
          
          <!-- Footer: Terms, user info, date/time, company -->
          <p class="terms">**Terms and Conditions Apply**</p>
          
          <p class="footer-info">By: ${receiptData.servedBy}</p>
          <p class="footer-info">Stage: ${receiptData.stage}</p>
          <p class="footer-info">${receiptData.date} ${receiptData.time}</p>
          <p class="company-footer">iGuru Limited|www.iguru.co.ke</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate Receipt Text HTML (Private Method - RECOMMENDED)
   * 
   * Generates HTML markup to display pre-formatted receipt text from the API.
   * This is the preferred method because:
   * 1. The API formats the receipt with all correct data
   * 2. Ensures consistency with backend formatting
   * 3. Includes phone number and all other details from the API
   * 4. Less maintenance - formatting is handled by API
   * 
   * The receipt text comes formatted with line breaks (\n) and spacing,
   * so we use 'pre-wrap' to preserve the formatting.
   * 
   * @param receiptText - Pre-formatted receipt text from API (from receipt_text field)
   * @returns HTML string ready for printing
   * 
   * @example
   * API returns receipt_text like:
   * "TYST COMPANY NAME\n0712345678\n----\nKAS-26\nInsurance 200.00\n..."
   */
  private generateReceiptTextHTML(receiptText: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt</title>
        <style>
          /* Print-specific styles - hide controls when printing */
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          
          /* Main body styles */
          body {
            font-family: 'Courier New', monospace; /* Monospace font matches receipt format */
            font-size: 14px;
            font-weight: 900; /* Maximum boldness for better receipt printer visibility */
            line-height: 1.4;
            margin: 0;
            padding: 10px;
            width: 300px;  /* Approximate receipt paper width */
            background: white;
          }
          
          /* Receipt content - preserves formatting from API */
          .receipt {
            white-space: pre-wrap;  /* Preserves line breaks and spaces from API text */
            word-wrap: break-word;  /* Prevents overflow on long words */
            font-weight: 900; /* Maximum boldness for receipt text */
          }
          
          /* Print/Close buttons - hidden when printing */
          .no-print {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #f0f0f0;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <!-- Control buttons (not visible when printing) -->
        <div class="no-print">
          <button onclick="window.print()">Print Receipt</button>
          <button onclick="window.close()">Close</button>
        </div>
        
        <!-- Pre-formatted receipt text from API -->
        <div class="receipt">${receiptText}</div>
      </body>
      </html>
    `;
  }
}
