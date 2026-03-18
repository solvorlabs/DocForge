// Example: Using LoginPaywall in a feature component
import React from 'react';
import { useUser } from '../../../app/providers/UserContext';
import LoginPaywall from '../../../shared/components/auth/LoginPaywall';
import { Trophy, Target, Zap, Award } from 'lucide-react';

/**
 * Example Premium Feature Component
 * Shows how to implement a soft paywall for premium features
 */
function PremiumFeatureExample() {
  const { isAuthenticated } = useUser();

  // Define custom benefits for this feature
  const premiumBenefits = [
    { icon: Trophy, text: "Access exclusive premium challenges" },
    { icon: Target, text: "Detailed analytics and progress tracking" },
    { icon: Zap, text: "Priority matchmaking in ranked games" },
    { icon: Award, text: "Earn special badges and achievements" }
  ];

  // Show paywall to guests
  if (!isAuthenticated) {
    return (
      <LoginPaywall
        title="Premium Features Await!"
        message="Unlock advanced features and compete at the highest level by creating a free account."
        benefits={premiumBenefits}
        showAsModal={false}
      />
    );
  }

  // Show actual feature content to authenticated users
  return (
    <div className="premium-feature-content">
      <h1>Welcome to Premium Features!</h1>
      <p>You now have access to all premium content.</p>
      {/* Your premium feature content here */}
    </div>
  );
}

export default PremiumFeatureExample;

// ============================================
// Alternative: Modal Paywall Example
// ============================================

function ModalPaywallExample() {
  const { isAuthenticated } = useUser();
  const [showPaywall, setShowPaywall] = React.useState(false);

  const handlePremiumClick = () => {
    if (!isAuthenticated) {
      setShowPaywall(true);
      return;
    }
    // Continue with premium feature
    console.log('Accessing premium feature...');
  };

  return (
    <div>
      <button onClick={handlePremiumClick}>
        Access Premium Feature
      </button>

      {showPaywall && (
        <LoginPaywall
          showAsModal={true}
          onClose={() => setShowPaywall(false)}
          title="Premium Feature Locked"
          message="Sign in to unlock this premium feature and track your progress!"
        />
      )}
    </div>
  );
}
