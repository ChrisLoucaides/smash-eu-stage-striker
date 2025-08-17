// Placeholder image service for stages
// This provides simple colored rectangles as placeholders until real stage images are available

export class PlaceholderImageService {
  private static readonly STAGE_COLORS = {
    battlefield: '#8B4513',        // Brown
    'final-destination': '#000000', // Black
    'small-battlefield': '#A0522D', // Saddle Brown
    'pokemon-stadium-2': '#32CD32', // Lime Green
    smashville: '#FFD700',         // Gold
    'town-and-city': '#4169E1',    // Royal Blue
    'kalos-pokemon-league': '#FF4500', // Orange Red
    'hollow-bastion': '#800080',   // Purple
    'yoshis-story': '#90EE90',     // Light Green (Yoshi's signature color)
  };

  /**
   * Generate a placeholder image URL for a stage
   * @param stageId - The stage ID
   * @param width - Image width (default: 300)
   * @param height - Image height (default: 169)
   * @returns Data URL for a colored placeholder
   */
  static getPlaceholderImage(stageId: string, width: number = 300, height: number = 169): string {
    const color = this.STAGE_COLORS[stageId as keyof typeof this.STAGE_COLORS] || '#6c757d';
    
    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
              fill="white" text-anchor="middle" dominant-baseline="middle">
          ${stageId.replace(/-/g, ' ').toUpperCase()}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Get all placeholder images for all stages
   * @returns Object mapping stage IDs to placeholder image URLs
   */
  static getAllPlaceholderImages(): Record<string, string> {
    const images: Record<string, string> = {};
    
    Object.keys(this.STAGE_COLORS).forEach(stageId => {
      images[stageId] = this.getPlaceholderImage(stageId);
    });
    
    return images;
  }

  /**
   * Check if a stage has a placeholder image
   * @param stageId - The stage ID to check
   * @returns True if the stage has a placeholder
   */
  static hasPlaceholder(stageId: string): boolean {
    return stageId in this.STAGE_COLORS;
  }
}
