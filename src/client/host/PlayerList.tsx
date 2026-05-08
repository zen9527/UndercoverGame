import { useEffect, useState } from 'react';
import { wsClient } from '../shared/WebSocketClient';
import { Player } from '@shared/types';

function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState<string>('');
  const [newHostInfo, setNewHostInfo] = useState<{ playerId: string; nickname: string } | null>(null);

  useEffect(() => {
    const unsub1 = wsClient.on('playerListUpdated', (data: any) => {
      setPlayers(data.players);
      if (data.roomId) setRoomId(data.roomId);
    });

    // 🎯 监听房主转移，显示新房主信息
    const unsub2 = wsClient.on('hostTransferred', ({ newHostId }: any) => {
      // 从当前玩家列表中找新房主的昵称
      const newHost = players.find(p => p.playerId === newHostId);
      if (newHost) {
        setNewHostInfo({ playerId: newHostId, nickname: newHost.nickname });
        
        // 3 秒后自动隐藏
        setTimeout(() => {
          setNewHostInfo(null);
        }, 3000);
      }
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [players]);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        📱 玩家加入房间
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>

      {/* 🎯 房主转移提示 */}
      {newHostInfo && (
        <div className="bg-blue-500/20 border-2 border-blue-500/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-blue-300 font-semibold">
            🔄 房主已变更为：<span className="font-bold">{newHostInfo.nickname}</span>
          </p>
        </div>
      )}

      <div className="bg-white/8 p-6 rounded-xl border border-white/10 text-center mb-6">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">房间码</p>
        <p className="text-4xl font-black text-purple-400 tracking-widest">{roomId || '等待创建'}</p>
        <p className="text-gray-500 text-xs mt-2">请玩家输入房间码加入</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {players.map((player) => (
          <div
            key={player.playerId}
            className={`bg-white/8 p-6 rounded-xl border-2 transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-purple-500/30 ${
              player.isHost ? 'border-purple-500/80 shadow-purple-500/20' : 'border-purple-500/30'
            } ${player.status === 'ELIMINATED' ? 'opacity-40' : ''}`}
          >
            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              {player.playerNumber}
            </div>
            <div className="text-white text-lg font-semibold mt-2">{player.nickname}</div>
            {player.isHost && (
              <div className="text-xs text-purple-400 mt-1 uppercase tracking-wider font-bold">👑 房主</div>
            )}
            {player.status === 'ELIMINATED' && (
              <div className="text-xs text-red-400 mt-1 uppercase tracking-wider">已淘汰</div>
            )}
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          等待玩家加入...
        </div>
      )}
    </div>
  );
}

export default PlayerList;
