// pages/CustomRooms.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../../app/providers/GameContext';
import { useAudio } from '../../../../app/providers/AudioContext';
import '../../../../styles/themes/doodle.css';

const CustomRooms = () => {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [rounds, setRounds] = useState(1);
  const [customRounds, setCustomRounds] = useState(5);
  const [tab, setTab] = useState(0);
  const [mode, setMode] = useState(0);
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);

  const navigate = useNavigate();
  const { createRoom, joinRoom, error: gameError, clearError, loading: gameLoading } = useGame();
  const { playClick, playSuccess, playError } = useAudio();

  const fetchActiveRooms = async () => {
    try {
      setLoading(true);
      setActiveRooms([]);
    } catch (err) {
      console.error('Error fetching active rooms:', err);
      setActiveRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const handleCreateRoom = () => {
    if (!name) {
      playError();
      setError('Please enter your name');
      return;
    }
    playSuccess();
    const selectedRounds = rounds === 'custom' ? customRounds : rounds;
    createRoom(name, selectedRounds);
  };

  const handleJoinRoom = () => {
    if (!name || !roomCode) {
      playError();
      setError('Please enter your name and room code');
      return;
    }
    if (roomCode.length !== 6) {
      playError();
      setError('Room code must be 6 characters');
      return;
    }
    playSuccess();
    joinRoom(name, roomCode);
  };

  const handleBackToModes = () => {
    playClick();
    setMode(0);
    setError('');
    clearError();
  };

  const handleCreateJoinMode = () => {
    playClick();
    setMode(1);
    setError('');
    clearError();
  };

  const handleTabChange = (_, newValue) => {
    playClick();
    setTab(newValue);
    setError('');
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError('');
  };

  const handleRoomCodeChange = (e) => {
    setRoomCode(e.target.value.toUpperCase());
    setError('');
  };

  const handleRoundsChange = (e) => {
    setRounds(e.target.value);
  };

  const handleCustomRoundsChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 10) {
      setCustomRounds(value);
    }
  };

  // === Main Menu Screen ===
  // if (mode === 0) {
  //   return (
  //     <main
  //       className="min-h-screen doodle-container flex flex-col items-center py-12 px-6 relative overflow-hidden"
  //       // style={{
  //       //   backgroundImage: "url('/doodle-bg.png')",
  //       //   backgroundRepeat: 'repeat',
  //       //   backgroundSize: 'contain',
  //       // }}
  //     >
  //       <motion.h1
  //         initial={{ scale: 0.9, opacity: 0 }}
  //         animate={{ scale: 1, opacity: 1 }}
  //         className="text-5xl font-handwritten text-[#222] mb-10 flex items-center gap-2"
  //       >
  //         <Trophy className="text-yellow-500" /> 5v5 Custom Rooms
  //       </motion.h1>

  //       <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
  //         {/* Create Room Card */}
  //         <motion.div
  //           whileHover={{ rotate: -1, scale: 1.03 }}
  //           className="bg-[#e3dcff] border-4 border-black rounded-3xl p-8 text-center shadow-doodle"
  //         >
  //           <Plus size={48} className="mx-auto mb-3 text-[#4b3df5]" />
  //           <h3 className="font-handwritten text-2xl mb-2">Create New Room</h3>
  //           <p className="font-doodle text-[#333] mb-4">
  //             Host your own battle arena with custom rounds and chaos!
  //           </p>
  //           <button
  //             onClick={handleCreateJoinMode}
  //             className="bg-[#4b3df5] hover:bg-[#382dd6] text-white font-handwritten px-6 py-3 rounded-xl shadow-doodle border-2 border-black transition-all"
  //           >
  //             Let's Build One!
  //           </button>
  //         </motion.div>

  //         {/* Join Room Card */}
  //         <motion.div
  //           whileHover={{ rotate: 1, scale: 1.03 }}
  //           className="bg-[#ffedb5] border-4 border-black rounded-3xl p-8 text-center shadow-doodle"
  //         >
  //           <Search size={48} className="mx-auto mb-3 text-[#ff9800]" />
  //           <h3 className="font-handwritten text-2xl mb-2">Join Existing Room</h3>
  //           <p className="font-doodle text-[#333] mb-4">
  //             Got a room code? Jump straight into battle!
  //           </p>
  //           <button
  //             onClick={handleCreateJoinMode}
  //             className="bg-[#ff9800] hover:bg-[#ff7b00] text-white font-handwritten px-6 py-3 rounded-xl shadow-doodle border-2 border-black transition-all"
  //           >
  //             Join Room
  //           </button>
  //         </motion.div>
  //       </div>

  //       {/* Active Rooms Section */}
  //       <div className="w-full max-w-4xl bg-white border-4 border-black rounded-3xl p-8 shadow-doodle">
  //         <h2 className="flex items-center gap-2 text-2xl font-handwritten mb-4">
  //           <Users size={28} /> Active Rooms
  //         </h2>
  //         {loading ? (
  //           <p className="font-doodle text-gray-500 text-center py-10">
  //             🌀 Fetching rooms from the battlefield...
  //           </p>
  //         ) : activeRooms.length > 0 ? (
  //           <div className="flex flex-col gap-4">
  //             {activeRooms.map((room) => (
  //               <motion.div
  //                 whileHover={{ scale: 1.02 }}
  //                 key={room.id}
  //                 className="border-2 border-black rounded-2xl p-4 bg-[#f9f9f9] shadow-doodle flex justify-between items-center"
  //               >
  //                 <div>
  //                   <h4 className="font-handwritten text-lg mb-1">{room.name}</h4>
  //                   <p className="text-sm text-gray-600 font-doodle">
  //                     Players: {room.players} | Host: {room.host}
  //                   </p>
  //                 </div>
  //                 <button
  //                   onClick={() => {
  //                     setRoomCode(room.id);
  //                     handleCreateJoinMode();
  //                   }}
  //                   className="bg-[#2196f3] text-white px-5 py-2 font-handwritten rounded-xl border-2 border-black shadow-doodle"
  //                 >
  //                   Join
  //                 </button>
  //               </motion.div>
  //             ))}
  //           </div>
  //         ) : (
  //           <div className="text-center py-10">
  //             <p className="font-doodle text-gray-600 mb-2">No active rooms right now 😴</p>
  //             <p className="font-doodle text-gray-400">Be the first to start a new battle!</p>
  //           </div>
  //         )}
  //       </div>
  //     </main>
  //   );
  // }

  // === Create/Join Screen ===
  return (
    <>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #f7fafc 25%, transparent 25%), linear-gradient(-45deg, #f7fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f7fafc 75%), linear-gradient(-45deg, transparent 75%, #f7fafc 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#edf2f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
       
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Top Left - Back to Arena Icon */}
      <button
        onClick={() => navigate('/home')}
        className="doodle-btn"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'var(--doodle-sketch)',
          width: '48px',
          height: '48px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 10
        }}
        title="Back to Arena"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Top Right - How to Play Icon */}
      <button
        onClick={() => setShowRules(true)}
        className="doodle-btn"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--doodle-blue)',
          width: '48px',
          height: '48px',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 10
        }}
        title="How to Play"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        maxWidth: '1600px',
        width: '100%',
        flexWrap: 'wrap'
      }}>
        {/* Left Side - Game Setup Form */}
        <div style={{
          maxWidth: '600px',
          width: '100%',
          flex: '1 1 auto',
          background: 'var(--doodle-paper)',
          border: '4px solid var(--doodle-ink)',
          borderRadius: '25px',
          padding: '40px 35px',
          boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
          transform: 'rotate(-0.5deg)'
        }}>
          <div className="text-center mb-8">
            <h1 className="doodle-title text-4xl mb-3">Custom Room</h1>
            <p className="doodle-subtitle text-lg">Create or join a custom battle room</p>
          </div>

              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => handleTabChange(null, 0)}
                  className={`doodle-btn px-6 py-3 text-lg ${
                    tab === 0 ? 'doodle-btn-secondary' : ''
                  }`}
                >
                  Create Room
                </button>
                <button
                  onClick={() => handleTabChange(null, 1)}
                  className={`doodle-btn px-6 py-3 text-lg ${
                    tab === 1 ? 'doodle-btn-secondary' : ''
                  }`}
                >
                  Join Room
                </button>
              </div>

              {(error || gameError) && (
                <div className="doodle-alert mb-6">
                  ❗ {error || gameError}
                </div>
              )}

              {tab === 0 ? (
                <div className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                        Your Name
                      </label>
                      <input
                        value={name}
                        onChange={handleNameChange}
                        className="doodle-input w-full"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                        Number of Rounds
                      </label>
                      <select
                        value={rounds}
                        onChange={handleRoundsChange}
                        className="doodle-input w-full"
                      >
                        <option value={1}>1 Round</option>
                        <option value={2}>2 Rounds</option>
                        <option value={3}>3 Rounds</option>
                        <option value={4}>4 Rounds</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  {rounds === 'custom' && (
                    <div>
                      <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                        Custom Rounds (1–10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={customRounds}
                        onChange={handleCustomRoundsChange}
                        className="doodle-input w-full"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleCreateRoom}
                      disabled={!name || gameLoading}
                      className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      {gameLoading ? 'Creating...' : (
                        <>
                          Create Game
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => navigate('/home')}
                        className="doodle-btn flex-1 flex items-center justify-center gap-2"
                        style={{background: 'var(--doodle-sketch)', color: 'white'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Arena
                      </button>
                      <button
                        onClick={() => setShowRules(true)}
                        className="doodle-btn flex-1 flex items-center justify-center gap-2"
                        style={{background: 'var(--doodle-blue)', color: 'white'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How to Play
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                        Your Name
                      </label>
                      <input
                        value={name}
                        onChange={handleNameChange}
                        className="doodle-input w-full"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block mb-2" style={{  fontWeight: '600', color: 'var(--doodle-ink)'}}>
                        Room Code
                      </label>
                      <input
                        value={roomCode}
                        onChange={handleRoomCodeChange}
                        maxLength="6"
                        className="doodle-input w-full uppercase"
                        placeholder="6-digit code"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleJoinRoom}
                      disabled={!name || !roomCode || roomCode.length !== 6 || gameLoading}
                      className="doodle-btn doodle-btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      {gameLoading ? 'Joining...' : (
                        <>
                          Join Battle
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setShowRules(true)}
                        className="doodle-btn flex-1 flex items-center justify-center gap-2"
                        style={{background: 'var(--doodle-blue)', color: 'white'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How to Play
                      </button>
                      <button
                        onClick={() => navigate('/home')}
                        className="doodle-btn flex-1 flex items-center justify-center gap-2"
                        style={{background: 'var(--doodle-sketch)', color: 'white'}}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Arena
                      </button>
                    </div>
                  </div>
                </div>
              )}
        </div>

        {/* Right Side - Doodle Character */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          maxWidth: '500px'
        }}>
          <img 
            src="/doodierooms.png" 
            alt="Doodle Rooms" 
            style={{ 
              animation: 'bounce 2s infinite', 
              width: '100%', 
              maxWidth: '400px',
              height: 'auto'
            }} 
          />
          
          {/* Message Bubble */}
          <div style={{
            background: 'white',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '20px',
            padding: '20px 30px',
            boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)',
            transform: 'rotate(1deg)',
            maxWidth: '350px',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--doodle-ink)',
              lineHeight: 1.4
            }}>
              CREATE OR JOIN! 
              <br />
              <span style={{ color: '#6c5ce7' }}>BATTLE TOGETHER!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Rules Modal */}
    {showRules && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800">How to Play Custom Rooms</h2>
              <button
                onClick={() => setShowRules(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🎯 Objective</h3>
                <p>Challenge your friends in a custom trivia battle! Create or join private rooms and compete head-to-head.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🎮 Two Ways to Play</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Create Room:</strong> Host your own game and invite friends</li>
                  <li><strong>Join Room:</strong> Enter a friend's room code to join their game</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🏗️ Creating a Room</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Enter your display name</li>
                  <li>Choose number of rounds (1, 3, 5, 10, or custom)</li>
                  <li>Click "Create Game" to generate a room code</li>
                  <li>Share the 6-digit code with your friends</li>
                  <li>Wait for players to join before starting</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🔗 Joining a Room</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Enter your display name</li>
                  <li>Type the 6-digit room code</li>
                  <li>Click "Join Battle" to enter the room</li>
                  <li>Wait for the host to start the game</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">⚔️ Gameplay</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All players see the same questions</li>
                  <li>Answer as quickly and accurately as possible</li>
                  <li>Each question has a time limit</li>
                  <li>Faster correct answers = more points</li>
                  <li>Wrong answers give no points</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🏆 Scoring System</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Base points for correct answers</li>
                  <li>Speed bonus for quick responses</li>
                  <li>Points accumulate across all rounds</li>
                  <li>Live leaderboard shows current standings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">👥 Multiplayer Features</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>See who's in the room before starting</li>
                  <li>Chat with other players (if available)</li>
                  <li>Track everyone's progress in real-time</li>
                  <li>View final rankings at the end</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Tips for Success</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Make sure all players have stable internet</li>
                  <li>Start with fewer rounds for quick games</li>
                  <li>Share room codes via chat or social media</li>
                  <li>Be ready when the host starts the game</li>
                  <li>Balance speed with accuracy for best scores</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">🎪 Game Flow</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Create or join a room</li>
                  <li>Wait for all players to be ready</li>
                  <li>Host starts the game</li>
                  <li>Answer questions in each round</li>
                  <li>View results between rounds</li>
                  <li>See final leaderboard at the end</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="doodle-btn doodle-btn-secondary w-full mt-8 px-6 py-4"
            >
              Got It!
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default CustomRooms;
