import { useState, useEffect } from 'react';
import RoomSetup from './RoomSetup';
import PlayerList from './PlayerList';
import GameControl from './GameControl';
import { wsClient } from '../shared/WebSocketClient';
import { GamePhase } from '@shared/types';

function HostApp() {
  const [roomCreated, setRoomCreated] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [gamePhase, setGamePhase] = useState<GamePhase>('WAITING');
  const [isHost, setIsHost] = useState(true);
  const [hostTransferMessage, setHostTransferMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub1 = wsClient.on('gamePhaseChanged', (data: any) => {
      setGamePhase(data.phase);
    });

    // 🎯 监听房主转移事件
    const unsub2 = wsClient.on('hostTransferred', ({ newHostId }: any) => {
      const myPlayerId = wsClient.getPlayerId();
      
      if (myPlayerId === newHostId) {
        // 🎯 我成为新房主
        setIsHost(true);
        setHostTransferMessage('原房主已离开，你已成为新房主！请继续控制游戏。');
        
        // 3 秒后自动隐藏提示
        setTimeout(() => {
          setHostTransferMessage(null);
        }, 5000);
      } else {
        // 🎯 其他人成为房主，我失去控制权
        setIsHost(false);
        setHostTransferMessage(`房主已变更为玩家 ${newHostId}。你失去游戏控制权。`);
        
        setTimeout(() => {
          setHostTransferMessage(null);
        }, 5000);
      }
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleRoomCreated = (newRoomId: string, _playerId: string) => {
    setRoomId(newRoomId);
    wsClient.setRoomId(newRoomId);
    setRoomCreated(true);
    setIsHost(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="text-center py-12">
        <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          谁是卧底
        </h1>
        <p className="text-gray-400 mt-4 tracking-widest">SPY GAME — 房主界面</p>
      </header>

      {/* 🎯 房主转移提示 */}
      {hostTransferMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-8 py-4 rounded-xl border-2 shadow-lg backdrop-blur-xl ${
            isHost 
              ? 'bg-green-500/20 border-green-500/50 text-green-300' 
              : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
          }`}>
            <p className="text-lg font-bold">{hostTransferMessage}</p>
          </div>
        </div>
      )}

      {/* 🎯 失去控制权提示 */}
      {!isHost && roomCreated && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl px-6 py-3 shadow-lg backdrop-blur-xl">
            <p className="text-red-300 font-semibold">⚠️ 你已失去房主控制权</p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4">
        {!roomCreated ? (
          <RoomSetup onRoomCreated={handleRoomCreated} />
        ) : (
          <>
            <PlayerList />
            {/* 🎯 只有房主才能看到控制界面 */}
            {isHost ? (
              <GameControl roomId={roomId} gamePhase={gamePhase} onPhaseChange={setGamePhase} />
            ) : (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                <p className="text-gray-400 text-lg">游戏控制界面已隐藏（你不再是房主）</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HostApp;
