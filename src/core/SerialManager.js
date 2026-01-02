/**
 * SerialManager - Web Serial API wrapper for NOTCH console communication
 * Handles connection, command sending, and response parsing
 */

export class SerialManager {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.isConnected = false;
    this.readableStreamClosed = null;
    this.writableStreamClosed = null;

    // Event callbacks
    this.onConnected = null;
    this.onDisconnected = null;
    this.onError = null;
    this.onData = null;

    // Check if Web Serial API is supported
    if (!('serial' in navigator)) {
      console.error('Web Serial API not supported in this browser');
      this.supported = false;
    } else {
      this.supported = true;
    }
  }

  /**
   * Check if Web Serial API is supported
   */
  isSupported() {
    return this.supported;
  }

  /**
   * Request and connect to a serial port
   */
  async connect() {
    if (!this.supported) {
      throw new Error('Web Serial API not supported. Use Chrome or Edge.');
    }

    try {
      // If already connected, disconnect first
      if (this.isConnected || this.port) {
        await this.disconnect();
      }

      // Request port access
      this.port = await navigator.serial.requestPort();

      // Check if port is already open
      const portInfo = await this.port.getInfo();

      // Open connection with 9600 baud rate
      await this.port.open({ baudRate: 9600 });

      // Get reader and writer
      const textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      const textEncoder = new TextEncoderStream();
      this.writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      this.isConnected = true;

      // Start reading loop
      this.startReading();

      // Trigger connected callback
      if (this.onConnected) {
        this.onConnected();
      }

      return true;
    } catch (error) {
      console.error('Connection failed:', error);

      // Clean up on connection failure
      await this.cleanup();

      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Start reading data from the port
   */
  async startReading() {
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await this.reader.read();

        if (done) {
          break;
        }

        // Append to buffer
        buffer += value;

        // Process complete lines (ending with \n)
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, newlineIndex).trim();
          buffer = buffer.substring(newlineIndex + 1);

          if (line && this.onData) {
            this.onData(line);
          }
        }
      }
    } catch (error) {
      console.error('Read error:', error);

      // Device was lost - clean up connection
      if (error.message && error.message.includes('device has been lost')) {
        await this.cleanup();

        // Trigger disconnected callback
        if (this.onDisconnected) {
          this.onDisconnected();
        }
      }

      if (this.onError) {
        this.onError(error);
      }
    }
  }

  /**
   * Send a command to the console
   */
  async sendCommand(command) {
    if (!this.isConnected || !this.writer) {
      throw new Error('Not connected');
    }

    try {
      await this.writer.write(command + '\n');
      return true;
    } catch (error) {
      console.error('Send error:', error);
      if (this.onError) {
        this.onError(error);
      }
      throw error;
    }
  }

  /**
   * Send a command and wait for response
   */
  async sendCommandWithResponse(command, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        // Remove listener
        this.onData = originalOnData;
        reject(new Error('Command timeout'));
      }, timeout);

      // Store original onData handler
      const originalOnData = this.onData;

      // Set temporary handler to capture response
      this.onData = (data) => {
        clearTimeout(timeoutId);

        // Restore original handler
        this.onData = originalOnData;

        // Also call original handler if it exists
        if (originalOnData) {
          originalOnData(data);
        }

        resolve(data);
      };

      // Send command
      this.sendCommand(command).catch(error => {
        clearTimeout(timeoutId);
        this.onData = originalOnData;
        reject(error);
      });
    });
  }

  /**
   * Clean up resources without triggering callbacks
   */
  async cleanup() {
    try {
      // Cancel reader
      if (this.reader) {
        try {
          await this.reader.cancel();
        } catch (e) {
          // Ignore errors during cleanup
        }
        if (this.readableStreamClosed) {
          await this.readableStreamClosed.catch(() => {});
        }
      }

      // Close writer
      if (this.writer) {
        try {
          await this.writer.close();
        } catch (e) {
          // Ignore errors during cleanup
        }
        if (this.writableStreamClosed) {
          await this.writableStreamClosed.catch(() => {});
        }
      }

      // Close port
      if (this.port) {
        try {
          await this.port.close();
        } catch (e) {
          // Port might already be closed
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    } finally {
      // Always reset state
      this.isConnected = false;
      this.reader = null;
      this.writer = null;
      this.port = null;
      this.readableStreamClosed = null;
      this.writableStreamClosed = null;
    }
  }

  /**
   * Disconnect from the port
   */
  async disconnect() {
    if (!this.isConnected && !this.port) {
      return;
    }

    await this.cleanup();

    // Trigger disconnected callback
    if (this.onDisconnected) {
      this.onDisconnected();
    }
  }

  /**
   * Check if currently connected
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}
