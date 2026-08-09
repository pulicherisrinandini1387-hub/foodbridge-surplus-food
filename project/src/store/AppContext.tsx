import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type { Store, AppState, AppActions } from './types';
import { createInitialState, computeMatches } from './types';
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

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const nowISO = () => new Date().toISOString();

type Action =
  | { type: 'SET_STATE'; state: Partial<AppState> }
  | { type: 'LOGIN'; userId: string }
  | { type: 'LOGOUT' }
  | { type: 'ADD_USER'; user: User }
  | { type: 'UPDATE_USER'; user: User }
  | { type: 'ADD_DONATION'; donation: Donation }
  | { type: 'UPDATE_DONATION'; donation: Donation }
  | { type: 'ADD_FOOD_NEED'; need: FoodNeed }
  | { type: 'UPDATE_FOOD_NEED'; need: FoodNeed }
  | { type: 'ADD_DELIVERY'; delivery: Delivery }
  | { type: 'UPDATE_DELIVERY'; delivery: Delivery }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ'; userId: string }
  | { type: 'ADD_CONVERSATION'; conversation: Conversation }
  | { type: 'UPDATE_CONVERSATION'; conversation: Conversation };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.state };
    case 'LOGIN':
      return { ...state, currentUserId: action.userId };
    case 'LOGOUT':
      return { ...state, currentUserId: null };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.user] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.user.id ? action.user : u)),
      };
    case 'ADD_DONATION':
      return { ...state, donations: [action.donation, ...state.donations] };
    case 'UPDATE_DONATION':
      return {
        ...state,
        donations: state.donations.map((d) => (d.id === action.donation.id ? action.donation : d)),
      };
    case 'ADD_FOOD_NEED':
      return { ...state, foodNeeds: [action.need, ...state.foodNeeds] };
    case 'UPDATE_FOOD_NEED':
      return {
        ...state,
        foodNeeds: state.foodNeeds.map((n) => (n.id === action.need.id ? action.need : n)),
      };
    case 'ADD_DELIVERY':
      return { ...state, deliveries: [action.delivery, ...state.deliveries] };
    case 'UPDATE_DELIVERY':
      return {
        ...state,
        deliveries: state.deliveries.map((d) => (d.id === action.delivery.id ? action.delivery : d)),
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.userId === action.userId ? { ...n, read: true } : n,
        ),
      };
    case 'ADD_CONVERSATION':
      return { ...state, conversations: [...state.conversations, action.conversation] };
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversation.id ? action.conversation : c,
        ),
      };
    default:
      return state;
  }
}

const AppContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const login = useCallback((email: string) => {
    const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'No account found with this email. Try the demo accounts below.' };
    dispatch({ type: 'LOGIN', userId: user.id });
    return { ok: true };
  }, [state.users]);

  const loginAs = useCallback((userId: string) => {
    dispatch({ type: 'LOGIN', userId });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const signup = useCallback((data: Partial<User> & { name: string; email: string; role: Role }) => {
    const existing = state.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) return { ok: false, error: 'An account with this email already exists.' };
    const colors = ['#16a34a', '#ea580c', '#0891b2', '#9333ea', '#f59e0b', '#7c2d12'];
    const newUser: User = {
      id: uid('u'),
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone || '',
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      location: data.location || 'Bengaluru',
      coords: data.coords || { lat: 12.9716, lng: 77.5946 },
      createdAt: nowISO(),
      donorType: data.donorType,
      orgType: data.orgType,
      registrationNumber: data.registrationNumber,
      verified: data.role === 'ngo' ? 'pending' : undefined,
      capacity: data.capacity,
      vehicleType: data.vehicleType,
      totalDeliveries: data.role === 'volunteer' ? 0 : undefined,
      rating: data.role === 'volunteer' ? 5.0 : undefined,
    };
    dispatch({ type: 'ADD_USER', user: newUser });
    dispatch({ type: 'LOGIN', userId: newUser.id });
    return { ok: true };
  }, [state.users]);

  const updateProfile = useCallback((data: Partial<User>) => {
    const current = state.users.find((u) => u.id === state.currentUserId);
    if (!current) return;
    dispatch({ type: 'UPDATE_USER', user: { ...current, ...data } });
  }, [state.users, state.currentUserId]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: { ...n, id: uid('n'), createdAt: nowISO(), read: false },
    });
  }, []);

  const postDonation = useCallback((data: Partial<Donation>): Donation => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId);
    if (!currentUser) throw new Error('Not logged in');
    const expiryMin = data.expiresAt ? Math.max(15, (new Date(data.expiresAt).getTime() - Date.now()) / 60000) : 120;
    const donation: Donation = {
      id: uid('d'),
      donorId: currentUser.id,
      donorName: currentUser.name,
      donorType: currentUser.donorType || 'Restaurant',
      foodName: data.foodName || 'Untitled',
      category: data.category || 'Cooked Meals',
      foodType: data.foodType || 'Vegetarian',
      quantity: data.quantity || '',
      meals: data.meals || 0,
      preparationTime: data.preparationTime || '',
      bestBefore: data.bestBefore || '',
      condition: data.condition || '',
      allergens: data.allergens || [],
      packaging: data.packaging || '',
      pickupAddress: data.pickupAddress || currentUser.location,
      pickupCoords: data.pickupCoords || currentUser.coords,
      pickupFrom: data.pickupFrom || '',
      pickupDeadline: data.pickupDeadline || '',
      contactPerson: data.contactPerson || currentUser.name,
      contactPhone: data.contactPhone || currentUser.phone,
      deliveryOption: data.deliveryOption || 'VOLUNTEER_REQUIRED',
      safetyDeclared: data.safetyDeclared ?? true,
      status: 'POSTED',
      distanceKm: data.distanceKm ?? Math.round(Math.random() * 5 + 1 + Number.EPSILON),
      postedAt: nowISO(),
      expiresAt: data.expiresAt || new Date(Date.now() + expiryMin * 60000).toISOString(),
      imageColor: data.imageColor || currentUser.avatarColor,
    };
    dispatch({ type: 'ADD_DONATION', donation });
    // Notify nearby NGOs
    state.users
      .filter((u) => u.role === 'ngo' && u.verified === 'verified')
      .forEach((ngo) => {
        addNotification({
          userId: ngo.id,
          message: `New donation: ${donation.meals} ${donation.foodType} meals from ${currentUser.name}.`,
          type: 'system',
          link: '/ngo/nearby-food',
        });
      });
    return donation;
  }, [state.users, state.currentUserId, addNotification]);

  const claimDonation = useCallback((donationId: string, ngoId: string) => {
    const donation = state.donations.find((d) => d.id === donationId);
    const ngo = state.users.find((u) => u.id === ngoId);
    if (!donation || !ngo) return { ok: false, error: 'Donation or NGO not found.' };
    if (donation.status !== 'POSTED') return { ok: false, error: 'This donation has already been claimed.' };
    if (ngo.verified !== 'verified') return { ok: false, error: 'Only verified organizations can claim donations.' };
    const expiryMs = new Date(donation.expiresAt).getTime() - Date.now();
    if (expiryMs <= 0) return { ok: false, error: 'This donation has expired and cannot be claimed.' };

    const updated: Donation = { ...donation, status: 'CLAIMED', claimedBy: ngoId, claimedByName: ngo.name };
    dispatch({ type: 'UPDATE_DONATION', donation: updated });
    addNotification({
      userId: donation.donorId,
      message: `${ngo.name} claimed your ${donation.meals} meals.`,
      type: 'claim',
      link: '/donor/my-donations',
    });
    return { ok: true };
  }, [state.donations, state.users, addNotification]);

  const assignVolunteer = useCallback((donationId: string, volunteerId: string) => {
    const donation = state.donations.find((d) => d.id === donationId);
    const volunteer = state.users.find((u) => u.id === volunteerId);
    if (!donation || !volunteer) return;
    const updated: Donation = {
      ...donation,
      status: 'PICKUP_ASSIGNED',
      volunteerId,
      volunteerName: volunteer.name,
    };
    dispatch({ type: 'UPDATE_DONATION', donation: updated });
    const ngo = state.users.find((u) => u.id === donation.claimedBy);
    addNotification({
      userId: donation.donorId,
      message: `Volunteer ${volunteer.name} accepted your pickup.`,
      type: 'volunteer',
      link: '/donor/pickup-requests',
    });
    if (ngo) {
      addNotification({
        userId: ngo.id,
        message: `Volunteer ${volunteer.name} is on the way to pick up ${donation.meals} meals.`,
        type: 'volunteer',
        link: '/ngo/deliveries',
      });
    }
  }, [state.donations, state.users, addNotification]);

  const updateDonationStatus = useCallback((donationId: string, status: DonationStatus) => {
    const donation = state.donations.find((d) => d.id === donationId);
    if (!donation) return;
    dispatch({ type: 'UPDATE_DONATION', donation: { ...donation, status } });
    if (status === 'DELIVERED' || status === 'COMPLETED') {
      addNotification({
        userId: donation.donorId,
        message: `Your donation of ${donation.meals} meals was successfully delivered.`,
        type: 'delivery',
        link: '/donor/active-donations',
      });
      if (donation.claimedBy) {
        addNotification({
          userId: donation.claimedBy,
          message: `Delivery completed — ${donation.meals} meals received.`,
          type: 'delivery',
          link: '/ngo/deliveries',
        });
      }
    }
  }, [state.donations, addNotification]);

  const updateDeliveryStatus = useCallback((deliveryId: string, status: DeliveryStatus, progress?: number) => {
    const delivery = state.deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return;
    const progMap: Record<DeliveryStatus, number> = {
      assigned: 0,
      en_route_pickup: 25,
      picked_up: 50,
      en_route_drop: 75,
      delivered: 100,
      cancelled: 0,
    };
    const updated: Delivery = { ...delivery, status, progress: progress ?? progMap[status] };
    dispatch({ type: 'UPDATE_DELIVERY', delivery: updated });
  }, [state.deliveries]);

  const postFoodNeed = useCallback((data: Partial<FoodNeed>): FoodNeed => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId);
    if (!currentUser) throw new Error('Not logged in');
    const need: FoodNeed = {
      id: uid('fn'),
      organizationId: currentUser.id,
      organizationName: currentUser.name,
      foodType: data.foodType || 'Vegetarian',
      mealsRequired: data.mealsRequired || 0,
      urgency: data.urgency || 'normal',
      requiredBy: data.requiredBy || '',
      location: data.location || currentUser.location,
      coords: data.coords || currentUser.coords,
      dietaryRequirements: data.dietaryRequirements || '',
      pickupCapability: data.pickupCapability ?? true,
      status: 'open',
      postedAt: nowISO(),
    };
    dispatch({ type: 'ADD_FOOD_NEED', need });
    state.users
      .filter((u) => u.role === 'donor')
      .forEach((donor) => {
        addNotification({
          userId: donor.id,
          message: `A nearby NGO needs ${need.mealsRequired} ${need.foodType} meals.`,
          type: 'need',
          link: '/donor/overview',
        });
      });
    return need;
  }, [state.users, state.currentUserId, addNotification]);

  const fulfillFoodNeed = useCallback((needId: string) => {
    const need = state.foodNeeds.find((n) => n.id === needId);
    if (!need) return;
    dispatch({ type: 'UPDATE_FOOD_NEED', need: { ...need, status: 'fulfilled' } });
  }, [state.foodNeeds]);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_READ', id });
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    dispatch({ type: 'MARK_ALL_READ', userId });
  }, []);

  const sendMessage = useCallback((conversationId: string, senderId: string, message: string) => {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    const sender = state.users.find((u) => u.id === senderId);
    if (!sender) return;
    const receiverId = conv.participantIds.find((id) => id !== senderId);
    if (!receiverId) return;
    const receiver = state.users.find((u) => u.id === receiverId);
    if (!receiver) return;
    const newMsg = {
      id: uid('m'),
      senderId,
      senderName: sender.name,
      receiverId,
      receiverName: receiver.name,
      message,
      timestamp: nowISO(),
      senderRole: sender.role,
    };
    const updated: Conversation = {
      ...conv,
      messages: [...conv.messages, newMsg],
      lastMessageAt: nowISO(),
    };
    dispatch({ type: 'UPDATE_CONVERSATION', conversation: updated });
  }, [state.conversations, state.users]);

  const startConversation = useCallback((userAId: string, userBId: string): string => {
    const existing = state.conversations.find(
      (c) => c.participantIds.includes(userAId) && c.participantIds.includes(userBId),
    );
    if (existing) return existing.id;
    const userA = state.users.find((u) => u.id === userAId);
    const userB = state.users.find((u) => u.id === userBId);
    if (!userA || !userB) return '';
    const conv: Conversation = {
      id: uid('conv'),
      participantIds: [userAId, userBId],
      participantNames: [userA.name, userB.name],
      messages: [],
      lastMessageAt: nowISO(),
    };
    dispatch({ type: 'ADD_CONVERSATION', conversation: conv });
    return conv.id;
  }, [state.conversations, state.users]);

  const verifyNGO = useCallback((userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) return;
    dispatch({ type: 'UPDATE_USER', user: { ...user, verified: 'verified' } });
    addNotification({
      userId,
      message: 'Your organization has been verified. You can now claim donations.',
      type: 'verification',
      link: '/ngo/profile',
    });
  }, [state.users, addNotification]);

  const rejectNGO = useCallback((userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) return;
    dispatch({ type: 'UPDATE_USER', user: { ...user, verified: 'rejected' } });
    addNotification({
      userId,
      message: 'Your verification was rejected. Please review your documents and reapply.',
      type: 'verification',
      link: '/ngo/profile',
    });
  }, [state.users, addNotification]);

  const suspendUser = useCallback((userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) return;
    dispatch({ type: 'UPDATE_USER', user: { ...user, verified: 'rejected' } });
  }, [state.users]);

  const calculateMatches = useCallback((donationId: string): MatchResult[] => {
    const donation = state.donations.find((d) => d.id === donationId);
    if (!donation) return [];
    return computeMatches(donation, state.users, state.foodNeeds);
  }, [state.donations, state.users, state.foodNeeds]);

  const getDonationById = useCallback((id: string) => state.donations.find((d) => d.id === id), [state.donations]);
  const getUserById = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);
  const getDeliveryByDonation = useCallback((donationId: string) => state.deliveries.find((d) => d.donationId === donationId), [state.deliveries]);

  const store: Store = {
    ...state,
    login,
    loginAs,
    logout,
    signup,
    updateProfile,
    postDonation,
    claimDonation,
    assignVolunteer,
    updateDonationStatus,
    updateDeliveryStatus,
    postFoodNeed,
    fulfillFoodNeed,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    sendMessage,
    startConversation,
    verifyNGO,
    rejectNGO,
    suspendUser,
    calculateMatches,
    getDonationById,
    getUserById,
    getDeliveryByDonation,
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp(): Store {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
