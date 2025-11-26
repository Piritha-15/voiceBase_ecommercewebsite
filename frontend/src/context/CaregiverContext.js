import React, { createContext, useContext, useState, useEffect } from 'react';
import { useVoice } from './VoiceContext';

const CaregiverContext = createContext();

export const useCaregiver = () => {
    const context = useContext(CaregiverContext);
    if (!context) {
        throw new Error('useCaregiver must be used within a CaregiverProvider');
    }
    return context;
};

export const CaregiverProvider = ({ children }) => {
    const [caregivers, setCaregivers] = useState([]);
    const [activeCaregiverSession, setActiveCaregiverSession] = useState(null);
    const [caregiverPermissions, setCaregiverPermissions] = useState({});
    const [assistanceMode, setAssistanceMode] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const { speak } = useVoice();

    useEffect(() => {
        // Load caregiver data from localStorage
        const savedCaregivers = localStorage.getItem('voicecart_caregivers');
        if (savedCaregivers) {
            setCaregivers(JSON.parse(savedCaregivers));
        }

        const savedPermissions = localStorage.getItem('voicecart_caregiver_permissions');
        if (savedPermissions) {
            setCaregiverPermissions(JSON.parse(savedPermissions));
        }

        const savedRequests = localStorage.getItem('voicecart_caregiver_requests');
        if (savedRequests) {
            setPendingRequests(JSON.parse(savedRequests));
        }
    }, []);

    const addCaregiver = (caregiverInfo) => {
        const newCaregiver = {
            id: Date.now(),
            ...caregiverInfo,
            dateAdded: new Date().toISOString(),
            status: 'pending',
            permissions: {
                viewPurchases: false,
                assistShopping: false,
                receiveNotifications: false,
                emergencyAccess: false
            }
        };

        const updatedCaregivers = [...caregivers, newCaregiver];
        setCaregivers(updatedCaregivers);
        localStorage.setItem('voicecart_caregivers', JSON.stringify(updatedCaregivers));

        speak(`Caregiver ${caregiverInfo.name} has been added. They will need your permission to access your account.`);

        return newCaregiver;
    };

    const authorizeCaregiver = (caregiverId, permissions) => {
        const updatedCaregivers = caregivers.map(caregiver =>
            caregiver.id === caregiverId
                ? { ...caregiver, status: 'authorized', permissions }
                : caregiver
        );

        setCaregivers(updatedCaregivers);
        localStorage.setItem('voicecart_caregivers', JSON.stringify(updatedCaregivers));

        const caregiver = updatedCaregivers.find(c => c.id === caregiverId);
        speak(`${caregiver.name} has been authorized as your caregiver with the permissions you selected.`);

        // Log authorization
        logCaregiverActivity(caregiverId, 'authorized', permissions);
    };

    const revokeCaregiver = (caregiverId) => {
        const caregiver = caregivers.find(c => c.id === caregiverId);

        const updatedCaregivers = caregivers.map(c =>
            c.id === caregiverId
                ? { ...c, status: 'revoked', revokedDate: new Date().toISOString() }
                : c
        );

        setCaregivers(updatedCaregivers);
        localStorage.setItem('voicecart_caregivers', JSON.stringify(updatedCaregivers));

        speak(`Access for ${caregiver.name} has been revoked.`);

        // End any active session
        if (activeCaregiverSession?.caregiverId === caregiverId) {
            endCaregiverSession();
        }

        logCaregiverActivity(caregiverId, 'revoked');
    };

    const startCaregiverSession = (caregiverId, assistanceType = 'general') => {
        const caregiver = caregivers.find(c => c.id === caregiverId && c.status === 'authorized');

        if (!caregiver) {
            speak('Caregiver not found or not authorized.');
            return false;
        }

        const session = {
            caregiverId,
            caregiverName: caregiver.name,
            startTime: new Date().toISOString(),
            assistanceType,
            permissions: caregiver.permissions
        };

        setActiveCaregiverSession(session);
        setAssistanceMode(true);

        speak(`Caregiver assistance mode activated. ${caregiver.name} is now helping you with your shopping.`);

        logCaregiverActivity(caregiverId, 'session_started', { assistanceType });
        return true;
    };

    const endCaregiverSession = () => {
        if (activeCaregiverSession) {
            const duration = Date.now() - new Date(activeCaregiverSession.startTime).getTime();

            logCaregiverActivity(
                activeCaregiverSession.caregiverId,
                'session_ended',
                { duration: Math.round(duration / 1000 / 60) } // minutes
            );

            speak(`Caregiver assistance session with ${activeCaregiverSession.caregiverName} has ended.`);
        }

        setActiveCaregiverSession(null);
        setAssistanceMode(false);
    };

    const requestCaregiverAssistance = (assistanceType, message) => {
        const request = {
            id: Date.now(),
            assistanceType,
            message,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        const updatedRequests = [...pendingRequests, request];
        setPendingRequests(updatedRequests);
        localStorage.setItem('voicecart_caregiver_requests', JSON.stringify(updatedRequests));

        // Notify authorized caregivers
        const authorizedCaregivers = caregivers.filter(c =>
            c.status === 'authorized' && c.permissions.receiveNotifications
        );

        if (authorizedCaregivers.length > 0) {
            speak('Your request for assistance has been sent to your caregivers.');

            // In a real app, this would send notifications to caregivers
            authorizedCaregivers.forEach(caregiver => {
                notifyCaregiver(caregiver, request);
            });
        } else {
            speak('No caregivers are available to receive notifications at this time.');
        }
    };

    const notifyCaregiver = (caregiver, request) => {
        // Simulate caregiver notification
        console.log(`Notifying ${caregiver.name} about assistance request:`, request);

        // In production, this would:
        // - Send email/SMS to caregiver
        // - Push notification to caregiver app
        // - Log the notification attempt
    };

    const handleVoiceCaregiverCommand = (command) => {
        const lowerCommand = command.toLowerCase();

        if (lowerCommand.includes('caregiver help') || lowerCommand.includes('need assistance')) {
            requestCaregiverAssistance('general', 'Voice request for general assistance');
            return true;
        }

        if (lowerCommand.includes('emergency help')) {
            requestCaregiverAssistance('emergency', 'Emergency assistance requested via voice');

            // Notify emergency contacts immediately
            const emergencyCaregivers = caregivers.filter(c =>
                c.status === 'authorized' && c.permissions.emergencyAccess
            );

            if (emergencyCaregivers.length > 0) {
                speak('Emergency assistance request sent to your emergency contacts.');
            }
            return true;
        }

        if (lowerCommand.includes('end caregiver session')) {
            if (assistanceMode) {
                endCaregiverSession();
            } else {
                speak('No active caregiver session to end.');
            }
            return true;
        }

        if (lowerCommand.includes('who is helping me')) {
            if (activeCaregiverSession) {
                speak(`${activeCaregiverSession.caregiverName} is currently assisting you.`);
            } else {
                speak('No caregiver is currently assisting you.');
            }
            return true;
        }

        return false; // Command not handled
    };

    const logCaregiverActivity = (caregiverId, activity, details = {}) => {
        const log = {
            caregiverId,
            activity,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        const logs = JSON.parse(localStorage.getItem('voicecart_caregiver_logs') || '[]');
        logs.push(log);
        localStorage.setItem('voicecart_caregiver_logs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
    };

    const getCaregiverSummary = () => {
        const authorized = caregivers.filter(c => c.status === 'authorized').length;
        const pending = caregivers.filter(c => c.status === 'pending').length;

        return {
            totalCaregivers: caregivers.length,
            authorizedCaregivers: authorized,
            pendingCaregivers: pending,
            activeSession: activeCaregiverSession,
            assistanceMode,
            pendingRequests: pendingRequests.filter(r => r.status === 'pending').length
        };
    };

    const getPrivacyStatus = () => {
        return {
            caregiverAccess: assistanceMode,
            dataSharing: activeCaregiverSession?.permissions || {},
            privacyLevel: assistanceMode ? 'caregiver_assisted' : 'private'
        };
    };

    const value = {
        caregivers,
        activeCaregiverSession,
        assistanceMode,
        pendingRequests,
        addCaregiver,
        authorizeCaregiver,
        revokeCaregiver,
        startCaregiverSession,
        endCaregiverSession,
        requestCaregiverAssistance,
        handleVoiceCaregiverCommand,
        getCaregiverSummary,
        getPrivacyStatus
    };

    return (
        <CaregiverContext.Provider value={value}>
            {children}
        </CaregiverContext.Provider>
    );
};