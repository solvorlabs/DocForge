import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const existingSocketId = sessionStorage.getItem('socketId');
    // Connect to the socket server
    let socketInstance;
    if (!existingSocketId) {
      console.log('Creating new socket connection');
      socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
      console.log('Connecting to socket server:', import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
      socketInstance.on('connect', () => {
        console.log('Socket connected', socketInstance.id);
        setConnected(true);
      });
    } else {
      console.log('Reusing existing socket connection');
      // Get the existing socket or create a new one
      socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    }

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    setSocket(socketInstance);

    // Clean up the socket connection when the component unmounts
    // Don't disconnect the socket when the component unmounts
    return () => {
      // if (socketInstance) {
      //   socketInstance.disconnect();
      // }
      // Only remove listeners, don't disconnect the socket
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};