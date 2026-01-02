/**
 * Dashboard - Main dashboard component showing console status and quick actions
 */

export class Dashboard {
  constructor(container, stateManager, protocolHandler) {
    this.container = container;
    this.state = stateManager;
    this.protocol = protocolHandler;
    this.initialized = false;
    this.render();
    this.loadDashboardData();
  }

  async loadDashboardData() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // Fetch memory and stats automatically
      const [memoryResult, statsResult] = await Promise.all([
        this.protocol.getMemory(),
        this.protocol.getStats()
      ]);

      if (memoryResult.success) this.state.setMemory(memoryResult.memory);
      if (statsResult.success) this.state.setStats(statsResult.stats);

      // Re-render with the new data
      this.render();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  render() {
    const currentState = this.state.getState();
    const nickname = localStorage.getItem('notch_nickname') || 'Guest';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    this.container.innerHTML = `
      <div class="dashboard">
        <div class="greeting-section">
          <h2>Hello, ${nickname}!</h2>
          <p class="current-date">${currentDate}</p>
        </div>

        ${currentState.memory ? `
          <div class="stats-section">
            <h3>Console Statistics</h3>
            <div class="console-info-grid">
              <div class="info-card">
                <h4>Free SRAM</h4>
                <p>${currentState.memory.sram} bytes</p>
              </div>
              <div class="info-card">
                <h4>Flash Memory</h4>
                <p>${(currentState.memory.flash / 1024).toFixed(1)} KB</p>
              </div>
              <div class="info-card">
                <h4>EEPROM</h4>
                <p>${currentState.memory.eeprom} bytes</p>
              </div>
              <div class="info-card">
                <h4>Console Date</h4>
                <p>${currentDate}</p>
              </div>
            </div>
          </div>
        ` : `
          <div class="loading-message">
            <p>Loading console statistics...</p>
          </div>
        `}

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <button id="refresh-btn" class="btn-primary">Refresh Console Info</button>
          <button id="ping-btn" class="btn-primary">Test Connection</button>
          <button id="skip-tutorial-btn" class="btn-primary">Skip to Menu</button>
        </div>

        <div id="action-result"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const refreshBtn = this.container.querySelector('#refresh-btn');
    const pingBtn = this.container.querySelector('#ping-btn');
    const skipTutorialBtn = this.container.querySelector('#skip-tutorial-btn');
    const resultDiv = this.container.querySelector('#action-result');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Refreshing...';

        try {
          const memoryResult = await this.protocol.getMemory();

          if (memoryResult.success) {
            this.state.setMemory(memoryResult.memory);
            this.render();
            resultDiv.innerHTML = '<div class="message success">Console info refreshed!</div>';
          } else {
            resultDiv.innerHTML = '<div class="message error">Failed to refresh info</div>';
          }
          setTimeout(() => resultDiv.innerHTML = '', 3000);
        } catch (error) {
          resultDiv.innerHTML = `<div class="message error">Refresh failed: ${error.message}</div>`;
        } finally {
          refreshBtn.disabled = false;
          refreshBtn.textContent = 'Refresh Console Info';
        }
      });
    }

    if (pingBtn) {
      pingBtn.addEventListener('click', async () => {
        pingBtn.disabled = true;
        pingBtn.textContent = 'Testing...';

        try {
          const result = await this.protocol.ping();

          if (result.success) {
            resultDiv.innerHTML = '<div class="message success">Connection OK!</div>';
          } else {
            resultDiv.innerHTML = '<div class="message error">Connection failed</div>';
          }

          setTimeout(() => resultDiv.innerHTML = '', 3000);
        } catch (error) {
          resultDiv.innerHTML = `<div class="message error">Test failed: ${error.message}</div>`;
        } finally {
          pingBtn.disabled = false;
          pingBtn.textContent = 'Test Connection';
        }
      });
    }

    if (skipTutorialBtn) {
      skipTutorialBtn.addEventListener('click', async () => {
        skipTutorialBtn.disabled = true;
        skipTutorialBtn.textContent = 'Skipping...';

        try {
          const result = await this.protocol.openMenu();

          if (result.success) {
            resultDiv.innerHTML = '<div class="message success">Jumped to menu!</div>';
          } else {
            resultDiv.innerHTML = '<div class="message error">Failed to skip</div>';
          }

          setTimeout(() => resultDiv.innerHTML = '', 3000);
        } catch (error) {
          resultDiv.innerHTML = `<div class="message error">Error: ${error.message}</div>`;
        } finally {
          skipTutorialBtn.disabled = false;
          skipTutorialBtn.textContent = 'Skip to Menu';
        }
      });
    }
  }
}