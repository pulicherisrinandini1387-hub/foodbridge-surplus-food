export type Role = 'donor' | 'ngo' | 'volunteer' | 'admin';

export type DonorType =
  | 'Restaurant'
  | 'Hotel'
  | 'Caterer'
  | 'Grocery Store'
  | 'Event Organizer'
  | 'Household';

export type OrgType = 'NGO' | 'Shelter' | 'Orphanage' | 'Community Kitchen';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Raw Produce'
  | 'Bakery'
  | 'Dairy'
  | 'Grains & Staples'
  | 'Beverages'
  | 'Snacks & Packaged';

export type FoodType = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';

export type DonationStatus =
  | 'POSTED'
  | 'CLAIMED'
  | 'PICKUP_ASSIGNED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export type DeliveryOption = 'NGO_PICKUP' | 'VOLUNTEER_REQUIRED' | 'DONOR_DELIVERS';

export type Urgency = 'critical' | 'high' | 'medium' | 'normal';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type FoodNeedStatus = 'open' | 'fulfilled' | 'expired';

export type DeliveryStatus =
  | 'assigned'
  | 'en_route_pickup'
  | 'picked_up'
  | 'en_route_drop'
  | 'delivered'
  | 'cancelled';

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  avatarColor: string;
  location: string;
  coords: { lat: number; lng: number };
  createdAt: string;
  // donor
  donorType?: DonorType;
  // ngo
  orgType?: OrgType;
  registrationNumber?: string;
  verified?: VerificationStatus;
  capacity?: number;
  // volunteer
  vehicleType?: string;
  totalDeliveries?: number;
  rating?: number;
  isDemo?: boolean;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorType: DonorType;
  foodName: string;
  category: FoodCategory;
  foodType: FoodType;
  quantity: string;
  meals: number;
  preparationTime: string;
  bestBefore: string;
  condition: string;
  allergens: string[];
  packaging: string;
  pickupAddress: string;
  pickupCoords: { lat: number; lng: number };
  pickupFrom: string;
  pickupDeadline: string;
  contactPerson: string;
  contactPhone: string;
  deliveryOption: DeliveryOption;
  safetyDeclared: boolean;
  status: DonationStatus;
  claimedBy?: string;
  claimedByName?: string;
  volunteerId?: string;
  volunteerName?: string;
  distanceKm: number;
  postedAt: string;
  expiresAt: string;
  imageColor: string;
}

export interface FoodNeed {
  id: string;
  organizationId: string;
  organizationName: string;
  foodType: FoodType;
  mealsRequired: number;
  urgency: Urgency;
  requiredBy: string;
  location: string;
  coords: { lat: number; lng: number };
  dietaryRequirements: string;
  pickupCapability: boolean;
  status: FoodNeedStatus;
  postedAt: string;
}

export interface Delivery {
  id: string;
  donationId: string;
  volunteerId: string;
  volunteerName: string;
  donorId: string;
  donorName: string;
  ngoId: string;
  ngoName: string;
  pickupLocation: string;
  pickupCoords: { lat: number; lng: number };
  dropLocation: string;
  dropCoords: { lat: number; lng: number };
  status: DeliveryStatus;
  estimatedArrival: string;
  distanceKm: number;
  meals: number;
  createdAt: string;
  progress: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'claim' | 'volunteer' | 'delivery' | 'need' | 'expiry' | 'system' | 'verification';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  senderRole: Role;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  messages: ChatMessage[];
  lastMessageAt: string;
}

export interface MatchResult {
  donationId: string;
  ngoId: string;
  ngoName: string;
  score: number;
  distanceKm: number;
  mealsNeeded: number;
  pickupAvailable: boolean;
  urgency: Urgency;
  reasons: string[];
}

export interface ImpactBadge {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
  description: string;
}
