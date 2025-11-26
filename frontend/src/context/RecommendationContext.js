import React, { createContext, useContext, useState, useEffect } from 'react';
import { useVoice } from './VoiceContext';

const RecommendationContext = createContext();

export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
};

export const RecommendationProvider = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState({});
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [healthProfile, setHealthProfile] = useState({});
  const [seasonalNeeds, setSeasonalNeeds] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const { speak } = useVoice();

  useEffect(() => {
    // Load user data from localStorage
    const savedPreferences = localStorage.getItem('voicecart_user_preferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }

    const savedHistory = localStorage.getItem('voicecart_purchase_history');
    if (savedHistory) {
      setPurchaseHistory(JSON.parse(savedHistory));
    }

    const savedHealth = localStorage.getItem('voicecart_health_profile');
    if (savedHealth) {
      setHealthProfile(JSON.parse(savedHealth));
    }

    // Set seasonal needs based on current date
    updateSeasonalNeeds();
  }, []);

  const updateSeasonalNeeds = () => {
    const currentMonth = new Date().getMonth();
    let seasonal = [];

    // Winter months (Nov, Dec, Jan, Feb)
    if ([10, 11, 0, 1].includes(currentMonth)) {
      seasonal = [
        'Winter health supplements',
        'Warm clothing',
        'Joint pain relief',
        'Vitamin D supplements',
        'Immune system boosters'
      ];
    }
    // Summer months (May, Jun, Jul, Aug)
    else if ([4, 5, 6, 7].includes(currentMonth)) {
      seasonal = [
        'Sun protection',
        'Hydration products',
        'Cooling aids',
        'Light clothing',
        'Summer vitamins'
      ];
    }
    // Spring/Fall
    else {
      seasonal = [
        'Allergy relief',
        'Seasonal vitamins',
        'Moderate weather clothing',
        'General wellness'
      ];
    }

    setSeasonalNeeds(seasonal);
  };

  const updateHealthProfile = (healthData) => {
    const profile = {
      ...healthProfile,
      ...healthData,
      lastUpdated: new Date().toISOString()
    };

    setHealthProfile(profile);
    localStorage.setItem('voicecart_health_profile', JSON.stringify(profile));
    
    // Generate health-based recommendations
    generateHealthRecommendations(profile);
  };

  const generateHealthRecommendations = (profile) => {
    let recommendations = [];

    // Diabetes management
    if (profile.conditions?.includes('diabetes')) {
      recommendations.push(
        { category: 'health', name: 'Glucose Monitor', priority: 'high', reason: 'Essential for diabetes management' },
        { category: 'nutrition', name: 'Sugar-free supplements', priority: 'medium', reason: 'Suitable for diabetic diet' }
      );
    }

    // Hypertension
    if (profile.conditions?.includes('hypertension')) {
      recommendations.push(
        { category: 'health', name: 'Blood Pressure Monitor', priority: 'high', reason: 'Monitor blood pressure regularly' },
        { category: 'nutrition', name: 'Low-sodium supplements', priority: 'medium', reason: 'Heart-healthy options' }
      );
    }

    // Arthritis/Joint issues
    if (profile.conditions?.includes('arthritis') || profile.conditions?.includes('joint_pain')) {
      recommendations.push(
        { category: 'health', name: 'Joint support supplements', priority: 'medium', reason: 'May help with joint comfort' },
        { category: 'essentials', name: 'Ergonomic aids', priority: 'medium', reason: 'Easier daily living' }
      );
    }

    // Age-based recommendations
    if (profile.age >= 65) {
      recommendations.push(
        { category: 'nutrition', name: 'Senior multivitamins', priority: 'medium', reason: 'Age-appropriate nutrition' },
        { category: 'health', name: 'Fall prevention aids', priority: 'medium', reason: 'Safety consideration' }
      );
    }

    return recommendations;
  };

  const generatePersonalizedRecommendations = () => {
    let recommendations = [];

    // Based on purchase history
    if (purchaseHistory.length > 0) {
      const frequentCategories = getFrequentCategories();
      const recentPurchases = purchaseHistory.slice(-5);

      frequentCategories.forEach(category => {
        recommendations.push({
          type: 'history_based',
          category: category,
          reason: `Based on your frequent ${category} purchases`
        });
      });

      // Replenishment suggestions
      recentPurchases.forEach(purchase => {
        if (isReplenishmentDue(purchase)) {
          recommendations.push({
            type: 'replenishment',
            product: purchase.name,
            reason: `Time to reorder ${purchase.name}`
          });
        }
      });
    }

    // Health-based recommendations
    const healthRecs = generateHealthRecommendations(healthProfile);
    recommendations = [...recommendations, ...healthRecs];

    // Seasonal recommendations
    seasonalNeeds.forEach(need => {
      recommendations.push({
        type: 'seasonal',
        category: need,
        reason: 'Seasonal health consideration'
      });
    });

    setPersonalizedProducts(recommendations);
    return recommendations;
  };

  const getFrequentCategories = () => {
    const categoryCount = {};
    
    purchaseHistory.forEach(purchase => {
      categoryCount[purchase.category] = (categoryCount[purchase.category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  };

  const isReplenishmentDue = (purchase) => {
    const daysSincePurchase = (Date.now() - new Date(purchase.date).getTime()) / (1000 * 60 * 60 * 24);
    
    // Suggest replenishment based on product type
    const replenishmentCycles = {
      'vitamins': 30,
      'supplements': 30,
      'medication': 30,
      'health_monitor': 365, // Yearly replacement
      'essentials': 90
    };

    const cycle = replenishmentCycles[purchase.type] || 60;
    return daysSincePurchase >= cycle * 0.8; // Suggest at 80% of cycle
  };

  const addPurchaseToHistory = (purchase) => {
    const newPurchase = {
      ...purchase,
      date: new Date().toISOString(),
      id: Date.now()
    };

    const updatedHistory = [...purchaseHistory, newPurchase];
    setPurchaseHistory(updatedHistory);
    localStorage.setItem('voicecart_purchase_history', JSON.stringify(updatedHistory));

    // Update preferences based on purchase
    updatePreferencesFromPurchase(newPurchase);
  };

  const updatePreferencesFromPurchase = (purchase) => {
    const updatedPreferences = {
      ...userPreferences,
      preferredCategories: {
        ...userPreferences.preferredCategories,
        [purchase.category]: (userPreferences.preferredCategories?.[purchase.category] || 0) + 1
      },
      lastPurchaseDate: purchase.date
    };

    setUserPreferences(updatedPreferences);
    localStorage.setItem('voicecart_user_preferences', JSON.stringify(updatedPreferences));
  };

  const getVoiceRecommendations = () => {
    const recommendations = generatePersonalizedRecommendations();
    
    if (recommendations.length === 0) {
      speak('I don\'t have enough information about your preferences yet. Browse our categories to get personalized recommendations.');
      return;
    }

    const topRecommendations = recommendations.slice(0, 3);
    let message = 'Based on your profile, I recommend: ';
    
    topRecommendations.forEach((rec, index) => {
      if (rec.product) {
        message += `${rec.product} - ${rec.reason}`;
      } else {
        message += `${rec.category} products - ${rec.reason}`;
      }
      
      if (index < topRecommendations.length - 1) {
        message += '. Next, ';
      }
    });

    speak(message);
    return topRecommendations;
  };

  const setupHealthProfile = () => {
    speak('Let me help you set up your health profile for better recommendations. Do you have any of these conditions: diabetes, high blood pressure, or arthritis?');
    
    // This would integrate with voice recognition to capture health information
    // For now, we'll provide a simplified setup
  };

  const getCaregiverRecommendations = (caregiverAccess) => {
    if (!caregiverAccess.isAuthorized) {
      return [];
    }

    const recommendations = generatePersonalizedRecommendations();
    
    // Add caregiver-specific insights
    return recommendations.map(rec => ({
      ...rec,
      caregiverNote: generateCaregiverNote(rec)
    }));
  };

  const generateCaregiverNote = (recommendation) => {
    if (recommendation.priority === 'high') {
      return 'High priority - consider discussing with healthcare provider';
    }
    if (recommendation.type === 'replenishment') {
      return 'Regular medication/supplement - ensure continuous supply';
    }
    return 'General wellness recommendation';
  };

  const value = {
    userPreferences,
    purchaseHistory,
    healthProfile,
    seasonalNeeds,
    personalizedProducts,
    updateHealthProfile,
    generatePersonalizedRecommendations,
    addPurchaseToHistory,
    getVoiceRecommendations,
    setupHealthProfile,
    getCaregiverRecommendations
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};