import { useEffect, useState } from 'react';
import { wsClient } from '../shared/WebSocketClient';
import { Player } from '@shared/types';

function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState<string>('');

  useEffect(() => {
    const unsubscribe = wsClient.on('playerListUpdated', (data: any) => {
      setPlayers(data.players);
      setRoomId(data.roomId);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        📱 玩家加入房间
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>

      <div className="bg-white/8 p-6 rounded-xl border border-white/10 text-center mb-6">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-3">房间码</p>
        <p className="text-4xl font-black text-purple-400 tracking-widest">{roomId || '等待创建'}</p>
        <p className="text-gray-500 text-xs mt-2">请玩家扫描 QR 码或输入房间码加入</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {players.map((player) => (
          <div
            key={player.playerId}
            className={`bg-white/8 p-6 rounded-xl border-2 transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-purple-500/30 ${
              player.isHost ? 'border-purple-500/80' : 'border-purple-500/30'
            }`}
          >
            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              {player.playerNumber}
            </div>
            <div className="text-white text-lg font-semibold mt-2">{player.nickname}</div>
            {player.isHost && (
              <div className="text-xs text-purple-400 mt-1 uppercase tracking-wider">房主</div>
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
