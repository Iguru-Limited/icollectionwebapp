export interface ReceiptData {
  receiptId: string;
  date: string;
  time: string;
  vehicle: string;
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
    this.isElectron = typeof window !== 'undefined' && 
                     'electronAPI' in window && 
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

  async getPrinters(): Promise<{ success: boolean; printers?: Array<{ name: string; displayName: string; isDefault: boolean }>; error?: string }> {
    if (this.isElectron) {
      return await window.electronAPI.getPrinters();
    } else {
      // Web browsers don't have direct printer access
      return { 
        success: true, 
        printers: [{ name: 'browser', displayName: 'Browser Print Dialog', isDefault: true }] 
      };
    }
  }

  private async webPrint(receiptData: ReceiptData): Promise<PrintResult> {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
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
            resolve({ success: true, printer: 'Browser Print Dialog' });
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
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
            width: 300px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
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
        
        <div class="header">
          <h2>iCollections POS</h2>
          <p>Receipt #${receiptData.receiptId}</p>
          <p>${receiptData.date} ${receiptData.time}</p>
        </div>
        
        <div class="items">
          ${receiptData.items.map(item => `
            <div class="item">
              <span>${item.type}</span>
              <span>${item.amount}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="total">
          <div class="item">
            <span>TOTAL:</span>
            <span>${receiptData.total}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Vehicle: ${receiptData.vehicle}</p>
        </div>
      </body>
      </html>
    `;
  }
}
