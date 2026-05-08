import { useState } from 'react';
import { wsClient } from '../shared/WebSocketClient';
import { joinRoomSchema } from '@shared/schemas';

interface JoinRoomProps {
  onJoined: (roomId: string, playerId: string) => void;
}

function JoinRoom({ onJoined }: JoinRoomProps) {
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = () => {
    setError('');

    // Validate input
    const result = joinRoomSchema.safeParse({ roomId, nickname });
    if (!result.success) {
      setError(result.error.issues.map(i => i.message).join(', '));
      return;
    }

    setLoading(true);

    // Listen for success
    const unsubJoined = wsClient.on('roomJoined', (data: any) => {
      setLoading(false);
      unsubJoined();
      unsubError();
      onJoined(data.roomId, data.playerId);
    });

    const unsubError = wsClient.on('roomError', (data: any) => {
      setLoading(false);
      unsubJoined();
      unsubError();
      setError(data.message || '加入失败');
    });

    // Connect if needed, then join
    if (!wsClient.isConnected) {
      const unsubConnected = wsClient.on('connected', () => {
        unsubConnected();
        wsClient.joinRoom(roomId, nickname);
      });
      wsClient.connect(nickname, false);
    } else {
      wsClient.joinRoom(roomId, nickname);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          🎮 加入游戏
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300 text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
              房间码
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="输入 6 位房间码"
              className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-xl text-center tracking-widest focus:border-purple-500/80 outline-none uppercase"
              maxLength={6}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
              昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入你的昵称"
              className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
              maxLength={20}
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white px-10 py-4 rounded-xl text-xl font-bold hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '加入中...' : '加入房间'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
