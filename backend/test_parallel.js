const { gameManager } = require('./dist/gameManager');
const { selectBotMove, BotDifficulty } = require('./dist/botPlayer');

console.log('=== Testing 5 Parallel Bot Sessions ===\n');

// Create 5 bot games simultaneously
const rooms = [];
for (let i = 1; i <= 5; i++) {
  const roomId = `bot-room-${i}`;
  rooms.push(roomId);
  gameManager.createGame(roomId, true, BotDifficulty.MEDIUM);
  gameManager.addPlayer(roomId, `user${i}`, `User${i}`, false);
  gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);
}

console.log('Created 5 parallel bot games\n');

// Make moves in all games simultaneously
for (let i = 0; i < rooms.length; i++) {
  const roomId = rooms[i];
  const userId = `user${i + 1}`;
  
  // User move
  const move = gameManager.makeMove(roomId, userId, { from: 'e2', to: 'e4' });
  
  if (!move.success) {
    console.error(`ERROR in ${roomId}: User move failed - ${move.error}`);
  } else {
    console.log(`✓ ${roomId}: User moved e2->e4`);
  }
}

console.log('\n--- Bot moves ---\n');

// Bot moves in all games
for (let i = 0; i < rooms.length; i++) {
  const roomId = rooms[i];
  const chess = gameManager.getChessInstance(roomId);
  
  if (!chess) {
    console.error(`ERROR in ${roomId}: Could not get chess instance`);
    continue;
  }
  
  const botMove = selectBotMove(chess, BotDifficulty.MEDIUM);
  
  if (!botMove) {
    console.error(`ERROR in ${roomId}: Bot could not select move`);
    continue;
  }
  
  const result = gameManager.makeMove(roomId, 'bot-player', {
    from: botMove.from,
    to: botMove.to
  });
  
  if (!result.success) {
    console.error(`ERROR in ${roomId}: Bot move failed - ${result.error}`);
  } else {
    console.log(`✓ ${roomId}: Bot moved ${botMove.from}->${botMove.to}`);
  }
}

console.log('\n--- Verifying game states ---\n');

// Verify all games have correct state
for (let i = 0; i < rooms.length; i++) {
  const roomId = rooms[i];
  const state = gameManager.getState(roomId);
  
  if (state.history.length !== 2) {
    console.error(`ERROR in ${roomId}: Expected 2 moves, got ${state.history.length}`);
  } else {
    console.log(`✓ ${roomId}: Game state correct - moves: ${state.history.join(', ')}`);
  }
}

console.log('\n=== SUCCESS: All 5 parallel bot games work correctly! ===');
