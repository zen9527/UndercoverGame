import { useState, useEffect } from 'react';
import { wsClient } from '../shared/WebSocketClient';

function GameControl() {
  const [gamePhase, setGamePhase] = useState<'WAITING' | 'WAITING_FOR_WORDS' | 'SPEAKING' | 'VOTING' | 'RESULT'>('WAITING');
  const [currentSpeaker, setCurrentSpeaker] = useState<{ playerId: string; playerNumber: number } | null>(null);

  useEffect(() => {
    const unsubscribe1 = wsClient.on('currentSpeaker', (data: any) => {
      setCurrentSpeaker(data);
      setGamePhase('SPEAKING');
    });

    const unsubscribe2 = wsClient.on('timerEnded', () => {
      setGamePhase('VOTING');
    });

    const unsubscribe3 = wsClient.on('revealResult', () => {
      setGamePhase('RESULT');
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, []);

  const handleStartGame = () => {
    wsClient.send('startGame', {});
    setGamePhase('WAITING_FOR_WORDS');
  };

  const handleStartSpeaking = () => {
    wsClient.send('startSpeaking', {});
  };

  const handleStartVoting = () => {
    wsClient.send('startVoting', { timeout: 45 });
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        🎮 游戏控制
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>

      {currentSpeaker && (
        <div className="bg-gradient-to-r from-purple-500/30 to-purple-700/30 p-6 rounded-xl border border-purple-500/50 mb-6 text-center">
          <p className="text-gray-300 text-sm uppercase tracking-wider mb-2">当前发言者</p>
          <p className="text-5xl font-black text-purple-400">{currentSpeaker.playerNumber}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {gamePhase === 'WAITING' && (
          <button
            onClick={handleStartGame}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            开始游戏
          </button>
        )}

        {gamePhase === 'WAITING_FOR_WORDS' && (
          <div className="text-gray-400 text-lg">等待所有玩家查看词语...</div>
        )}

        {gamePhase === 'SPEAKING' && (
          <>
            <button
              onClick={handleStartSpeaking}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-green-500/50"
            >
              开始发言计时
            </button>
          </>
        )}

        {gamePhase === 'VOTING' && (
          <button
            onClick={handleStartVoting}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-red-500/50"
          >
            开始投票
          </button>
        )}

        {gamePhase === 'RESULT' && (
          <>
            <button
              onClick={() => {
                wsClient.send('startNextRound', {});
                setGamePhase('WAITING');
              }}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              下一轮
            </button>
            <button
              onClick={() => {
                wsClient.send('endGame', {});
                setGamePhase('WAITING');
              }}
              className="bg-white/10 border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
            >
              结束游戏
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default GameControl;
