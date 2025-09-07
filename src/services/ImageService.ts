/**
 * Image loading service with lazy loading and optimization
 */
export class ImageService {
  private static imageCache = new Map<string, HTMLImageElement>();
  private static loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  /**
   * Preload images with lazy loading
   */
  static async preloadImages(imageUrls: string[]): Promise<void> {
    const promises = imageUrls.map(url => this.loadImage(url));
    await Promise.allSettled(promises);
  }

  /**
   * Load a single image with caching
   */
  static async loadImage(url: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!;
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create new loading promise
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      // Optimize image loading
      img.crossOrigin = 'anonymous';
      img.loading = 'lazy';
      
      img.onload = () => {
        this.imageCache.set(url, img);
        this.loadingPromises.delete(url);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Get optimized image URL with WebP support
   */
  static getOptimizedImageUrl(baseUrl: string, _width?: number, _quality: number = 80): string {
    // For now, return the base URL
    // In production, you could integrate with an image optimization service
    return baseUrl;
  }

  /**
   * Create responsive image srcset
   */
  static createResponsiveSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${this.getOptimizedImageUrl(baseUrl, size)} ${size}w`)
      .join(', ');
  }

  /**
   * Check if device prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if device is on slow connection
   */
  static isSlowConnection(): boolean {
    // @ts-ignore - connection API is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return false;
    
    // Consider slow if effective type is 2g or 3g
    return connection.effectiveType === '2g' || connection.effectiveType === '3g';
  }

  /**
   * Get appropriate image quality based on connection
   */
  static getImageQuality(): number {
    if (this.isSlowConnection()) {
      return 60; // Lower quality for slow connections
    }
    return 80; // Default quality
  }

  /**
   * Clear image cache (useful for memory management)
   */
  static clearCache(): void {
    this.imageCache.clear();
    this.loadingPromises.clear();
  }
}
