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

  useEffect(() => {
    const unsub = wsClient.on('gamePhaseChanged', (data: any) => {
      setGamePhase(data.phase);
    });
    return unsub;
  }, []);

  const handleRoomCreated = (newRoomId: string, _playerId: string) => {
    setRoomId(newRoomId);
    wsClient.setRoomId(newRoomId);
    setRoomCreated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="text-center py-12">
        <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          谁是卧底
        </h1>
        <p className="text-gray-400 mt-4 tracking-widest">SPY GAME — 房主界面</p>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {!roomCreated ? (
          <RoomSetup onRoomCreated={handleRoomCreated} />
        ) : (
          <>
            <PlayerList />
            <GameControl roomId={roomId} gamePhase={gamePhase} onPhaseChange={setGamePhase} />
          </>
        )}
      </main>
    </div>
  );
}

export default HostApp;
