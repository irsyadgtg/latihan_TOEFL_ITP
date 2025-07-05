import React, { useState, useEffect, useRef } from 'react';
import api from '../shared/services/api';

export default function Timer({ 
  timeLimit, // in minutes from backend
  onTimeUp, 
  onTimeUpdate, 
  isActive = true,
  section = '',
  simulationId = null
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [isRunning, setIsRunning] = useState(isActive);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs untuk avoiding stale closure
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const intervalRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const sectionStartTimeRef = useRef(null); // CRITICAL: Store actual section start time
  const timeLimitRef = useRef(timeLimit * 60);
  const lastSyncTimeRef = useRef(0);
  const initializingRef = useRef(false); // Prevent double initialization
  
  const token = localStorage.getItem('token');

  // Update refs when props change
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    timeLimitRef.current = timeLimit * 60;
  }, [onTimeUpdate, timeLimit]);

  // INITIALIZE TIMER - Load from backend ONLY once on mount
  useEffect(() => {
    if (!simulationId || !section || !timeLimit || isInitialized || initializingRef.current) return;

    console.log('🔥 INITIALIZING TIMER:', { simulationId, section, timeLimit });
    initializingRef.current = true;
    
    initializeTimer();
    
    // Cleanup function untuk prevent double init di StrictMode
    return () => {
      if (!isInitialized) {
        initializingRef.current = false;
      }
    };
  }, [simulationId, section, timeLimit]);

  const initializeTimer = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading timer state from backend...');
      
      // Load timer state dari backend
      const response = await api.get(`/simulations/${simulationId}/timer-state`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📊 Backend timer response:', response.data);

      if (response.data && response.data.current_section) {
        const { 
          elapsed_time, 
          is_expired, 
          current_section, 
          time_remaining,
          section_started_at 
        } = response.data;
        
        console.log('⏰ Backend timer state:', {
          elapsed_time,
          is_expired,
          current_section,
          expected_section: section,
          time_remaining,
          section_started_at
        });

        // Validate section
        if (current_section !== section) {
          console.warn('⚠️ Section mismatch - may have moved to next section');
          setIsLoading(false);
          initializingRef.current = false;
          return;
        }

        // Check if expired
        if (is_expired || time_remaining <= 0) {
          console.log('⏰ Timer expired on backend - auto submitting');
          setTimeLeft(0);
          setIsRunning(false);
          setIsInitialized(true);
          setIsLoading(false);
          initializingRef.current = false;
          
          // Trigger auto-submit immediately
          if (onTimeUp) {
            setTimeout(() => onTimeUp(true), 1000);
          }
          return;
        }

        // 🔥 CRITICAL FIX: Use section_started_at from backend as the source of truth
        if (section_started_at) {
          // Parse backend timestamp and convert to local time
          const sectionStartTime = new Date(section_started_at).getTime();
          sectionStartTimeRef.current = sectionStartTime;
          
          console.log('✅ Using section start time from backend:', {
            section_started_at,
            parsed_time: new Date(sectionStartTime).toISOString(),
            elapsed_should_be: Math.floor((Date.now() - sectionStartTime) / 1000)
          });
        } else {
          // Fallback: calculate start time from elapsed
          const now = Date.now();
          const calculatedStartTime = now - (elapsed_time * 1000);
          sectionStartTimeRef.current = calculatedStartTime;
          
          console.log('⚠️ No section_started_at, calculating from elapsed:', {
            elapsed_time,
            calculated_start: new Date(calculatedStartTime).toISOString()
          });
        }

        // Set initial state dari backend
        const remaining = Math.max(0, time_remaining);
        setTimeLeft(remaining);
        setIsRunning(remaining > 0);
        setIsInitialized(true);
        setIsLoading(false);
        initializingRef.current = false;
        lastSyncTimeRef.current = elapsed_time;

        console.log('✅ Timer initialized from backend:', {
          elapsed_time,
          remaining,
          startTime: new Date(sectionStartTimeRef.current).toISOString()
        });

        // Notify parent dengan current time spent
        if (onTimeUpdateRef.current) {
          onTimeUpdateRef.current(elapsed_time);
        }

        // Start timer dan sync intervals
        startTimerInterval();
        startBackendSync();

      } else {
        console.log('❌ No valid backend state, starting fresh timer');
        startFreshTimer();
      }
    } catch (error) {
      console.error('❌ Failed to load timer from backend:', error.response?.status, error.response?.data);
      
      // If backend error, start fresh timer
      console.log('🆕 Backend error, starting fresh timer');
      startFreshTimer();
    }
  };

  const startFreshTimer = () => {
    console.log('🆕 Starting fresh timer for section:', section);
    sectionStartTimeRef.current = Date.now();
    lastSyncTimeRef.current = 0;
    setTimeLeft(timeLimitRef.current);
    setIsRunning(true);
    setIsInitialized(true);
    setIsLoading(false);
    initializingRef.current = false;
    
    // Start intervals
    startTimerInterval();
    startBackendSync();
  };

  // PURE CLIENT-SIDE TIMER - Uses section start time from backend
  const startTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!sectionStartTimeRef.current || !isRunning) return;

      const now = Date.now();
      const elapsed = Math.floor((now - sectionStartTimeRef.current) / 1000);
      const remaining = Math.max(0, timeLimitRef.current - elapsed);

      setTimeLeft(remaining);

      // Update parent dengan elapsed time
      if (onTimeUpdateRef.current) {
        onTimeUpdateRef.current(elapsed);
      }

      // Time up - CRITICAL AUTO-SUBMIT
      if (remaining <= 0 && isRunning) {
        console.log('⏰ Timer expired locally - triggering auto submit');
        setIsRunning(false);
        clearInterval(intervalRef.current);
        
        if (onTimeUp) {
          onTimeUp(true); // true = auto submit karena waktu habis
        }
      }
    }, 1000);

    console.log('⏰ Timer interval started');
  };

  // BACKGROUND SYNC - Save to backend every 15s
  const startBackendSync = () => {
    if (!simulationId) return;

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(async () => {
      if (!sectionStartTimeRef.current || !isRunning) return;

      const elapsed = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
      
      // Only sync if there's significant change (avoid spam)
      if (elapsed - lastSyncTimeRef.current < 5) return;
      
      try {
        console.log('🔄 Syncing timer to backend:', elapsed);
        
        const response = await api.post('/simulations/sync-timer', {
          simulation_id: simulationId,
          time_spent: elapsed
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          lastSyncTimeRef.current = elapsed;
          console.log('✅ Timer synced successfully:', elapsed);
        } else {
          console.warn('⚠️ Unexpected sync response:', response.status);
        }
      } catch (error) {
        console.error('❌ Failed to sync timer:', error.response?.status, error.response?.data);
      }
    }, 15000); // 15 seconds

    console.log('🔄 Background sync started (15s interval)');
  };

  // SAVE timer state ketika page tersembunyi
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!sectionStartTimeRef.current || !simulationId) return;

      if (document.hidden) {
        // Page hidden - save current state immediately
        console.log('👁️ Page hidden - saving state immediately');
        const elapsed = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
        
        try {
          const response = await api.post('/simulations/sync-timer', {
            simulation_id: simulationId,
            time_spent: elapsed
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          lastSyncTimeRef.current = elapsed;
          console.log('✅ State saved on hide:', elapsed);
        } catch (error) {
          console.error('❌ Failed to save on hide:', error.response?.status, error.response?.data);
        }
      } else {
        // Page visible - timer continues running, no need to reload
        console.log('👁️ Page visible - timer continues running');
        // Timer already running based on sectionStartTimeRef.current, tidak perlu reset
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [simulationId]);

  // SAVE on page unload/refresh - ensure state persists
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!sectionStartTimeRef.current || !simulationId) return;
      
      const elapsed = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
      
      console.log('🔄 Page unloading - saving timer state:', elapsed);
      
      // Use fetch with keepalive untuk guarantee delivery
      const body = JSON.stringify({
        simulation_id: simulationId,
        time_spent: elapsed
      });

      fetch(`${api.defaults.baseURL}/simulations/sync-timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body,
        keepalive: true
      }).then(() => {
        console.log('✅ Timer saved on unload:', elapsed);
      }).catch(err => {
        console.error('❌ Failed to save on unload:', err);
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [simulationId, token]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up timer intervals');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / timeLimitRef.current) * 100;
    if (percentage <= 5) return '#dc3545';  // Very critical
    if (percentage <= 10) return '#fd7e14'; // Critical
    if (percentage <= 25) return '#ffc107'; // Warning
    return '#B6252A'; // Normal
  };

  const getWarningMessage = () => {
    const percentage = (timeLeft / timeLimitRef.current) * 100;
    if (percentage <= 2) return 'WAKTU HAMPIR HABIS!';
    if (percentage <= 5) return 'Peringatan: Waktu tinggal sangat sedikit';
    if (percentage <= 10) return 'Peringatan: Waktu tinggal sedikit';
    return null;
  };

  // Show loading until initialized
  if (isLoading || !isInitialized) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'white',
        border: '2px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '200px',
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {isLoading ? 'Loading timer...' : 'Initializing...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: `3px solid ${getTimerColor()}`,
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '200px',
      textAlign: 'center',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#666',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {section ? `${section.toUpperCase()} Section` : 'Timer'}
      </div>
      
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: getTimerColor(),
        fontFamily: 'monospace'
      }}>
        {formatTime(timeLeft)}
      </div>

      <div style={{
        fontSize: '10px',
        color: isRunning ? '#28a745' : '#6c757d',
        fontWeight: 'bold',
        marginTop: '3px'
      }}>
        {isRunning ? 'RUNNING' : 'PAUSED'}
      </div>
      
      {getWarningMessage() && (
        <div style={{
          fontSize: '12px',
          color: '#dc3545',
          fontWeight: 'bold',
          marginTop: '5px',
          animation: 'blink 1s infinite'
        }}>
          {getWarningMessage()}
        </div>
      )}
      
      <div style={{
        marginTop: '8px',
        height: '4px',
        backgroundColor: '#e9ecef',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          backgroundColor: getTimerColor(),
          width: `${(timeLeft / timeLimitRef.current) * 100}%`,
          transition: 'width 1s linear'
        }} />
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}