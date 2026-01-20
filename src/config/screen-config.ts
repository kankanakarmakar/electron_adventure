/**
 * Screen Configuration Utility
 * Helps manage multi-screen setup and WebSocket connections
 */

export interface ScreenConfig {
  screenType: 'display' | 'control' | 'auto';
  wsUrl: string;
  wsPort: number;
  wsHost: string;
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  debugMode: boolean;
}

const DEFAULT_CONFIG: ScreenConfig = {
  screenType: 'auto',
  wsUrl: '',
  wsPort: parseInt(import.meta.env.REACT_APP_WS_PORT || '8081'),
  wsHost: import.meta.env.REACT_APP_WS_HOST || window.location.hostname,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  debugMode: import.meta.env.DEV,
};

class ScreenConfigManager {
  private config: ScreenConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from multiple sources (in order of precedence):
   * 1. URL parameters
   * 2. LocalStorage
   * 3. Environment variables
   * 4. Defaults
   */
  private loadConfig(): ScreenConfig {
    const config = { ...DEFAULT_CONFIG };

    // 1. Check URL parameters
    const params = new URLSearchParams(window.location.search);
    if (params.has('mode')) {
      const mode = params.get('mode');
      if (mode === 'display' || mode === 'control') {
        config.screenType = mode;
      }
    }

    if (params.has('wsHost')) {
      config.wsHost = params.get('wsHost')!;
    }

    if (params.has('wsPort')) {
      config.wsPort = parseInt(params.get('wsPort')!);
    }

    if (params.has('debug')) {
      config.debugMode = params.get('debug') === 'true';
    }

    // 2. Check localStorage
    const stored = localStorage.getItem('screenConfig');
    if (stored) {
      try {
        const storedConfig = JSON.parse(stored);
        Object.assign(config, storedConfig);
      } catch (e) {
        console.warn('Failed to parse stored config:', e);
      }
    }

    // 3. Build WebSocket URL
    config.wsUrl = `ws://${config.wsHost}:${config.wsPort}`;

    if (config.debugMode) {
      console.log('[ScreenConfig] Loaded configuration:', config);
    }

    return config;
  }

  /**
   * Get current configuration
   */
  getConfig(): ScreenConfig {
    return { ...this.config };
  }

  /**
   * Get screen type (detect if auto)
   */
  getScreenType(): 'display' | 'control' {
    if (this.config.screenType !== 'auto') {
      return this.config.screenType;
    }

    // Auto-detect based on URL or default to display
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    return (mode === 'control') ? 'control' : 'display';
  }

  /**
   * Get WebSocket URL
   */
  getWebSocketUrl(): string {
    return this.config.wsUrl;
  }

  /**
   * Update configuration
   */
  updateConfig(partial: Partial<ScreenConfig>): void {
    this.config = { ...this.config, ...partial };

    // Rebuild WebSocket URL if host or port changed
    if (partial.wsHost || partial.wsPort) {
      this.config.wsUrl = `ws://${this.config.wsHost}:${this.config.wsPort}`;
    }

    // Save to localStorage
    localStorage.setItem('screenConfig', JSON.stringify(this.config));

    if (this.config.debugMode) {
      console.log('[ScreenConfig] Updated configuration:', this.config);
    }
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    localStorage.removeItem('screenConfig');
    console.log('[ScreenConfig] Reset to defaults');
  }

  /**
   * Get debug enabled status
   */
  isDebugEnabled(): boolean {
    return this.config.debugMode;
  }

  /**
   * Log configuration summary
   */
  printSummary(): void {
    console.log('╔════════════════════════════════════╗');
    console.log('║  Screen Configuration Summary      ║');
    console.log('╠════════════════════════════════════╣');
    console.log(`║ Screen Type: ${this.getScreenType().padEnd(19)} ║`);
    console.log(`║ WebSocket URL: ${this.config.wsUrl.padEnd(17)} ║`);
    console.log(`║ Auto Reconnect: ${String(this.config.autoReconnect).padEnd(16)} ║`);
    console.log(`║ Debug Mode: ${String(this.config.debugMode).padEnd(22)} ║`);
    console.log('╚════════════════════════════════════╝');
  }
}

// Singleton instance
let instance: ScreenConfigManager | null = null;

export function getScreenConfig(): ScreenConfigManager {
  if (!instance) {
    instance = new ScreenConfigManager();
  }
  return instance;
}

export default ScreenConfigManager;
