// RetroArcadeEntry.js
import React from "react";
import {
    Container, Box, Avatar, Paper, Tabs, Tab,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Button, Divider, CircularProgress, Alert, Typography
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";

export default function RetroArcadeEntry({
    tab, handleTabChange, name, handleNameChange,
    rounds, handleRoundsChange, customRounds, handleCustomRoundsChange,
    roomCode, handleRoomCodeChange, handleCreateRoom, handleJoinRoom,
    loading, error, clearError, handleBackToModes
}) {
    return (
        <div style={{
            backgroundImage: "url(/retro-bg.png)",
            backgroundSize: "cover",
            height: "100vh",
            fontFamily: "'Press Start 2P', cursive"
        }}>
            <Container maxWidth="sm"
                sx={{
                    backgroundColor: "rgba(20,20,20,0.9)",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "4px solid #ff0040",
                    boxShadow: "6px 6px 0px #000"
                }}>
                <Box textAlign="center" mb={4} color="white">
                    <Avatar
                        sx={{
                            width: 80, height: 80, mx: "auto", mb: 2,
                            bgcolor: "#ff0040", border: "3px solid white"
                        }}>
                        <GroupsIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <h1 style={{ color: "#ffcc00", textShadow: "3px 3px #000" }}>
                        CompeteHub Retro
                    </h1>
                    <h2 style={{ maxWidth: "600px", margin: "auto", color: "#fff" }}>
                        Create or join a multiplayer room
                    </h2>
                </Box>

                {error && <Alert severity="error" onClose={clearError}>{error}</Alert>}

                <Paper elevation={4} sx={{ backgroundColor: "#111", border: "2px solid #ff0040" }}>
                    <Box p={4}>
                        <Tabs value={tab} onChange={handleTabChange}
                            textColor="secondary" indicatorColor="secondary">
                            <Tab label="CREATE ROOM" />
                            <Tab label="JOIN ROOM" />
                        </Tabs>
<div style={{
  background: 'black url(/bg.png) repeat',
  backgroundSize: '80px',
  height: '100vh',
  fontFamily: '"Press Start 2P", cursive',
  color: '#fff',
  padding: '40px'
}}>
  <Container maxWidth="sm"
    sx={{
      backgroundColor: '#222',
      padding: '20px',
      borderRadius: '0',
      border: '4px solid #0ff',
      boxShadow: '8px 8px 0 #f00'
    }}
  >
    <Typography variant="h4" textAlign="center" sx={{ mb: 3, color: '#ff0040' }}>
      🎮 TEAM MODE
    </Typography>

    <Tabs
      value={tab}
      onChange={handleTabChange}
      textColor="inherit"
      sx={{
        '& .MuiTab-root': { fontSize: '12px', fontWeight: 'bold', color: '#0ff' },
        '& .MuiTabs-indicator': { backgroundColor: '#ff0' }
      }}
    >
      <Tab label="CREATE ROOM" />
      <Tab label="JOIN ROOM" />
    </Tabs>

    {/* Forms same as your code but keep font and colors consistent */}
    ...
  </Container>
</div>
<div style={{
  background: 'url(/bg.png) center/120px repeat, #0a0a0f',
  height: '100vh',
  fontFamily: '"Orbitron", sans-serif',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}}>
  <Container maxWidth="sm"
    sx={{
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '30px',
      borderRadius: '12px',
      border: '2px solid #0ff',
      boxShadow: '0 0 20px #0ff, 0 0 40px #f0f'
    }}
  >
    <Typography variant="h4" textAlign="center"
      sx={{
        mb: 3,
        fontWeight: 'bold',
        color: '#0ff',
        textShadow: '0 0 10px #0ff, 0 0 20px #f0f'
      }}>
      ⚡ TEAM MODE ⚡
    </Typography>

    <Tabs
      value={tab}
      onChange={handleTabChange}
      sx={{
        '& .MuiTab-root': { color: '#fff', textTransform: 'uppercase' },
        '& .Mui-selected': { color: '#0ff' },
        '& .MuiTabs-indicator': { backgroundColor: '#f0f' }
      }}
    >
      <Tab label="Create Room" />
      <Tab label="Join Room" />
    </Tabs>

    {/* Forms same as your code but input borders glow on focus */}
    ...
  </Container>
</div>
<div style={{
  background: 'url(/bg.png) repeat center',
  backgroundSize: '100px',
  height: '100vh',
  fontFamily: '"Fredoka One", cursive',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}}>
  <Container maxWidth="sm"
    sx={{
      background: 'linear-gradient(135deg, #ff7eb3, #ff758c)',
      padding: '30px',
      borderRadius: '24px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
    }}
  >
    <Typography variant="h3" textAlign="center" sx={{ mb: 3, color: '#fff' }}>
      🍬 Team Mode
    </Typography>

    <Tabs
      value={tab}
      onChange={handleTabChange}
      sx={{
        '& .MuiTab-root': { color: '#fff', fontWeight: 'bold' },
        '& .Mui-selected': { color: '#ffe600' },
        '& .MuiTabs-indicator': { backgroundColor: '#ffe600' }
      }}
    >
      <Tab label="Create Room" />
      <Tab label="Join Room" />
    </Tabs>

    {/* Forms same but inputs rounded, buttons gradient */}
    ...
  </Container>
</div>

                        {/* Same form content */}
            // NeonEntry.js
                        <div style={{
                            backgroundImage: "url(/cyber-bg.png)",
                            backgroundSize: "cover",
                            backgroundColor: "#0a0a0f",
                            height: "100vh",
                            fontFamily: "'Orbitron', sans-serif"
                        }}>
                            <Container maxWidth="sm"
                                sx={{
                                    backgroundColor: "rgba(0,0,0,0.7)",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    border: "2px solid #0ff",
                                    boxShadow: "0 0 20px #0ff"
                                }}>
                                <Box textAlign="center" mb={4} color="#0ff">
                                    <Avatar sx={{
                                        width: 80, height: 80, mx: "auto", mb: 2,
                                        bgcolor: "#0ff", color: "#000",
                                        boxShadow: "0 0 15px #0ff"
                                    }}>
                                        <GroupsIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <h1 style={{ textShadow: "0 0 10px #0ff, 0 0 20px #0ff" }}>
                                        CompeteHub Neon
                                    </h1>
                                    <h2 style={{ color: "#fff", opacity: 0.8 }}>
                                        Create or join a multiplayer room
                                    </h2>
                                </Box>
                            </Container>
                        </div>
// ArcadeCandyEntry.js
                        <div style={{
                            backgroundImage: "url(/arcade-bg.png)",
                            backgroundSize: "cover",
                            height: "100vh",
                            fontFamily: "'Fredoka One', cursive"
                        }}>
                            <Container maxWidth="sm"
                                sx={{
                                    background: "linear-gradient(145deg, #ffcc00, #ff6699)",
                                    padding: "20px",
                                    borderRadius: "20px",
                                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
                                }}>
                                <Box textAlign="center" mb={4} color="white">
                                    <Avatar sx={{
                                        width: 80, height: 80, mx: "auto", mb: 2,
                                        bgcolor: "#ff6699", boxShadow: "0 0 12px #ffcc00"
                                    }}>
                                        <GroupsIcon sx={{ fontSize: 40 }} />
                                    </Avatar>
                                    <h1 style={{ color: "#fff", textShadow: "2px 2px #ff6600" }}>
                                        CompeteHub Arcade
                                    </h1>
                                    <h2>Create or join a multiplayer room</h2>
                                </Box>
                            </Container>
                        </div>
// FuturisticEntry.js
                        <div style={{
                            backgroundImage: "url(/grid-bg.png)",
                            backgroundSize: "cover",
                            height: "100vh",
                            fontFamily: "'Roboto', sans-serif"
                        }}>
                            <Container maxWidth="sm"
                                sx={{
                                    background: "rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(10px)",
                                    padding: "20px",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(255,255,255,0.4)"
                                }}>
                                <Box textAlign="center" mb={4} color="white">
                                    <Avatar sx={{
                                        width: 80, height: 80, mx: "auto", mb: 2,
                                        bgcolor: "rgba(255,255,255,0.3)"
                                    }}>
                                        <GroupsIcon sx={{ fontSize: 40, color: "#fff" }} />
                                    </Avatar>
                                    <h1 style={{ color: "#fff", fontWeight: "300", letterSpacing: "2px" }}>
                                        CompeteHub Futuristic
                                    </h1>
                                    <h2 style={{ color: "rgba(255,255,255,0.7)" }}>
                                        Create or join a multiplayer room
                                    </h2>
                                </Box>
                            </Container>
                        </div>

                    </Box>
                </Paper>
            </Container>
        </div>
    );
}
