# Firebase Integration Setup

## Firebase Configuration
The Firebase integration has been successfully set up with the following services:
- Firebase Authentication
- Firestore Database

## Admin Portal Access

### Admin Credentials
- **Email**: `admin@delu.live`
- **Password**: `admin123`

### Regular User Test Account
- **Email**: `user@delu.live`
- **Password**: `user123`

## Setup Instructions

### 1. Create Admin Account
To create the admin account, you need to:
1. Go to Firebase Console (https://console.firebase.google.com/)
2. Select your project: `dellu-app`
3. Go to Authentication > Users
4. Add a new user with email: `admin@delu.live` and password: `admin123`

### 2. Create Test User Account
Similarly, create a test user account:
- Email: `user@delu.live`
- Password: `user123`

### 3. Firestore Security Rules
If you're getting permission errors, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow all authenticated users to read all user documents (for app functionality)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Allow admin users to read and write all documents
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 4. Alternative: Simplified Rules (for development)
For development purposes, you can use these simplified rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Features Implemented

### Authentication
- ✅ Firebase Authentication integration
- ✅ Login functionality
- ✅ Signup functionality
- ✅ Logout functionality
- ✅ Admin user detection
- ✅ Fallback handling for Firestore permission issues

### Error Handling
- ✅ Graceful handling of Firestore permission errors
- ✅ Fallback user data when Firestore is unavailable
- ✅ Proper error messages for authentication failures

### Admin Features
- ✅ Admin user automatically detected by email (`admin@delu.live`)
- ✅ Admin users get special privileges and access to admin portal

## Testing the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Login**:
   - Click "Login / Sign Up" button
   - Use admin credentials: `admin@delu.live` / `admin123`
   - Should redirect to admin portal

3. **Test Signup**:
   - Click "Login / Sign Up" button
   - Switch to "Sign Up" tab
   - Fill in the form with valid data
   - Should create new user account

## Troubleshooting

### Permission Errors
If you see "Missing or insufficient permissions" errors:
1. Check Firestore security rules
2. Ensure the user is authenticated
3. The app includes fallback handling for these errors

### Admin Access
- Admin users are identified by email: `admin@delu.live`
- Make sure to create this user in Firebase Console
- Admin users automatically get `isAdmin: true` in the app

### Development vs Production
- Current setup works for development
- For production, implement proper security rules
- Consider using Firebase Admin SDK for server-side operations
