import { useState, useEffect, useRef, useCallback } from 'react';
import { wsClient } from '../shared/WebSocketClient';
import { Player } from '@shared/types';

interface VoteInterfaceProps {
  myPlayerId: string;
}

function VoteInterface({ myPlayerId }: VoteInterfaceProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(45);
  const [votingStarted, setVotingStarted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedRef.current = selectedPlayer;
  }, [selectedPlayer]);

  useEffect(() => {
    const unsub1 = wsClient.on('playerListUpdated', (data: any) => {
      setPlayers(data.players);
    });

    const unsub2 = wsClient.on('startVoting', (data: any) => {
      setVotingStarted(true);
      setHasVoted(false);
      setTimerRemaining(data.timeout || 45);

      // Start local countdown (server is the source of truth, this is for display)
      if (intervalRef.current) clearInterval(intervalRef.current);
      let localRemaining = data.timeout || 45;
      intervalRef.current = setInterval(() => {
        localRemaining--;
        if (localRemaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimerRemaining(0);
          // Auto-submit if not voted
          if (!hasVoted) {
            doVote(selectedRef.current);
          }
        } else {
          setTimerRemaining(localRemaining);
        }
      }, 1000);
    });

    return () => {
      unsub1();
      unsub2();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasVoted]);

  const doVote = useCallback((targetId: string | null) => {
    if (targetId && !hasVoted) {
      wsClient.send('vote', { roomId: wsClient.getRoomId(), targetPlayerId: targetId });
      setHasVoted(true);
    }
  }, [hasVoted]);

  const handleSubmitVote = () => {
    doVote(selectedPlayer);
  };

  const handleSelectPlayer = (playerId: string) => {
    if (hasVoted) return;
    setSelectedPlayer(playerId);
  };

  // Filter out self and eliminated players
  const votablePlayers = players.filter(p => p.playerId !== myPlayerId && p.status !== 'ELIMINATED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">🗳️ 投票环节</h2>

        {hasVoted && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 text-green-300 text-center">
            已投票，等待其他玩家...
          </div>
        )}

        {votingStarted ? (
          <>
            <div className={`text-6xl font-black text-center mb-8 ${timerRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
              {timerRemaining}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {votablePlayers.map((player) => (
                <button
                  key={player.playerId}
                  onClick={() => handleSelectPlayer(player.playerId)}
                  disabled={hasVoted}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedPlayer === player.playerId
                      ? 'bg-purple-500/30 border-purple-500/80'
                      : 'bg-white/8 border-purple-500/30 hover:border-purple-500/60'
                  } ${hasVoted ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="text-2xl font-bold text-purple-400">{player.playerNumber}</div>
                  <div className="text-white text-lg">{player.nickname}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmitVote}
              disabled={!selectedPlayer || hasVoted}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasVoted ? '已投票' : '确认投票'}
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
