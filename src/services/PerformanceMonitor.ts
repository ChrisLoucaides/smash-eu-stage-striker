/**
 * Performance monitoring service for mobile optimization
 */
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  private static observers: PerformanceObserver[] = [];

  /**
   * Initialize performance monitoring
   */
  static init(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();

    // Monitor resource loading
    this.observeResourceTiming();

    // Monitor long tasks
    this.observeLongTasks();

    // Monitor memory usage
    this.observeMemoryUsage();

    console.log('Performance monitoring initialized');
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  private static observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.metrics.set('LCP', lastEntry.startTime);
        this.logMetric('LCP', lastEntry.startTime);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  private static observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.set('FID', entry.processingStart - entry.startTime);
          this.logMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   */
  private static observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.metrics.set('CLS', clsValue);
        this.logMetric('CLS', clsValue);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }

  /**
   * Observe First Contentful Paint (FCP)
   */
  private static observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.set('FCP', entry.startTime);
          this.logMetric('FCP', entry.startTime);
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observation failed:', error);
    }
  }

  /**
   * Observe Time to First Byte (TTFB)
   */
  private static observeTTFB(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const ttfb = entry.responseStart - entry.requestStart;
          this.metrics.set('TTFB', ttfb);
          this.logMetric('TTFB', ttfb);
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('TTFB observation failed:', error);
    }
  }

  /**
   * Observe resource loading performance
   */
  private static observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          // Monitor image loading performance
          if (entry.name.includes('.webp') || entry.name.includes('.png') || entry.name.includes('.jpg')) {
            const loadTime = entry.responseEnd - entry.requestStart;
            this.logMetric('Image Load Time', loadTime, entry.name);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing observation failed:', error);
    }
  }

  /**
   * Observe long tasks that block the main thread
   */
  private static observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.logMetric('Long Task', entry.duration);
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task observation failed:', error);
    }
  }

  /**
   * Monitor memory usage
   */
  private static observeMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.set('Memory Used', memory.usedJSHeapSize);
        this.metrics.set('Memory Total', memory.totalJSHeapSize);
        this.metrics.set('Memory Limit', memory.jsHeapSizeLimit);
      }
    };

    // Check memory usage every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  /**
   * Log performance metrics
   */
  private static logMetric(name: string, value: number, context?: string): void {
    const message = context 
      ? `Performance: ${name} = ${value.toFixed(2)}ms (${context})`
      : `Performance: ${name} = ${value.toFixed(2)}ms`;
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(message);
    }

    // Send to analytics in production
    if (import.meta.env.PROD) {
      this.sendToAnalytics(name, value, context);
    }
  }

  /**
   * Send metrics to analytics service
   */
  private static sendToAnalytics(name: string, value: number, context?: string): void {
    // You can integrate with Google Analytics, Mixpanel, or any other analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        context: context || 'unknown'
      });
    }
  }

  /**
   * Get all collected metrics
   */
  static getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Get a specific metric
   */
  static getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Check if performance is good based on Core Web Vitals thresholds
   */
  static getPerformanceScore(): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    details: Record<string, { value: number; threshold: number; passed: boolean }>;
  } {
    const thresholds = {
      LCP: 2500, // Good: < 2.5s, Needs Improvement: 2.5s - 4s, Poor: > 4s
      FID: 100,  // Good: < 100ms, Needs Improvement: 100ms - 300ms, Poor: > 300ms
      CLS: 0.1,  // Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
      FCP: 1800, // Good: < 1.8s, Needs Improvement: 1.8s - 3s, Poor: > 3s
      TTFB: 800  // Good: < 800ms, Needs Improvement: 800ms - 1.8s, Poor: > 1.8s
    };

    const details: Record<string, { value: number; threshold: number; passed: boolean }> = {};
    let passedCount = 0;
    let totalCount = 0;

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = this.metrics.get(metric) || 0;
      const passed = value <= threshold;
      details[metric] = { value, threshold, passed };
      
      if (passed) passedCount++;
      totalCount++;
    });

    const score = Math.round((passedCount / totalCount) * 100);
    
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { score, grade, details };
  }

  /**
   * Clean up observers
   */
  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }

  /**
   * Detect if device is on slow connection
   */
  static isSlowConnection(): boolean {
    // @ts-ignore - connection API is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return false;
    
    return connection.effectiveType === '2g' || 
           connection.effectiveType === '3g' || 
           connection.downlink < 1.5;
  }

  /**
   * Detect if device has limited memory
   */
  static hasLimitedMemory(): boolean {
    // @ts-ignore - deviceMemory API is not in all TypeScript definitions
    const deviceMemory = navigator.deviceMemory;
    if (!deviceMemory) return false;
    
    return deviceMemory < 4; // Less than 4GB RAM
  }

  /**
   * Get device capabilities for optimization decisions
   */
  static getDeviceCapabilities(): {
    isSlowConnection: boolean;
    hasLimitedMemory: boolean;
    prefersReducedMotion: boolean;
    isMobile: boolean;
  } {
    return {
      isSlowConnection: this.isSlowConnection(),
      hasLimitedMemory: this.hasLimitedMemory(),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
  }
}
