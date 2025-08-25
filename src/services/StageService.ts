import type { Stage } from '../types';

const getAssetPath = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || '/smash-eu-stage-striker/';
  return `${baseUrl}assets/stages/${path}`;
};

// All 9 legal stages for competitive Smash Bros. Ultimate
export const LEGAL_STAGES: Stage[] = [
  {
    id: 'battlefield',
    name: 'Battlefield',
    imageUrl: getAssetPath('battlefield.png'),
    isLegal: true,
  },
  {
    id: 'final-destination',
    name: 'Final Destination',
    imageUrl: getAssetPath('final-destination.png'),
    isLegal: true,
  },
  {
    id: 'small-battlefield',
    name: 'Small Battlefield',
    imageUrl: getAssetPath('small-battlefield.png'),
    isLegal: true,
  },
  {
    id: 'pokemon-stadium-2',
    name: 'Pokémon Stadium 2',
    imageUrl: getAssetPath('pokemon-stadium-2.png'),
    isLegal: true,
  },
  {
    id: 'smashville',
    name: 'Smashville',
    imageUrl: getAssetPath('smashville.png'),
    isLegal: true,
  },
  {
    id: 'town-and-city',
    name: 'Town and City',
    imageUrl: getAssetPath('town-and-city.png'),
    isLegal: true,
  },
  {
    id: 'kalos-pokemon-league',
    name: 'Kalos Pokémon League',
    imageUrl: getAssetPath('kalos-pokemon-league.png'),
    isLegal: true,
  },
  {
    id: 'hollow-bastion',
    name: 'Hollow Bastion',
    imageUrl: getAssetPath('hollow-bastion.png'),
    isLegal: true,
  },
  {
    id: 'yoshis-story',
    name: 'Yoshi\'s Story',
    imageUrl: getAssetPath('yoshis-story.png'),
    isLegal: true,
  },
];

export class StageService {
  /**
   * Get all legal stages
   */
  static getAllStages(): Stage[] {
    return [...LEGAL_STAGES];
  }

  /**
   * Get a stage by ID
   */
  static getStageById(id: string): Stage | undefined {
    return LEGAL_STAGES.find(stage => stage.id === id);
  }

  /**
   * Get stages that are not banned
   */
  static getAvailableStages(bannedStageIds: string[]): Stage[] {
    return LEGAL_STAGES.filter(stage => !bannedStageIds.includes(stage.id));
  }

  /**
   * Get banned stages
   */
  static getBannedStages(bannedStageIds: string[]): Stage[] {
    return LEGAL_STAGES.filter(stage => bannedStageIds.includes(stage.id));
  }

  /**
   * Get the number of stages that need to be banned for Game 1
   */
  static getGame1BanCount(): number {
    return 7; // 3-4-1 striking: 7 bans total
  }

  /**
   * Get the number of stages that need to be banned for Games 2+
   */
  static getGames2PlusBanCount(): number {
    return 3; // Winner bans 3, loser picks from remaining 6
  }

  /**
   * Get the number of stages available for selection after banning
   */
  static getStagesAvailableForSelection(gameNumber: number): number {
    if (gameNumber === 1) {
      return 2; // After 7 bans, 2 stages remain for selection
    } else {
      return 6; // After 3 bans, 6 stages remain for selection
    }
  }

  /**
   * Update stage images to use real images when available
   * @param imageMap - Object mapping stage IDs to image URLs
   */
  static updateStageImages(imageMap: Record<string, string>): void {
    LEGAL_STAGES.forEach(stage => {
      if (imageMap[stage.id]) {
        stage.imageUrl = imageMap[stage.id];
      }
    });
  }
}
