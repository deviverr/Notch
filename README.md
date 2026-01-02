# NOTCH Companion App

Modern minimalist web companion for the NOTCH Arduino console. Connect via USB, manage settings, install games, and view statistics.

## Features

- **USB Connection**: Web Serial API for direct browser-to-console communication
- **Settings Management**: Adjust joystick sensitivity, LCD brightness, and buzzer volume
- **Console Info**: View firmware version, memory usage, and device details
- **Statistics**: Track play time and game statistics
- **Game Installation**: Install games via bytecode (coming in Phase 3)

## Browser Requirements

The Web Serial API is only available in:
- Google Chrome (version 89+)
- Microsoft Edge (version 89+)

**Note**: Firefox and Safari do not currently support Web Serial API.

## Getting Started

### 1. Install Dependencies

```bash
cd the-companion-app
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:3000`

### 3. Connect Your NOTCH Console

1. Upload the NOTCH firmware to your Arduino Uno
2. Connect the Arduino via USB
3. Open the companion app in Chrome/Edge
4. Click "Connect Console"
5. Select the correct serial port (usually something like "USB Serial Device")
6. Wait for the handshake to complete

## Project Structure

```
the-companion-app/
├── src/
│   ├── core/               # Core functionality
│   │   ├── SerialManager.js      # Web Serial API wrapper
│   │   ├── ProtocolHandler.js    # NOTCH protocol commands
│   │   └── StateManager.js       # Application state
│   ├── components/         # UI components
│   │   ├── ConnectionPanel.js    # USB connection UI
│   │   ├── Dashboard.js          # Main dashboard
│   │   └── SettingsPanel.js      # Settings management
│   ├── games/              # Game definitions
│   ├── style.css           # Styling
│   └── main.js             # Application entry point
├── public/                 # Static assets
├── index.html             # Main HTML
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies
```

## Serial Protocol

The app communicates with NOTCH using a simple text-based protocol:

### Command Format
```
COMMAND [PAYLOAD]\n
```

### Response Format
```
OK [DATA]\n
ERROR [MESSAGE]\n
```

### Available Commands

- `HANDSHAKE` - Initial connection handshake
- `GET_INFO` - Get firmware and device information
- `PING` - Test connection (responds with PONG)
- `GET_SETTINGS` - Get current console settings
- `SET_JOY_SENS [value]` - Set joystick sensitivity
- `SET_LCD_BRIGHTNESS [value]` - Set LCD brightness
- `SET_BUZZER_VOLUME [value]` - Set buzzer volume
- `SAVE_SETTINGS` - Save settings to EEPROM
- `GET_STATS` - Get console statistics
- `GET_MEMORY` - Get memory usage information

## Building for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized static files ready for deployment.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically
4. Configure custom domain: `the-companion.app`

### Other Static Hosts

The built `dist/` folder can be deployed to:
- Netlify
- GitHub Pages
- Any static file hosting service

## Development Phases

### ✅ Phase 1: Web Serial Foundation (Current)
- Serial communication working
- Connection UI complete
- Settings sync functional
- Dashboard displaying console info

### 🚧 Phase 2: Game System (Next)
- Bytecode encoder
- Game installer component
- EEPROM game storage
- Menu system on Arduino

### 🚧 Phase 3: Polish & Features
- Additional games
- Statistics tracking
- Improved UI/UX
- Documentation

## Troubleshooting

### "Web Serial API not supported"
- Make sure you're using Chrome or Edge browser (version 89+)
- Web Serial API requires HTTPS (development on localhost is OK)

### Connection fails
- Check that Arduino is properly connected via USB
- Make sure correct firmware is uploaded
- Try a different USB port
- Check serial port isn't already open in another program

### Handshake timeout
- Arduino may need time to reset after USB connection
- Wait 2-3 seconds after connecting before clicking "Connect"
- Try disconnecting and reconnecting the USB cable

## License

MIT License - Created by _dev for NOTCH project

---

**Made with I w I**
