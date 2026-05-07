import { useState } from 'react';
import RoomSetup from './RoomSetup';
import PlayerList from './PlayerList';
import GameControl from './GameControl';

function HostApp() {
  const [roomCreated, setRoomCreated] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="text-center py-12">
        <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          谁是卧底
        </h1>
        <p className="text-gray-400 mt-4 tracking-widest">SPY GAME</p>
      </header>
      
      <main className="max-w-6xl mx-auto px-4">
        {!roomCreated ? (
          <RoomSetup onRoomCreated={() => setRoomCreated(true)} />
        ) : (
          <>
            <PlayerList />
            <GameControl />
          </>
        )}
      </main>
    </div>
  );
}

export default HostApp;
