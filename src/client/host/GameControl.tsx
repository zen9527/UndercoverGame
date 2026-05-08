import { useState, useEffect } from 'react';
import { wsClient } from '../shared/WebSocketClient';
import { GamePhase } from '@shared/types';

interface GameControlProps {
  roomId: string;
  gamePhase: GamePhase;
  onPhaseChange: (phase: GamePhase) => void;
}

function GameControl({ roomId, gamePhase, onPhaseChange }: GameControlProps) {
  const [currentSpeaker, setCurrentSpeaker] = useState<{
    playerId: string;
    playerNumber: number;
    nickname: string;
  } | null>(null);

  useEffect(() => {
    const unsub1 = wsClient.on('currentSpeaker', (data: any) => {
      setCurrentSpeaker(data);
    });

    const unsub2 = wsClient.on('voteResult', () => {
      onPhaseChange('VOTE_RESULT');
    });

    const unsub3 = wsClient.on('gameOver', () => {
      onPhaseChange('GAME_OVER');
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [onPhaseChange]);

  const handleStartGame = () => {
    wsClient.send('startGame', { roomId });
    onPhaseChange('WORD_ASSIGNMENT');
  };

  const handleStartTimer = (duration: number) => {
    wsClient.send('startTimer', { roomId, duration });
  };

  const handleNextRound = () => {
    wsClient.send('startNextRound', { roomId });
    onPhaseChange('SPEAKING');
  };

  const handleEndGame = () => {
    wsClient.send('endGame', { roomId });
    onPhaseChange('GAME_OVER');
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        🎮 游戏控制
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>

      {currentSpeaker && gamePhase === 'SPEAKING' && (
        <div className="bg-gradient-to-r from-purple-500/30 to-purple-700/30 p-6 rounded-xl border border-purple-500/50 mb-6 text-center">
          <p className="text-gray-300 text-sm uppercase tracking-wider mb-2">当前发言者</p>
          <p className="text-5xl font-black text-purple-400">{currentSpeaker.playerNumber}</p>
          <p className="text-gray-400 mt-2">{currentSpeaker.nickname}</p>
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

        {gamePhase === 'WORD_ASSIGNMENT' && (
          <div className="text-gray-400 text-lg">等待所有玩家查看词语...</div>
        )}

        {gamePhase === 'SPEAKING' && currentSpeaker && (
          <button
            onClick={() => handleStartTimer(30)}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-green-500/50"
          >
            开始发言计时
          </button>
        )}

        {gamePhase === 'VOTE_RESULT' && (
          <>
            <button
              onClick={handleNextRound}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              下一轮
            </button>
            <button
              onClick={handleEndGame}
              className="bg-white/10 border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
            >
              结束游戏
            </button>
          </>
        )}

        {gamePhase === 'GAME_OVER' && (
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">游戏已结束</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
            >
              返回首页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameControl;
