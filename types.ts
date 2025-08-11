
export interface User {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  phone: string;
  email: string;
  // Password is not stored in the user document
  block: string;
  profilePhotoUrl: string; 
  collegeIdUrl: string; 
  rating: number;
  deliveriesCompleted: number;
  walletBalance: number;
  isAdmin?: boolean;
  referralCode: string;
  referredByCode?: string;
  firstRechargeCompleted: boolean;
  usedCouponCodes: { [code: string]: number };
  createdAt: Date;
}

export enum GigStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

// Storing a subset of user info to avoid large document reads
export interface GigUser {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface Gig {
  id: string;
  requester: GigUser;
  deliverer?: GigUser;
  parcelInfo: string;
  pickupBlock: string;
  destinationBlock: string;
  price: number;
  deliveryDeadline: Date;
  postedAt: Date;
  status: GigStatus;
  otp: string;
  acceptanceSelfieUrl?: string;
  note?: string;
  size?: 'Small' | 'Medium' | 'Large';
  isUrgent?: boolean;
  // Feedback fields
  requesterRating?: number;
  requesterComments?: string;
  delivererRating?: number;
  delivererComments?: string;
}

export enum WalletRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface WalletLoadRequest {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    utr: string;
    screenshotUrl: string; 
    status: WalletRequestStatus;
    requestedAt: Date;
    couponCode?: string;
}

export enum WithdrawalRequestStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  upiId: string;
  status: WithdrawalRequestStatus;
  requestedAt: Date;
}

export type TransactionType = 'CREDIT' | 'DEBIT' | 'TOPUP' | 'PAYOUT' | 'WITHDRAWAL';

export interface Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    description: string;
    timestamp: Date;
    relatedGigId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  bonusPercentage: number; // e.g., 0.1 for 10%
  isActive: boolean;
  maxUsesPerUser: number;
}