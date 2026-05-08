import { useState, useEffect } from 'react';
import { wsClient } from '../shared/WebSocketClient';
import { GamePhase } from '@shared/types';
import JoinRoom from './JoinRoom';
import ViewWord from './ViewWord';
import SpeakingTimer from './SpeakingTimer';
import VoteInterface from './VoteInterface';

function PlayerApp() {
  const [joined, setJoined] = useState(false);
  const [wordViewed, setWordViewed] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>('WAITING');
  const [myPlayerId, setMyPlayerId] = useState<string>('');

  useEffect(() => {
    const unsub = wsClient.on('gamePhaseChanged', (data: any) => {
      setGamePhase(data.phase);
    });
    return unsub;
  }, []);

  const handleJoined = (_roomId: string, playerId: string) => {
    setMyPlayerId(playerId);
    setJoined(true);
  };

  const handleWordViewed = () => {
    setWordViewed(true);
  };

  // Phase 1: Join room
  if (!joined) {
    return <JoinRoom onJoined={handleJoined} />;
  }

  // Phase 2: View assigned word
  if (!wordViewed) {
    return <ViewWord onViewed={handleWordViewed} />;
  }

  // Phase 3+: Driven by server-side gamePhase
  switch (gamePhase) {
    case 'WORD_ASSIGNMENT':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="text-white text-center py-20 text-xl animate-pulse">
            等待其他玩家查看词语...
          </div>
        </div>
      );
    case 'SPEAKING':
      return <SpeakingTimer myPlayerId={myPlayerId} />;
    case 'VOTING':
      return <VoteInterface myPlayerId={myPlayerId} />;
    case 'VOTE_RESULT':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="text-white text-center py-20 text-xl">
            投票结果公布中...
          </div>
        </div>
      );
    case 'GAME_OVER':
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full text-center">
            <h2 className="text-3xl font-bold text-white mb-4">游戏结束</h2>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold mt-6"
            >
              返回首页
            </button>
          </div>
        </div>
      );
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="text-white text-center py-20">等待游戏开始...</div>
        </div>
      );
  }
}

export default PlayerApp;
