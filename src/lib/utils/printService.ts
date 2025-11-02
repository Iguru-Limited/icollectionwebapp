/**
 * Print Result Interface
 *
 * Returned by all print methods to indicate success or failure.
 */
export interface PrintResult {
  success: boolean; // Whether the print operation was successful
  printer?: string; // Name of the printer used (if available)
  error?: string; // Error message (if operation failed)
}

/**
 * Print Service Class
 *
 * Handles receipt printing for both web browsers and Electron desktop app.
 * Provides one main method:
 * - printReceiptText() - Prints pre-formatted text from API (RECOMMENDED)
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
      typeof window !== 'undefined' && 'electronAPI' in window && window.electronAPI?.isElectron;
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
  async printReceiptText(
    receiptText: string,
    options?: { overrideDateTime?: string | Date },
  ): Promise<PrintResult> {
    try {
      // Open a new browser window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      // Apply optional overrides (e.g., replace server time with local time)
      const adjustedText = this.applyOverrides(receiptText, options);

      // Generate HTML with the pre-formatted text
      const printContent = this.generateReceiptTextHTML(adjustedText);
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
            resolve({ success: true, printer: 'Browser Print Dialog' });
          }, 1000);
        };
      });
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
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

  /**
   * Apply Overrides (Private Helper)
   *
   * Allows small, controlled modifications to the API-provided receipt text
   * without rebuilding the layout. Currently supports overriding the date/time
   * line to use the client's local time.
   *
   * Implementation details:
   * - Finds the last line in the receipt that matches YYYY-MM-DD HH:MM:SS
   * - Replaces just that line with the provided local datetime string
   */
  private applyOverrides(
    receiptText: string,
    options?: { overrideDateTime?: string | Date },
  ): string {
    if (!options?.overrideDateTime) return receiptText;

    // Normalize override to "YYYY-MM-DD HH:MM:SS"
    let overrideStr: string;
    if (options.overrideDateTime instanceof Date) {
      const d = options.overrideDateTime;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      overrideStr = `${y}-${m}-${day} ${h}:${min}:${s}`;
    } else {
      overrideStr = options.overrideDateTime;
    }

    const lines = receiptText.split(/\r?\n/);
    const dtRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    for (let i = lines.length - 1; i >= 0; i--) {
      if (dtRegex.test(lines[i].trim())) {
        lines[i] = overrideStr;
        break;
      }
    }

    return lines.join('\n');
  }
}
