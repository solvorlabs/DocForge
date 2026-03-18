import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../../app/providers/GameContext';

import ChatIcon from '@mui/icons-material/Chat';

function ChatWindow({ height = '100%' }) {
  const {
    chatMessages,
    chatVisible,
    gameData,
    sendMessage,
    isSpectator,
    gameSettings
  } = useGame();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "nearest"
      });
    }
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Check if user can send messages
    if (!isSpectator() && !chatVisible) {
      return; // Active players can't chat until they answer
    }

    if (!gameSettings?.allowSpectatorChat && isSpectator() && gameData?.status === 'playing') {
      return; // Spectators can't chat if disabled
    }

    sendMessage(message);
    setMessage('');
    scrollToBottom(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isMessageVisible = (msg) => {
    // Always show system messages
    if (msg.type === 'system') return true;

    // Apply chat visibility rules
    return chatVisible || msg.visible;
  };

  const canSendMessage = () => {
    // Check if user can send messages based on game state and settings
    if (!isSpectator() && !chatVisible) {
      return false; // Active players can't chat until they answer
    }

    if (!gameSettings?.allowSpectatorChat && isSpectator() && gameData?.status === 'playing') {
      return false; // Spectators can't chat if disabled during game
    }

    return true;
  };

  return (
    <div
      className="doodle-paper"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--doodle-bg, #fff)',
        border: '2px solid var(--doodle-sketch)',
        borderRadius: '18px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        maxHeight: '100%'
      }}
    >
      <div style={{ 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <h3
          style={{
            fontFamily: 'Architects Daughter, cursive',
            color: 'var(--doodle-ink)',
            marginBottom: '12px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1.1rem'
          }}
        >
          <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>
            <ChatIcon fontSize="small" />
          </span>
          Room Chat
          {!chatVisible && !isSpectator() && (
            <span
              style={{
                marginLeft: 12,
                background: 'var(--doodle-yellow, #ffe066)',
                color: 'var(--doodle-ink)',
                borderRadius: 8,
                padding: '2px 8px',
                fontSize: '0.75rem',
                 
              }}
            >
              Answer to chat
            </span>
          )}
        </h3>

        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            marginBottom: '12px',
            border: '2px dashed var(--doodle-sketch)',
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.5)',
            minHeight: 0,
            maxHeight: '100%'
          }}
        >
          {chatMessages.filter(isMessageVisible).length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--doodle-secondary, #aaa)',
                 
                fontStyle: 'italic',
                padding: '20px 10px',
                fontSize: '0.9rem'
              }}
            >
              No messages yet... be the first to say hi!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatMessages
                .filter(isMessageVisible)
                .map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      background:
                        msg.type === 'system'
                          ? 'var(--doodle-grey, #f5f5f5)'
                          : msg.username === gameData?.username
                            ? 'var(--doodle-blue, #4dabf7)'
                            : 'var(--doodle-yellow, #ffe066)',
                      color:
                        msg.type === 'system'
                          ? 'var(--doodle-ink, #333)'
                          : msg.username === gameData?.username
                            ? 'white'
                            : 'var(--doodle-ink, #333)',
                      borderRadius: '12px',
                      marginLeft: msg.username === gameData?.username ? 'auto' : '0',
                      marginRight: msg.username === gameData?.username ? '0' : 'auto',
                      maxWidth: '85%',
                       
                      border: msg.type === 'system' ? '1px dashed #bbb' : undefined,
                      fontStyle: msg.type === 'system' ? 'italic' : 'normal',
                      wordWrap: 'break-word',
                      fontSize: '0.9rem'
                    }}
                  >
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      marginBottom: '4px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6,
                      flexWrap: 'wrap'
                    }}>
                      <span>
                        {msg.type === 'system' ? (
                          <span
                            style={{
                              background: 'var(--doodle-grey, #f5f5f5)',
                              color: 'var(--doodle-ink, #333)',
                              borderRadius: 6,
                              padding: '1px 6px',
                              fontSize: '0.7rem',
                              border: '1px solid #bbb'
                            }}
                          >
                            System
                          </span>
                        ) : (
                          msg.username
                        )}
                      </span>
                      <span style={{ opacity: 0.7, fontWeight: 400, fontSize: '0.7rem' }}>
                        {formatTime(msg.time)}
                      </span>
                    </div>
                    <div style={{ lineHeight: '1.4' }}>{msg.message}</div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          {!canSendMessage() && !chatVisible && !isSpectator() && (
            <div
              style={{
                textAlign: 'center',
                padding: '6px 10px',
                marginBottom: '8px',
                background: 'var(--doodle-yellow, #ffe066)',
                color: 'var(--doodle-ink, #333)',
                 
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px dashed var(--doodle-sketch)'
              }}
            >
              Answer the question to unlock chat
            </div>
          )}
          {!canSendMessage() && !gameSettings?.allowSpectatorChat && isSpectator() && gameData?.status === 'playing' && (
            <div
              style={{
                textAlign: 'center',
                padding: '6px 10px',
                marginBottom: '8px',
                background: 'var(--doodle-grey, #f5f5f5)',
                color: 'var(--doodle-ink, #333)',
                 
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px dashed #bbb'
              }}
            >
              Chat disabled by host
            </div>
          )}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="doodle-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                canSendMessage()
                  ? 'Type a message...'
                  : !chatVisible
                    ? 'Answer to chat'
                    : 'Chat disabled'
              }
              style={{ 
                flex: 1, 
                  
                fontSize: '0.9rem',
                padding: '8px 12px',
                minWidth: 0
              }}
              disabled={!canSendMessage()}
            />
            <button
              type="submit"
              className="doodle-btn doodle-btn-primary"
              disabled={!message.trim() || !canSendMessage()}
              style={{ 
                  
                fontSize: '0.9rem', 
                padding: '8px 16px',
                whiteSpace: 'nowrap'
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
