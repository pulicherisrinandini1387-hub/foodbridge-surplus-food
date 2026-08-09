import type {
  User,
  Donation,
  FoodNeed,
  Delivery,
  Notification,
  Conversation,
  MatchResult,
  DonationStatus,
  DeliveryStatus,
  Role,
} from '@/types';
import {
  seedUsers,
  seedDonations,
  seedFoodNeeds,
  seedDeliveries,
  seedNotifications,
  seedConversations,
} from '@/data/seed';

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const nowISO = () => new Date().toISOString();

export interface AppState {
  users: User[];
  donations: Donation[];
  foodNeeds: FoodNeed[];
  deliveries: Delivery[];
  notifications: Notification[];
  conversations: Conversation[];
  currentUserId: string | null;
}

export interface AppActions {
  login: (email: string) => { ok: boolean; error?: string };
  loginAs: (userId: string) => void;
  logout: () => void;
  signup: (data: Partial<User> & { name: string; email: string; role: Role }) => { ok: boolean; error?: string };
  updateProfile: (data: Partial<User>) => void;
  postDonation: (data: Partial<Donation>) => Donation;
  claimDonation: (donationId: string, ngoId: string) => { ok: boolean; error?: string };
  assignVolunteer: (donationId: string, volunteerId: string) => void;
  updateDonationStatus: (donationId: string, status: DonationStatus) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus, progress?: number) => void;
  postFoodNeed: (data: Partial<FoodNeed>) => FoodNeed;
  fulfillFoodNeed: (needId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  sendMessage: (conversationId: string, senderId: string, message: string) => void;
  startConversation: (userAId: string, userBId: string) => string;
  verifyNGO: (userId: string) => void;
  rejectNGO: (userId: string) => void;
  suspendUser: (userId: string) => void;
  calculateMatches: (donationId: string) => MatchResult[];
  getDonationById: (id: string) => Donation | undefined;
  getUserById: (id: string) => User | undefined;
  getDeliveryByDonation: (donationId: string) => Delivery | undefined;
}

export type Store = AppState & AppActions;

export function createInitialState(): AppState {
  return {
    users: [...seedUsers],
    donations: [...seedDonations],
    foodNeeds: [...seedFoodNeeds],
    deliveries: [...seedDeliveries],
    notifications: [...seedNotifications],
    conversations: [...seedConversations],
    currentUserId: null,
  };
}

// Deterministic match scoring
export function computeMatches(donation: Donation, ngos: User[], foodNeeds: FoodNeed[]): MatchResult[] {
  const results: MatchResult[] = [];
  for (const ngo of ngos) {
    if (ngo.role !== 'ngo' || ngo.verified !== 'verified') continue;
    const need = foodNeeds.find((n) => n.organizationId === ngo.id && n.status === 'open');
    if (!need) continue;

    let score = 50;
    const reasons: string[] = [];

    // Distance factor (closer = better)
    const dist = donation.distanceKm;
    if (dist <= 2) { score += 20; reasons.push('Very close proximity'); }
    else if (dist <= 4) { score += 15; reasons.push('Nearby location'); }
    else if (dist <= 6) { score += 8; reasons.push('Within delivery range'); }
    else { score += 2; }

    // Food type compatibility
    if (need.foodType === donation.foodType) {
      score += 15;
      reasons.push('Exact food type match');
    } else if (
      (need.foodType === 'Vegetarian' && donation.foodType === 'Vegan') ||
      (need.foodType === 'Vegan' && donation.foodType === 'Vegetarian')
    ) {
      score += 10;
      reasons.push('Dietary compatible');
    } else {
      score -= 5;
    }

    // Quantity match
    const ratio = donation.meals / need.mealsRequired;
    if (ratio >= 0.8 && ratio <= 1.2) { score += 12; reasons.push('Ideal quantity match'); }
    else if (ratio >= 0.5) { score += 8; reasons.push('Good quantity coverage'); }
    else if (ratio > 1.2) { score += 5; reasons.push('Surplus covers need'); }
    else { score += 2; }

    // Urgency boost
    if (need.urgency === 'critical') { score += 10; reasons.push('Critical urgency'); }
    else if (need.urgency === 'high') { score += 7; reasons.push('High urgency'); }
    else if (need.urgency === 'medium') { score += 4; }

    // Pickup availability
    if (donation.deliveryOption === 'NGO_PICKUP' && need.pickupCapability) {
      score += 8; reasons.push('Pickup capability aligned');
    } else if (donation.deliveryOption === 'VOLUNTEER_REQUIRED') {
      score += 5; reasons.push('Volunteer delivery available');
    } else if (donation.deliveryOption === 'DONOR_DELIVERS') {
      score += 6; reasons.push('Donor will deliver');
    }

    // Expiry — sooner expiry means more urgent to match
    const expiryMs = new Date(donation.expiresAt).getTime() - Date.now();
    if (expiryMs < 60 * 60 * 1000) { score += 5; reasons.push('Expiring soon — needs fast match'); }

    score = Math.min(99, Math.max(40, Math.round(score)));

    results.push({
      donationId: donation.id,
      ngoId: ngo.id,
      ngoName: ngo.name,
      score,
      distanceKm: dist,
      mealsNeeded: need.mealsRequired,
      pickupAvailable: need.pickupCapability,
      urgency: need.urgency,
      reasons,
    });
  }
  return results.sort((a, b) => b.score - a.score);
}
