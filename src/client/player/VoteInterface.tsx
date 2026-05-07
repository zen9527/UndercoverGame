import React, { useState, useEffect } from 'react';
import { wsClient } from '../shared/WebSocketClient';
import { Player } from '@shared/types';

function VoteInterface() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(45);
  const [votingStarted, setVotingStarted] = useState(false);

  useEffect(() => {
    const unsubscribe1 = wsClient.on('playerListUpdated', (data: any) => {
      setPlayers(data.players);
    });

    const unsubscribe2 = wsClient.on('startVoting', (data: any) => {
      setVotingStarted(true);
      setTimerRemaining(data.timeout || 45);
      
      // Start countdown
      const interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitVote();
            return 0;
          }
          wsClient.send('timerUpdate', { remaining: prev - 1 });
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  const handleSubmitVote = () => {
    if (selectedPlayer) {
      wsClient.send('vote', { targetPlayerId: selectedPlayer });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">🗳️ 投票环节</h2>
        
        {votingStarted ? (
          <>
            <div className={`text-6xl font-black text-center mb-8 ${timerRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
              {timerRemaining}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {players.filter(p => p.status !== 'ELIMINATED').map((player) => (
                <button
                  key={player.playerId}
                  onClick={() => setSelectedPlayer(player.playerId)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedPlayer === player.playerId
                      ? 'bg-purple-500/30 border-purple-500/80'
                      : 'bg-white/8 border-purple-500/30 hover:border-purple-500/60'
                  }`}
                >
                  <div className="text-2xl font-bold text-purple-400">{player.playerNumber}</div>
                  <div className="text-white text-lg">{player.nickname}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmitVote}
              disabled={!selectedPlayer}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认投票
            </button>
          </>
        ) : (
          <div className="text-gray-400 text-center py-12">
            等待投票开始...
          </div>
        )}
      </div>
    </div>
  );
}

export default VoteInterface;
