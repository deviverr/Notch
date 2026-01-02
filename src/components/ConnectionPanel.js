/**
 * ConnectionPanel - UI component for connecting to NOTCH console
 */

export class ConnectionPanel {
  constructor(container, stateManager, protocolHandler) {
    this.container = container;
    this.state = stateManager;
    this.protocol = protocolHandler;
    this.render();
  }

  render() {
    const currentState = this.state.getState();

    this.container.innerHTML = `
      <div class="connection-panel">
        <h2>Connect to NOTCH</h2>

        ${!currentState.connected ? `
          <div class="connection-instructions">
            <p>To connect your NOTCH console:</p>
            <ol>
              <li>Connect your NOTCH console via USB</li>
              <li>Click the "Connect" button below</li>
              <li>Select the serial port in the popup</li>
              <li>Wait for the handshake to complete</li>
            </ol>

            <div class="browser-warning">
              <p><strong>Note:</strong> Web Serial API requires Chrome or Edge browser</p>
            </div>
          </div>

          <div class="connection-actions">
            <button id="connect-btn" class="primary" ${currentState.connecting ? 'disabled' : ''}>
              ${currentState.connecting ? 'Connecting...' : 'Connect Console'}
            </button>
          </div>
        ` : `
          <div class="connection-status">
            <div class="status-indicator connected"></div>
            <div class="connection-info">
              <h3>Connected</h3>
              <p>Console is ready</p>
            </div>
            <button id="disconnect-btn" class="danger">Disconnect</button>
          </div>

          ${currentState.consoleInfo ? `
            <div class="console-info-grid">
              <div class="info-card">
                <h4>Firmware</h4>
                <p>${currentState.consoleInfo.firmware || 'Unknown'}</p>
              </div>
              <div class="info-card">
                <h4>Version</h4>
                <p>${currentState.consoleInfo.version || 'Unknown'}</p>
              </div>
              <div class="info-card">
                <h4>Device</h4>
                <p>${currentState.consoleInfo.device || 'Unknown'}</p>
              </div>
            </div>
          ` : ''}
        `}

        ${currentState.error ? `
          <div class="message error">
            <strong>Error:</strong> ${currentState.error}
          </div>
        ` : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const connectBtn = this.container.querySelector('#connect-btn');
    const disconnectBtn = this.container.querySelector('#disconnect-btn');

    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.handleConnect());
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => this.handleDisconnect());
    }
  }

  async handleConnect() {
    this.state.setConnecting(true);
    this.state.clearError();
    this.render();

    try {
      // Connect via serial
      await this.protocol.serial.connect();

      // Send wake-up byte immediately to signal Arduino to skip tutorial
      try {
        await this.protocol.serial.sendCommand('\n');
      } catch (e) {
        // Ignore errors - wake-up is optional
      }

      // Wait a moment for Arduino to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Send handshake
      const handshakeResult = await this.protocol.handshake();

      if (handshakeResult.success) {
        this.state.setConnected(true);

        // Get console info (non-blocking - continue even if fails)
        try {
          const infoResult = await this.protocol.getInfo();
          if (infoResult.success) {
            this.state.setConsoleInfo(infoResult.info);
          } else {
            console.warn('GET_INFO failed:', infoResult.error);
          }
        } catch (infoError) {
          console.warn('GET_INFO exception:', infoError);
        }

        // Get settings (non-blocking)
        try {
          const settingsResult = await this.protocol.getSettings();
          if (settingsResult.success) {
            this.state.setSettings(settingsResult.settings);
          } else {
            console.warn('GET_SETTINGS failed:', settingsResult.error);
          }
        } catch (settingsError) {
          console.warn('GET_SETTINGS exception:', settingsError);
        }

        // Get memory info (non-blocking)
        try {
          const memoryResult = await this.protocol.getMemory();
          if (memoryResult.success) {
            this.state.setMemory(memoryResult.memory);
          } else {
            console.warn('GET_MEMORY failed:', memoryResult.error);
          }
        } catch (memoryError) {
          console.warn('GET_MEMORY exception:', memoryError);
        }

        // Switch to dashboard
        this.state.setCurrentPanel('dashboard');
      } else {
        throw new Error(handshakeResult.error || 'Handshake failed');
      }
    } catch (error) {
      this.state.setConnected(false);
      this.state.setConnecting(false);
      this.state.setError(error.message);
      this.render();
    }
  }

  async handleDisconnect() {
    try {
      await this.protocol.serial.disconnect();
      this.state.setConnected(false);
      this.state.setConsoleInfo(null);
      this.state.setSettings(null);
      this.state.setCurrentPanel('connection');
    } catch (error) {
      this.state.setError(error.message);
    }
  }
}
