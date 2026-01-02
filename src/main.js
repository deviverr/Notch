/**
 * Main Application Entry Point
 */

import { SerialManager } from './core/SerialManager.js';
import { ProtocolHandler } from './core/ProtocolHandler.js';
import { StateManager } from './core/StateManager.js';
import { ConnectionPanel } from './components/ConnectionPanel.js';
import { Dashboard } from './components/Dashboard.js';
import { IntroCutscene } from './components/IntroCutscene.js';

class NotchCompanionApp {
  constructor() {
    // Initialize core managers
    this.stateManager = new StateManager();
    this.serialManager = new SerialManager();
    this.protocolHandler = new ProtocolHandler(this.serialManager);

    // Component containers
    this.containers = {
      connection: document.getElementById('connection-panel'),
      dashboard: document.getElementById('dashboard')
    };

    // Initialize components
    this.components = {
      connection: null,
      dashboard: null
    };

    // Setup event handlers
    this.setupSerialHandlers();
    this.setupStateHandlers();

    // Check browser support
    this.checkSupport();

    // Show intro cutscene first
    this.showIntroCutscene();
  }

  showIntroCutscene() {
    const cutscene = new IntroCutscene(() => {
      // When cutscene completes, clean up and show connection panel
      cutscene.cleanup();
      this.showPanel('connection');
    });

    const cutsceneContainer = document.createElement('div');
    cutsceneContainer.innerHTML = cutscene.render();
    document.body.appendChild(cutsceneContainer);

    cutscene.start();
  }

  checkSupport() {
    if (!this.serialManager.isSupported()) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'message error';
      errorDiv.innerHTML = `
        <strong>Unsupported Browser</strong><br>
        Web Serial API is not supported in this browser.
        Please use Chrome or Edge to connect to your NOTCH console.
      `;
      this.containers.connection.prepend(errorDiv);
    }
  }

  setupSerialHandlers() {
    this.serialManager.onConnected = () => {
      console.log('Serial connected');
    };

    this.serialManager.onDisconnected = () => {
      console.log('Serial disconnected');
      this.stateManager.setConnected(false);
      this.showPanel('connection');
    };

    this.serialManager.onError = (error) => {
      console.error('Serial error:', error);
      this.stateManager.setError(error.message);
    };

    this.serialManager.onData = (data) => {
      console.log('Received:', data);
      // Handle any unsolicited data from console
    };
  }

  setupStateHandlers() {
    this.stateManager.subscribe((state, oldState) => {
      // Update UI based on state changes
      if (state.currentPanel !== oldState.currentPanel) {
        this.showPanel(state.currentPanel);
      }

      // Update navigation
      this.updateNavigation(state);
    });
  }

  updateNavigation(state) {
    // No navigation needed - simplified app
  }

  showPanel(panelName) {
    // Hide all panels
    Object.values(this.containers).forEach(container => {
      if (container) container.classList.add('hidden');
    });

    // Show requested panel
    const container = this.containers[panelName];
    if (container) {
      container.classList.remove('hidden');

      // Initialize component if needed
      if (panelName === 'connection' && !this.components.connection) {
        this.components.connection = new ConnectionPanel(
          container,
          this.stateManager,
          this.protocolHandler
        );
      } else if (panelName === 'dashboard' && !this.components.dashboard) {
        this.components.dashboard = new Dashboard(
          container,
          this.stateManager,
          this.protocolHandler
        );
      } else if (this.components[panelName]) {
        // Re-render component
        this.components[panelName].render();
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.notchApp = new NotchCompanionApp();
  console.log('NOTCH Companion App initialized');
});
