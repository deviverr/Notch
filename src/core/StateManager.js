/**
 * StateManager - Manages application state and provides reactive updates
 */

export class StateManager {
  constructor() {
    this.state = {
      connected: false,
      connecting: false,
      consoleInfo: null,
      settings: null,
      stats: null,
      memory: null,
      currentPanel: 'connection',
      error: null
    };

    this.listeners = [];
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Notify all listeners
    this.listeners.forEach(listener => {
      listener(this.state, oldState);
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Set connection status
   */
  setConnected(connected) {
    this.setState({ connected, connecting: false });
  }

  /**
   * Set connecting status
   */
  setConnecting(connecting) {
    this.setState({ connecting });
  }

  /**
   * Set console information
   */
  setConsoleInfo(info) {
    this.setState({ consoleInfo: info });
  }

  /**
   * Set settings
   */
  setSettings(settings) {
    this.setState({ settings });
  }

  /**
   * Update a single setting
   */
  updateSetting(key, value) {
    const settings = { ...this.state.settings, [key]: value };
    this.setState({ settings });
  }

  /**
   * Set statistics
   */
  setStats(stats) {
    this.setState({ stats });
  }

  /**
   * Set memory information
   */
  setMemory(memory) {
    this.setState({ memory });
  }

  /**
   * Set current panel
   */
  setCurrentPanel(panel) {
    this.setState({ currentPanel: panel });
  }

  /**
   * Set error
   */
  setError(error) {
    this.setState({ error });
  }

  /**
   * Clear error
   */
  clearError() {
    this.setState({ error: null });
  }
}
