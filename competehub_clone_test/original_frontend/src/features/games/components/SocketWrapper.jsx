src/components/SocketWrapper.js
import React, { useEffect } from 'react';
import { useSocket } from '../../../app/providers/SocketContext';
import { useGame } from '../../../app/providers/GameContext';

function SocketWrapper({ children }) {
  const { socket, connected } = useSocket();
  const { setSoloSocket } = useGame();
  
  useEffect(() => {
    if (socket && connected) {
      console.log("SocketWrapper: Updating socket in game context", socket.id);
      setSoloSocket(socket);
    }
  }, [socket, connected, setSoloSocket]);

  return <>{children}</>;
}

export default SocketWrapper;