const { app, BrowserWindow, ipcMain, dialog, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// electron-store must be imported dynamically as it's an ES module
let store;
const initStore = async () => {
  const Store = (await import('electron-store')).default;
  store = new Store();
  return store;
};

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow loading local resources
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, '../public/icon.png'), // Add your app icon
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  console.log('isDev:', isDev);
  console.log('__dirname:', __dirname);
  
  if (isDev) {
    const startUrl = 'http://localhost:3000';
    console.log('Loading URL:', startUrl);
    mainWindow.loadURL(startUrl).catch(err => {
      console.error('Failed to load URL:', err);
    });
  } else {
    const indexPath = path.join(__dirname, '../out/index.html');
    console.log('Loading file:', indexPath);
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Failed to load file:', err);
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools only in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}]:`, message);
    if (level === 3) { // Error level
      console.error(`  at ${sourceId}:${line}`);
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(async () => {
  await initStore();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for native features
ipcMain.handle('print-receipt', async (event, receiptData) => {
  try {
    // Get default printer
    const printers = await mainWindow.webContents.getPrinters();
    const defaultPrinter = printers.find(p => p.isDefault) || printers[0];
    
    if (!defaultPrinter) {
      throw new Error('No printer found');
    }

    // Print receipt
    const printOptions = {
      silent: true,
      printBackground: false,
      deviceName: defaultPrinter.name,
      pageSize: 'A4',
      margins: {
        marginType: 'none'
      }
    };

    // Create print content
    const printContent = generateReceiptHTML(receiptData);
    
    // Load content and print
    await mainWindow.webContents.loadURL(`data:text/html,${encodeURIComponent(printContent)}`);
    await mainWindow.webContents.print(printOptions);
    
    return { success: true, printer: defaultPrinter.name };
  } catch (error) {
    console.error('Print error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-printers', async () => {
  try {
    const printers = await mainWindow.webContents.getPrinters();
    return { success: true, printers };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-settings', async (event, settings) => {
  try {
    store.set('settings', settings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-settings', async () => {
  try {
    const settings = store.get('settings', {});
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Generate receipt HTML for printing
function generateReceiptHTML(receiptData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 10px;
          width: 300px;
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
      </style>
    </head>
    <body>
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
