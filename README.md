# iCollections POS

A hybrid Next.js + Electron application for vehicle collection management with native printing support for POS devices.

## Features

- 🌐 **Web & Desktop**: Runs as a web app (Vercel) or desktop application (Electron)
- 🖨️ **Native Printing**: Direct printer access in desktop mode, browser printing in web mode
- 📱 **Responsive Design**: Mobile-first design with drawer UI on mobile, full page on desktop
- 💰 **Collection Management**: Track multiple collection types (terminus, operations, savings, loan, investment)
- 🧾 **Receipt Generation**: Automatic receipt generation with printing
- 🚗 **Vehicle Tracking**: Manage collections per vehicle
- 📊 **Dashboard**: Real-time metrics and reporting

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Framer Motion, shadcn/ui components
- **Desktop**: Electron 38
- **State Management**: React Hooks
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- Bun (or Node.js 20+)
- For desktop builds: OS-specific build tools

### Installation

```bash
# Install dependencies
bun install
```

### Development

#### Web Development (Vercel deployment)

```bash
# Run Next.js development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Desktop Development (Electron)

```bash
# Run Electron development mode (starts Next.js + Electron)
bun run electron-dev
```

This will:
1. Start the Next.js dev server on port 3000
2. Wait for the server to be ready
3. Launch Electron with hot-reload support

## Building for Production

### Web Build (for Vercel)

```bash
# Build for web deployment
bun run build:web
# or simply
bun run build
```

Deploy to Vercel:
```bash
vercel --prod
```

The web version uses browser printing APIs for receipt printing.

### Desktop Build (for Distribution)

```bash
# Build Electron app for desktop
bun run electron-pack
```

This creates distributable packages in the `dist/` directory:
- **Linux**: `.AppImage` file
- **Windows**: `.exe` installer (when built on Windows)
- **macOS**: `.dmg` installer (when built on macOS)

The desktop version has native printer access for POS devices.

#### Create Distribution Package Only (no publish)

```bash
bun run electron-dist
```

## Project Structure

```
app_icollections/
├── electron/              # Electron main process files
│   ├── main.js           # Electron main process
│   └── preload.js        # Preload script for IPC
├── src/
│   ├── app/              # Next.js app routes
│   ├── components/       # React components
│   ├── utils/            # Utilities
│   │   └── printService.ts  # Hybrid printing service
│   ├── types/            # TypeScript definitions
│   │   └── electron.d.ts    # Electron API types
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Shared libraries
├── public/               # Static assets
├── out/                  # Static export for Electron (generated)
└── dist/                 # Electron build output (generated)
```

## Key Features Implementation

### Hybrid Printing

The app uses a `PrintService` class that automatically detects the environment:

- **Desktop (Electron)**: Uses native `electronAPI.printReceipt()` for direct printer access
- **Web (Browser)**: Falls back to `window.print()` API

```typescript
import { PrintService } from '@/utils/printService';

const printService = new PrintService();
const result = await printService.printReceipt(receiptData);
```

### Environment Detection

The app adapts based on the environment:

```typescript
// Check if running in Electron
if (window.electronAPI?.isElectron) {
  // Use native features
}
```

### Collection Form

The collection form supports:
- Adding multiple collection entries
- Different collection types per entry
- Dynamic form fields
- Mobile drawer UI / Desktop full page
- Receipt generation and printing

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Next.js development server |
| `bun run build` | Build for web (Vercel) |
| `bun run build:web` | Build for web (Vercel) |
| `bun run build:electron` | Build Next.js for Electron |
| `bun run start` | Start production Next.js server |
| `bun run lint` | Run ESLint |
| `bun run electron` | Run Electron (requires built app) |
| `bun run electron-dev` | Run Electron in development mode |
| `bun run electron-pack` | Build Electron distributable |
| `bun run electron-dist` | Build Electron (no publish) |

## Configuration

### Web vs Desktop Configuration

The `next.config.ts` automatically detects the build target:

- **Web**: Normal Next.js build with SSR
- **Desktop**: Static export for Electron

This is controlled by the `ELECTRON` environment variable.

### Electron Builder Configuration

Edit `package.json` under the `build` section to customize:

```json
{
  "build": {
    "appId": "com.icollections.pos",
    "productName": "iCollections POS",
    "files": ["out/**/*", "electron/**/*", "node_modules/**/*"],
    "mac": { "category": "public.app-category.business" },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
}
```

## Deployment

### Web Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js
3. Deploy with: `vercel --prod`

Your web app will be live with browser-based printing.

### Desktop Distribution

1. Build for your target platform:
   ```bash
   bun run electron-pack
   ```

2. Find the installer in `dist/`:
   - Linux: `iCollections POS-0.1.0.AppImage`
   - Windows: `iCollections POS Setup 0.1.0.exe`
   - macOS: `iCollections POS-0.1.0.dmg`

3. Distribute the installer to your users

4. Desktop app has full native printer access for POS devices

## Native Features (Desktop Only)

The desktop version provides additional native features:

- **Direct Printer Access**: Print receipts directly to configured POS printers
- **Settings Storage**: Persistent settings storage using electron-store
- **System Integration**: Access to native file dialogs and system notifications
- **Auto Updates**: Built-in update mechanism (can be configured)
- **Offline Mode**: Works completely offline

## Troubleshooting

### Electron Build Issues

If you encounter module loading errors:
1. Clear the build cache: `rm -rf dist out .next`
2. Reinstall dependencies: `rm -rf node_modules && bun install`
3. Rebuild: `bun run electron-pack`

### Printer Access

- **Web**: Uses browser print dialog
- **Desktop**: Requires printer drivers to be installed on the system

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.
