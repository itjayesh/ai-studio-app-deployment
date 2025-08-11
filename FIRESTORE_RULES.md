# Firestore Security Rules Setup

## Current Issue
The Firebase Authentication is working, but Firestore database operations are failing due to security rules. Users registered on one device aren't visible on another because data isn't being stored in Firestore.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Select your project: `dellu-app`
3. Go to "Firestore Database" in the left sidebar
4. Click on "Rules" tab

### Step 2: Replace the current rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read and write all documents
    // (For development - you can make this more restrictive later)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish the rules
1. Click "Publish" button
2. Wait for the rules to be deployed

## Alternative: More Secure Rules (Recommended for Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow all authenticated users to read user documents (for app functionality)
      allow read: if request.auth != null;
    }
    
    // Gigs - all authenticated users can read, only owner can write
    match /gigs/{gigId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Wallet requests - users can create, admins can approve
    match /walletRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Withdrawal requests
    match /withdrawalRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Coupons
    match /coupons/{couponId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Platform config
    match /platformConfig/{configId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 4: Test the Integration

After updating the rules:

1. **Register a new user** on one device/browser
2. **Login as admin** on another device/browser  
3. **Check admin panel** - you should now see the registered user
4. **Test wallet load requests** - they should appear in admin panel
5. **Test approve/reject buttons** - they should work properly

## Step 5: Create Admin Account

In Firebase Console > Authentication > Users:
1. Click "Add user"
2. Email: `admin@delu.live`
3. Password: `admin123`
4. Click "Add user"

## Step 6: Create Test User Account

1. Click "Add user" again
2. Email: `user@delu.live`  
3. Password: `user123`
4. Click "Add user"

## Verification Steps

1. **Test Registration Flow:**
   - Go to app → Sign Up → Create new account
   - Check Firebase Console → Authentication → Users (should see new user)
   - Check Firebase Console → Firestore → users collection (should see user data)

2. **Test Admin Panel:**
   - Login as admin@delu.live
   - Go to admin panel
   - Check "Users" section (should show all registered users)
   - Check "Analytics" (should show user count)

3. **Test Cross-Device Sync:**
   - Register user on Phone/Browser A
   - Login as admin on Browser B  
   - Admin should see the user from Browser A

## Common Issues & Solutions

### Issue: "Missing or insufficient permissions"
**Solution:** Update Firestore rules as shown above

### Issue: Users not appearing in admin panel
**Solution:** Check Firestore rules and ensure data is being written to `users` collection

### Issue: Approve buttons not working
**Solution:** Ensure Firestore rules allow updates to `walletRequests` and `withdrawalRequests` collections

### Issue: Data not syncing across devices
**Solution:** Verify Firestore rules allow read access and real-time listeners are working
