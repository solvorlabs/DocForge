# Authentication Components

This directory contains reusable authentication-related components for handling guest users and protected routes.

## Components

### 1. ProtectedRoute

A wrapper component that protects routes requiring authentication. Automatically redirects unauthenticated users to the login page.

**Usage:**
```jsx
import ProtectedRoute from '../../shared/components/auth/ProtectedRoute';

// In your routes file:
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

**Features:**
- Shows loading spinner while checking auth status
- Redirects to `/auth` if not authenticated
- Preserves intended destination for redirect after login
- Works seamlessly with UserContext

**When to use:**
- User profile pages
- Settings pages
- Features requiring saved progress (ranked games, friends, etc.)

---

### 2. LoginPaywall

A modal/page component that explains why login is required and shows benefits of creating an account.

**Usage:**

**As a full page:**
```jsx
import LoginPaywall from '../../shared/components/auth/LoginPaywall';

function MyComponent() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <LoginPaywall />;
  }

  return <div>Protected content</div>;
}
```

**As a modal overlay:**
```jsx
import LoginPaywall from '../../shared/components/auth/LoginPaywall';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <button onClick={() => setShowPaywall(true)}>
        Premium Feature
      </button>
      
      {showPaywall && (
        <LoginPaywall 
          showAsModal={true}
          onClose={() => setShowPaywall(false)}
        />
      )}
    </>
  );
}
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Sign in to continue" | Main heading text |
| `message` | string | Feature description | Explanation message |
| `benefits` | array | Default benefits | List of { icon, text } objects |
| `showAsModal` | boolean | false | Show as overlay modal vs full page |
| `onClose` | function | null | Callback when user closes modal |

**Custom benefits example:**
```jsx
import { Trophy, Star, Shield } from 'lucide-react';

const customBenefits = [
  { icon: Trophy, text: "Compete in tournaments" },
  { icon: Star, text: "Unlock exclusive content" },
  { icon: Shield, text: "Premium support" }
];

<LoginPaywall benefits={customBenefits} />
```

---

## Authentication Utilities

Located in `features/auth/utils/authUtils.js`:

### isLoggedIn()
```jsx
import { isLoggedIn } from '../features/auth/utils/authUtils';

if (isLoggedIn()) {
  // User is authenticated
}
```

### requireLogin(navigate, message)
```jsx
import { requireLogin } from '../features/auth/utils/authUtils';

const handlePremiumFeature = () => {
  if (!requireLogin(navigate, "Login to access premium features!")) {
    return; // User was redirected to auth
  }
  // Continue with feature logic
};
```

### handleAnonymousChallenge(gameType)
```jsx
import { handleAnonymousChallenge } from '../features/auth/utils/authUtils';

const startGame = () => {
  const { allowPlay, anonymous, message } = handleAnonymousChallenge('solo');
  
  if (!allowPlay) {
    return; // User chose to login instead
  }
  
  if (anonymous) {
    console.log('Guest mode - scores not saved');
  }
  
  // Start game
};
```

---

## Route Configuration Examples

### Public Route (Guest Access Allowed)
```jsx
// Anyone can access, no login required
<Route path="/games/crossword" element={<CrosswordGame />} />
```

### Protected Route (Login Required)
```jsx
// Redirects to /auth if not logged in
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

### Conditional Route (Shows Paywall)
```jsx
// Custom component that shows paywall to guests
function ConditionalFeature() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <LoginPaywall 
        title="Premium Feature"
        message="Create an account to unlock this feature!"
      />
    );
  }

  return <FeatureContent />;
}

<Route path="/premium" element={<ConditionalFeature />} />
```

---

## Best Practices

1. **Use ProtectedRoute for hard requirements**: Profile, settings, friends, ranked games
2. **Use LoginPaywall for soft paywalls**: Premium features, enhanced analytics, exclusive content
3. **Allow guest access for**: Casual games, leaderboard viewing, question bank browsing
4. **Show helpful messages**: Always explain WHY login is needed and WHAT benefits they get

---

## Layout & Navigation

The `ConditionalLayout` component handles showing the correct navigation based on auth status:

- **Guests**: See NavBar on `/home` and game pages, can browse freely
- **Authenticated**: See full NavBar + Sidebar on all pages
- **Landing pages**: See LandingHeader instead of NavBar

This is configured automatically - no manual intervention needed!
