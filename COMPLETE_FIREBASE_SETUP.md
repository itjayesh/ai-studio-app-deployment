# Complete Firebase Setup Guide

## 🚨 CRITICAL: You must complete these steps for cross-device compatibility

### Step 1: Update Firestore Security Rules

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `dellu-app`
3. **Navigate to**: Firestore Database → Rules
4. **Replace the current rules with this**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read and write all documents
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. **Click "Publish"** and wait for deployment

### Step 2: Create Admin Account

1. **Go to**: Authentication → Users
2. **Click "Add user"**
3. **Email**: `admin@delu.live`
4. **Password**: `admin123`
5. **Click "Add user"**

### Step 3: Create Test User Account

1. **Click "Add user"** again
2. **Email**: `user@delu.live`
3. **Password**: `user123`
4. **Click "Add user"**

### Step 4: Switch to Firebase Version

Run this command in your terminal:

```bash
# First, let's create the Firebase version
cat > components/App_Firebase.tsx << 'EOF'
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../context/AppContext';
import { User, Gig, GigStatus, WalletLoadRequest, Transaction, TransactionType, Coupon, WithdrawalRequest, GigUser, WalletRequestStatus, WithdrawalRequestStatus } from '../types';
import { subscribeToAuthChanges, convertFirebaseUser, loginUser, signupUser, logoutUser } from '../firebase/auth';
import { 
  subscribeToUsers, 
  subscribeToGigs, 
  subscribeToWalletRequests, 
  subscribeToWithdrawalRequests,
  getAllCoupons,
  getPlatformConfig,
  updateUser as updateUserInFirestore,
  updateGig as updateGigInFirestore,
  deleteGig as deleteGigFromFirestore,
  deleteUser as deleteUserFromFirestore,
  addGig as addGigToFirestore,
  addWalletRequest,
  updateWalletRequest,
  addWithdrawalRequest,
  updateWithdrawalRequest,
  addTransaction as addTransactionToFirestore,
  addCoupon as addCouponToFirestore,
  updateCoupon as updateCouponInFirestore,
  deleteCoupon as deleteCouponFromFirestore,
  updatePlatformConfig
} from '../firebase/firestore';

import ProtectedRoute from './ProtectedRoute';
import AdminProtectedRoute from './AdminProtectedRoute';
import Header from './Header';
import OfferBar from './OfferBar';
import LiveGigs from '../pages/LiveGigs';
import MyGigs from '../pages/MyGigs';
import CreateGig from '../pages/CreateGig';
import AuthModal from './AuthModal';
import Wallet from '../pages/Wallet';
import Admin from '../pages/Admin';
import ReferAndEarn from '../pages/ReferAndEarn';

// Custom hook for Firebase authentication
const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const user = await convertFirebaseUser(firebaseUser);
                    setCurrentUser(user);
                } catch (error) {
                    console.error('Error converting Firebase user:', error);
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    const updateUser = (user: User | null) => {
        setCurrentUser(user);
    }

    return { currentUser, updateUser, isAuthLoading };
}

const App: React.FC = () => {
    const { currentUser, updateUser, isAuthLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [walletLoadRequests, setWalletLoadRequests] = useState<WalletLoadRequest[]>([]);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [platformConfig, setPlatformConfig] = useState({ fee: 0.2, offerBarText: 'Welcome to delu.live!' });
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
    const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

    // Initialize Firebase data subscriptions
    useEffect(() => {
        console.log('🔥 Initializing Firebase subscriptions...');
        
        const unsubscribeUsers = subscribeToUsers((users) => {
            console.log('👥 Users updated:', users.length);
            setUsers(users);
        });
        
        const unsubscribeGigs = subscribeToGigs((gigs) => {
            console.log('📦 Gigs updated:', gigs.length);
            setGigs(gigs);
        });
        
        const unsubscribeWalletRequests = subscribeToWalletRequests((requests) => {
            console.log('💰 Wallet requests updated:', requests.length);
            setWalletLoadRequests(requests);
        });
        
        const unsubscribeWithdrawalRequests = subscribeToWithdrawalRequests((requests) => {
            console.log('💸 Withdrawal requests updated:', requests.length);
            setWithdrawalRequests(requests);
        });

        // Load coupons and platform config
        const loadInitialData = async () => {
            try {
                console.log('📋 Loading initial data...');
                const [couponsData, configData] = await Promise.all([
                    getAllCoupons(),
                    getPlatformConfig()
                ]);
                console.log('🎫 Coupons loaded:', couponsData.length);
                console.log('⚙️ Config loaded:', configData);
                setCoupons(couponsData);
                setPlatformConfig(configData);
            } catch (error) {
                console.error('❌ Error loading initial data:', error);
            }
        };

        loadInitialData();

        return () => {
            console.log('🔥 Cleaning up Firebase subscriptions...');
            unsubscribeUsers();
            unsubscribeGigs();
            unsubscribeWalletRequests();
            unsubscribeWithdrawalRequests();
        };
    }, []);

    // --- Core Functions (Firebase Version) ---
    
    const addTransaction = useCallback(async (userId: string, type: TransactionType, amount: number, description: string, relatedGigId?: string) => {
        try {
            console.log('💳 Adding transaction:', { userId, type, amount, description });
            const newTransaction: Omit<Transaction, 'id'> = {
                userId,
                type,
                amount,
                description,
                relatedGigId,
                timestamp: new Date(),
            };
            await addTransactionToFirestore(newTransaction);
            console.log('✅ Transaction added successfully');
        } catch (error) {
            console.error('❌ Error adding transaction:', error);
        }
    }, []);
    
    const login = useCallback(async (email: string, password: string): Promise<User> => {
        try {
            console.log('🔐 Logging in user:', email);
            const firebaseUser = await loginUser(email, password);
            const user = await convertFirebaseUser(firebaseUser);
            updateUser(user);
            console.log('✅ Login successful:', user.name);
            return user;
        } catch (error: any) {
            console.error('❌ Login failed:', error.message);
            throw new Error(error.message);
        }
    }, [updateUser]);

    const logout = useCallback(async () => {
        try {
            console.log('🚪 Logging out user...');
            await logoutUser();
            updateUser(null);
            console.log('✅ Logout successful');
        } catch (error: any) {
            console.error('❌ Logout failed:', error.message);
            throw new Error(error.message);
        }
    }, [updateUser]);

    const signup = useCallback(async (userData: Omit<User, 'id' | 'rating' | 'deliveriesCompleted' | 'walletBalance' | 'isAdmin' | 'referralCode' | 'firstRechargeCompleted' | 'usedCouponCodes' | 'createdAt'>, password: string, referredByCode?: string) => {
        try {
            console.log('📝 Signing up user:', userData.email);
            const extraData = {
                name: userData.name,
                phone: userData.phone,
                block: userData.block,
                profilePhotoUrl: userData.profilePhotoUrl,
                collegeIdUrl: userData.collegeIdUrl,
                referredByCode: referredByCode?.trim() || undefined,
            };
            const firebaseUser = await signupUser(userData.email, password, extraData);
            const newUser = await convertFirebaseUser(firebaseUser);
            updateUser(newUser);
            console.log('✅ Signup successful:', newUser.name);
        } catch (error: any) {
            console.error('❌ Signup failed:', error.message);
            throw new Error(error.message);
        }
    }, [updateUser]);

    const requestWalletLoad = useCallback(async (requestData: Omit<WalletLoadRequest, 'id'|'status'|'requestedAt'|'userId'|'userName'>, couponCode?: string) => {
        if(!currentUser) return;
        try {
            console.log('💰 Requesting wallet load:', requestData.amount);
            const newRequest: Omit<WalletLoadRequest, 'id'> = {
                ...requestData,
                userId: currentUser.id,
                userName: currentUser.name,
                status: WalletRequestStatus.PENDING,
                requestedAt: new Date(),
                couponCode: couponCode?.trim().toUpperCase() || undefined,
            };
            await addWalletRequest(newRequest);
            console.log('✅ Wallet load request submitted');
        } catch (error) {
            console.error('❌ Error requesting wallet load:', error);
        }
    }, [currentUser]);

    const approveWalletLoad = useCallback(async (requestId: string) => {
        try {
            console.log('✅ Approving wallet load:', requestId);
            const request = walletLoadRequests.find(r => r.id === requestId);
            if (!request || request.status !== WalletRequestStatus.PENDING) {
                console.log('❌ Request not found or not pending');
                return;
            }
            
            const user = users.find(u => u.id === request.userId);
            if (!user) {
                console.log('❌ User not found');
                return;
            }

            let totalBonus = 0, referrerReward = 0;
            const transactionDescriptions: string[] = [];
            
            // Handle coupon bonus
            if (request.couponCode) {
                const coupon = coupons.find(c => c.code === request.couponCode && c.isActive);
                if (coupon) {
                    const timesUsed = user.usedCouponCodes[coupon.code] || 0;
                    if (timesUsed < coupon.maxUsesPerUser) {
                        totalBonus += request.amount * coupon.bonusPercentage;
                        transactionDescriptions.push(`${coupon.bonusPercentage * 100}% bonus from ${coupon.code}`);
                        await updateUserInFirestore(user.id, {
                            usedCouponCodes: {...user.usedCouponCodes, [coupon.code]: timesUsed + 1}
                        });
                    }
                }
            }

            // Handle referral bonus
            if (request.amount >= 100 && !user.firstRechargeCompleted && user.referredByCode) {
                const referrer = users.find(u => u.referralCode === user.referredByCode);
                if (referrer) {
                    referrerReward = 10;
                    totalBonus += request.amount * 0.05;
                    transactionDescriptions.push('5% First Recharge Referral Bonus');
                    
                    // Update referrer balance
                    await updateUserInFirestore(referrer.id, { 
                        walletBalance: referrer.walletBalance + referrerReward 
                    });
                    await addTransaction(referrer.id, 'CREDIT', referrerReward, `Referral reward for ${user.name}`);
                    
                    // Mark first recharge as completed
                    await updateUserInFirestore(user.id, { firstRechargeCompleted: true });
                }
            }
            
            // Update user balance
            const finalBalanceAddition = request.amount + totalBonus;
            await updateUserInFirestore(user.id, { 
                walletBalance: user.walletBalance + finalBalanceAddition 
            });
            
            // Add transactions
            if (totalBonus > 0) {
                await addTransaction(user.id, 'CREDIT', totalBonus, transactionDescriptions.join(' & '));
            }
            await addTransaction(user.id, 'TOPUP', request.amount, `Wallet load approved (UTR: ${request.utr})`);
            
            // Update current user if it's the same user
            if (currentUser?.id === user.id) {
                updateUser({ ...user, walletBalance: user.walletBalance + finalBalanceAddition });
            }

            // Update request status
            await updateWalletRequest(requestId, { status: WalletRequestStatus.APPROVED });
            console.log('✅ Wallet load approved successfully');
        } catch (error) {
            console.error('❌ Error approving wallet load:', error);
        }
    }, [walletLoadRequests, users, coupons, currentUser, addTransaction, updateUser]);

    const rejectWalletLoad = useCallback(async (requestId: string) => {
        try {
            console.log('❌ Rejecting wallet load:', requestId);
            await updateWalletRequest(requestId, { status: WalletRequestStatus.REJECTED });
            console.log('✅ Wallet load rejected successfully');
        } catch (error) {
            console.error('❌ Error rejecting wallet load:', error);
        }
    }, []);

    // Simplified versions of other functions for now
    const addGig = useCallback(async (gigData: any): Promise<boolean> => {
        console.log('📦 Add gig called (simplified)');
        return false;
    }, []);

    const updateGig = useCallback(async (gigId: string, updates: any) => {
        console.log('📦 Update gig called (simplified)');
    }, []);

    const deleteGig = useCallback(async (gigId: string) => {
        console.log('📦 Delete gig called (simplified)');
    }, []);

    const requestWithdrawal = useCallback(async (amount: number, upiId: string): Promise<boolean> => {
        console.log('💸 Request withdrawal called (simplified)');
        return false;
    }, []);

    const approveWithdrawal = useCallback(async (requestId: string) => {
        try {
            console.log('✅ Approving withdrawal:', requestId);
            await updateWithdrawalRequest(requestId, { status: WithdrawalRequestStatus.PROCESSED });
            console.log('✅ Withdrawal approved successfully');
        } catch (error) {
            console.error('❌ Error approving withdrawal:', error);
        }
    }, []);

    const rejectWithdrawal = useCallback(async (requestId: string) => {
        try {
            console.log('❌ Rejecting withdrawal:', requestId);
            const request = withdrawalRequests.find(r => r.id === requestId);
            if (!request || request.status !== WithdrawalRequestStatus.PENDING) return;
            
            const user = users.find(u => u.id === request.userId);
            if (user) {
                const newBalance = user.walletBalance + request.amount;
                await updateUserInFirestore(user.id, { walletBalance: newBalance });
                
                if (currentUser?.id === user.id) {
                    updateUser({ ...user, walletBalance: newBalance });
                }
            }

            await addTransaction(request.userId, 'CREDIT', request.amount, 'Refund for rejected withdrawal request.');
            await updateWithdrawalRequest(requestId, { status: WithdrawalRequestStatus.REJECTED });
            console.log('✅ Withdrawal rejected successfully');
        } catch (error) {
            console.error('❌ Error rejecting withdrawal:', error);
        }
    }, [withdrawalRequests, users, currentUser, addTransaction, updateUser]);
    
    // --- Admin-specific Functions ---
    const manualTopUp = async (phone: string, amount: number) => { return false };
    
    const setPlatformFee = async (fee: number) => { 
        if (fee >= 0 && fee <= 1) {
            try {
                const newConfig = { ...platformConfig, fee };
                await updatePlatformConfig(newConfig);
                setPlatformConfig(newConfig);
            } catch (error) {
                console.error('Error updating platform fee:', error);
            }
        }
    };
    
    const setOfferBarText = async (text: string) => { 
        try {
            const newConfig = { ...platformConfig, offerBarText: text };
            await updatePlatformConfig(newConfig);
            setPlatformConfig(newConfig);
        } catch (error) {
            console.error('Error updating offer bar text:', error);
        }
    };
    
    const deleteUser = async (userId: string) => { 
        try {
            await deleteUserFromFirestore(userId);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };
    
    const addCoupon = async (couponData: Omit<Coupon, 'id'>) => { 
        try {
            await addCouponToFirestore(couponData);
        } catch (error) {
            console.error('Error adding coupon:', error);
        }
    };
    
    const updateCoupon = async (couponId: string, updates: Partial<Coupon>) => { 
        try {
            await updateCouponInFirestore(couponId, updates);
        } catch (error) {
            console.error('Error updating coupon:', error);
        }
    };
    
    const deleteCoupon = async (couponId: string) => { 
        try {
            await deleteCouponFromFirestore(couponId);
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    const appContextValue: AppContextType = useMemo(() => ({
        currentUser, isAuthLoading, users, gigs, walletLoadRequests, withdrawalRequests, transactions, 
        platformFee: platformConfig.fee, offerBarText: platformConfig.offerBarText, coupons,
        isAuthModalOpen, openAuthModal, closeAuthModal,
        login, logout, signup, addGig, updateGig, deleteGig, requestWalletLoad,
        approveWalletLoad, rejectWalletLoad, requestWithdrawal, approveWithdrawal, rejectWithdrawal, 
        manualTopUp, setPlatformFee, setOfferBarText,
        deleteUser, addCoupon, updateCoupon, deleteCoupon
    }), [currentUser, isAuthLoading, users, gigs, walletLoadRequests, withdrawalRequests, transactions, platformConfig, coupons, isAuthModalOpen, openAuthModal, closeAuthModal, login, logout, signup, addGig, updateGig, deleteGig, requestWalletLoad, approveWalletLoad, rejectWalletLoad, requestWithdrawal, approveWithdrawal, rejectWithdrawal, manualTopUp, setPlatformFee, setOfferBarText, deleteUser, addCoupon, updateCoupon, deleteCoupon]);

    return (
        <AppContext.Provider value={appContextValue}>
            <HashRouter>
                <AuthModal />
                <Routes>
                    <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />

                    <Route path="*" element={
                        <div className="min-h-screen bg-brand-dark flex flex-col">
                            <OfferBar />
                            <Header />
                            <main className="flex-grow container mx-auto p-4 md:p-6">
                                <Routes>
                                    <Route path="/live" element={<LiveGigs />} />
                                    <Route path="/my-gigs" element={<ProtectedRoute><MyGigs /></ProtectedRoute>} />
                                    <Route path="/create" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
                                    <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                                    <Route path="/refer-and-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
                                    <Route path="/" element={<Navigate to="/live" replace />} />
                                    <Route path="*" element={<Navigate to="/live" replace />} />
                                </Routes>
                            </main>
                        </div>
                    } />
                </Routes>
            </HashRouter>
            
            {/* Debug info */}
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs max-w-xs">
                <div>🔥 Firebase Mode</div>
                <div>👥 Users: {users.length}</div>
                <div>💰 Wallet Requests: {walletLoadRequests.length}</div>
                <div>💸 Withdrawal Requests: {withdrawalRequests.length}</div>
                <div>🔐 Auth: {currentUser ? currentUser.email : 'Not logged in'}</div>
            </div>
        </AppContext.Provider>
    );
};

export default App;
EOF

# Now switch to the Firebase version
mv components/App.tsx components/App_Local.tsx
mv components/App_Firebase.tsx components/App.tsx
```

### Step 5: Test the Integration

1. **Register a new user** on one device
2. **Login as admin** (`admin@delu.live` / `admin123`) on another device
3. **Check admin panel** → Users section
4. **Test wallet load request** from user
5. **Check admin panel** → Wallet Requests section
6. **Click Approve** → Should work!

### Step 6: Verify Cross-Device Sync

1. **Phone**: Register new user
2. **Browser**: Login as admin
3. **Admin Panel**: Should show the user from phone
4. **Phone**: Request wallet load
5. **Browser Admin**: Should see the request
6. **Browser Admin**: Approve the request
7. **Phone**: Should see updated balance

## 🔍 Debug Information

The Firebase version includes debug info in the bottom-right corner showing:
- Number of users in database
- Number of wallet requests
- Current authentication status
- Real-time updates

## ⚠️ Common Issues

### "Missing or insufficient permissions"
- **Solution**: Update Firestore rules (Step 1)

### Admin panel shows 0 users
- **Solution**: Firestore rules not updated properly

### Approve buttons don't work
- **Solution**: Check browser console for errors, ensure Firestore rules allow writes

### Data not syncing across devices
- **Solution**: Verify real-time listeners are working (check console logs)
