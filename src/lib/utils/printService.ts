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

export class PrintService {
  private isElectron: boolean;

  constructor() {
    this.isElectron =
      typeof window !== "undefined" &&
      "electronAPI" in window &&
      window.electronAPI?.isElectron;
  }

  async printReceipt(receiptData: ReceiptData): Promise<PrintResult> {
    if (this.isElectron) {
      // Use native printing
      return await window.electronAPI.printReceipt(receiptData);
    } else {
      // Use web printing fallback
      return await this.webPrint(receiptData);
    }
  }

  async getPrinters(): Promise<{
    success: boolean;
    printers?: Array<{ name: string; displayName: string; isDefault: boolean }>;
    error?: string;
  }> {
    if (this.isElectron) {
      return await window.electronAPI.getPrinters();
    } else {
      // Web browsers don't have direct printer access
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

  private async webPrint(receiptData: ReceiptData): Promise<PrintResult> {
    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Could not open print window");
      }

      const printContent = this.generateReceiptHTML(receiptData);
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load, then print
      return new Promise((resolve) => {
        printWindow.onload = () => {
          printWindow.print();
          // Close window after a short delay
          setTimeout(() => {
            printWindow.close();
            resolve({ success: true, printer: "Browser Print Dialog" });
          }, 1000);
        };
      });
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private generateReceiptHTML(receiptData: ReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.6;
            margin: 0;
            padding: 10px;
            width: 300px;
            background: white;
          }
          .receipt {
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          .company-name {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
          }
          .company-phone {
            margin: 0;
            font-size: 14px;
          }
          .divider {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
          }
          .vehicle {
            margin: 10px 0 5px 0;
            font-size: 14px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 14px;
          }
          .total {
            margin: 10px 0;
            font-size: 14px;
            font-weight: bold;
          }
          .divider-line {
            border-bottom: 1px dashed #000;
            margin: 5px 0;
          }
          .terms {
            text-align: center;
            margin: 10px 0;
            font-size: 12px;
          }
          .footer-info {
            margin: 3px 0;
            font-size: 14px;
          }
          .company-footer {
            margin-top: 5px;
            font-size: 14px;
          }
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
        <div class="no-print">
          <button onclick="window.print()">Print Receipt</button>
          <button onclick="window.close()">Close</button>
        </div>
        
        <div class="receipt">
          <p class="company-name">${receiptData.companyName}</p>
          ${receiptData.companyPhone ? `<p class="company-phone">${receiptData.companyPhone}</p>` : ''}
          <div class="divider"></div>
          
          <p class="vehicle">${receiptData.receiptId}</p>
          
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

          
          <p class="total">TOTAL ${receiptData.total}</p>
          
          <div class="divider-line"></div>
          
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
}
