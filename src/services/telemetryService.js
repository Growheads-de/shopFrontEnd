class TelemetryService {
  constructor(socket) {
    this.socket = socket;
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || !this.socket) {
      return;
    }

    // Override console.log
    console.log = (...args) => {
      // Call original console.log first
      this.originalConsole.log.apply(console, args);
      
      // Send to telemetry
      this.sendTelemetry('info', this.formatMessage(args));
    };

    // Override console.warn
    console.warn = (...args) => {
      // Call original console.warn first
      this.originalConsole.warn.apply(console, args);
      
      // Send to telemetry
      this.sendTelemetry('warn', this.formatMessage(args));
    };

    // Override console.error
    console.error = (...args) => {
      // Call original console.error first
      this.originalConsole.error.apply(console, args);
      
      // Send to telemetry
      this.sendTelemetry('error', this.formatMessage(args));
    };

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.sendTelemetry('error', `Unhandled Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.sendTelemetry('error', `Unhandled Promise Rejection: ${event.reason}`);
    });

    this.isInitialized = true;
  }

  formatMessage(args) {
    return args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  }

  sendTelemetry(level, message) {
    if (!this.socket) {
      return;
    }

    try {
      this.socket.emit('telemetry', {
        type: 'consoleLog',
        level: level,
        message: message,
        timecode: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      // Use original console.error to avoid infinite loop
      this.originalConsole.error('Failed to send telemetry:', error);
    }
  }

  destroy() {
    if (!this.isInitialized) {
      return;
    }

    // Restore original console methods
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;

    this.isInitialized = false;
  }
}

export default TelemetryService; 