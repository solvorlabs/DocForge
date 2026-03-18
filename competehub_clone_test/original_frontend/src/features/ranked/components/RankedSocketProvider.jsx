import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const RankedSocketContext = createContext(null);

export function RankedSocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log('[RankedSocketProvider] Initializing ranked socket connection');
    const baseUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    console.log('[RankedSocketProvider] Base URL:', baseUrl);
    
    const socket = io(`${baseUrl}/ranked`, { 
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('[RankedSocketProvider] Ranked socket connected:', socket.id);
      setConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('[RankedSocketProvider] Ranked socket disconnected');
      setConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('[RankedSocketProvider] Socket connection error:', error);
      setConnected(false);
    });
    
    return () => { 
      console.log('[RankedSocketProvider] Cleaning up ranked socket');
      socket.disconnect(); 
    };
  }, []);

  const value = useMemo(() => ({ socket: socketRef.current, connected }), [connected]);
  return (
    <RankedSocketContext.Provider value={value}>
      {children}
    </RankedSocketContext.Provider>
  );
}

export function useRankedSocket() {
  return useContext(RankedSocketContext);
}


