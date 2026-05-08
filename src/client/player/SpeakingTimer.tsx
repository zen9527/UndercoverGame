import { useState, useEffect } from 'react';
import { wsClient } from '../shared/WebSocketClient';

interface SpeakingTimerProps {
  myPlayerId: string;
}

function SpeakingTimer({ myPlayerId }: SpeakingTimerProps) {
  const [currentSpeaker, setCurrentSpeaker] = useState<{
    playerId: string;
    playerNumber: number;
    nickname: string;
  } | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const isCurrentSpeaker = currentSpeaker?.playerId === myPlayerId;

  useEffect(() => {
    const unsub1 = wsClient.on('currentSpeaker', (data: any) => {
      setCurrentSpeaker(data);
      setTimerRunning(false);
      setTimerRemaining(0);
    });

    const unsub2 = wsClient.on('startTimer', (data: any) => {
      setTimerRemaining(data.duration);
      setTimerRunning(true);
    });

    const unsub3 = wsClient.on('timerUpdate', (data: any) => {
      setTimerRemaining(data.remaining);
    });

    const unsub4 = wsClient.on('timerEnded', () => {
      setTimerRunning(false);
      setTimerRemaining(0);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full text-center">
        {currentSpeaker ? (
          <>
            {/* Show who is speaking */}
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              {isCurrentSpeaker ? '轮到你了！' : '当前发言者'}
            </p>
            <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
              {currentSpeaker.playerNumber} 号
            </div>
            <p className="text-gray-300 text-lg mb-8">{currentSpeaker.nickname}</p>

            {isCurrentSpeaker && !timerRunning && (
              <>
                <p className="text-gray-400 mb-6">描述你的词语（不要直接说出词语）</p>
                <button
                  onClick={() => wsClient.send('startTimer', { roomId: wsClient.getRoomId(), duration: 30 })}
                  className="bg-gradient-to-r from-green-500 to-green-700 text-white px-10 py-4 rounded-xl text-xl font-bold"
                >
                  开始计时
                </button>
              </>
            )}

            {timerRunning && (
              <>
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-4">发言时间</p>
                <div className={`text-8xl font-black ${timerRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                  {timerRemaining}
                </div>
                <p className="text-gray-500 mt-4">秒</p>
              </>
            )}

            {!isCurrentSpeaker && !timerRunning && (
              <p className="text-gray-500">等待发言者开始...</p>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-400 text-lg mb-4">等待发言</p>
            <div className="text-6xl font-black text-purple-400 animate-pulse">👆</div>
          </>
        )}
      </div>
    </div>
  );
}

export default SpeakingTimer;
