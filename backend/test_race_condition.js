const { gameManager } = require('./dist/gameManager');
const { selectBotMove, BotDifficulty } = require('./dist/botPlayer');

console.log('=== Testing Potential Race Condition ===\n');

const roomId = 'race-test-room';
gameManager.createGame(roomId, true, BotDifficulty.EASY);
gameManager.addPlayer(roomId, 'user1', 'User1', false);
gameManager.addPlayer(roomId, 'bot-player', 'Bot', true);

console.log('Created bot game\n');

// Simulate rapid moves - make a move, then immediately try to make another before bot responds
console.log('Move 1: User moves e2->e4');
let move1 = gameManager.makeMove(roomId, 'user1', { from: 'e2', to: 'e4' });
console.log('Result:', move1.success);

// Try to make another move immediately (should fail - not user's turn)
console.log('\nMove 2: User tries to move again immediately');
let move2 = gameManager.makeMove(roomId, 'user1', { from: 'd2', to: 'd4' });
console.log('Result:', move2.success, '- Error:', move2.error);

// Bot makes its move
console.log('\nBot moves...');
const chess = gameManager.getChessInstance(roomId);
const botMove = selectBotMove(chess, BotDifficulty.EASY);
const botResult = gameManager.makeMove(roomId, 'bot-player', {
  from: botMove.from,
  to: botMove.to
});
console.log('Bot move result:', botResult.success);

// Now user can move again
console.log('\nMove 3: User moves d2->d4');
move2 = gameManager.makeMove(roomId, 'user1', { from: 'd2', to: 'd4' });
console.log('Result:', move2.success);

console.log('\nFinal game state:', gameManager.getState(roomId).history);
console.log('\n=== Test completed successfully! ===');
