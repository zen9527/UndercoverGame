import { useState, useEffect } from 'react';
import { wsClient } from '../shared/WebSocketClient';

function SpeakingTimer() {
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const unsubscribe1 = wsClient.on('currentSpeaker', (_data: any) => {
      setIsCurrentSpeaker(true);
    });

    const unsubscribe2 = wsClient.on('startTimer', (data: any) => {
      setTimerRemaining(data.duration);
      setTimerRunning(true);
    });

    const unsubscribe3 = wsClient.on('timerUpdate', (data: any) => {
      setTimerRemaining(data.remaining);
    });

    const unsubscribe4 = wsClient.on('timerEnded', () => {
      setTimerRunning(false);
      setIsCurrentSpeaker(false);
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, []);

  const handleStartTimer = () => {
    wsClient.send('startTimer', { duration: 30 });
  };

  if (!isCurrentSpeaker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
          <p className="text-gray-400 text-lg mb-4">等待发言</p>
          <div className="text-6xl font-black text-purple-400 animate-pulse">👆</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full text-center">
        {!timerRunning ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">轮到你了！</h2>
            <p className="text-gray-400 mb-8">描述你的词语（不要直接说出词语）</p>
            <button
              onClick={handleStartTimer}
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-10 py-4 rounded-xl text-xl font-bold"
            >
              开始计时
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-4">发言时间</p>
            <div className={`text-8xl font-black ${timerRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
              {timerRemaining}
            </div>
            <p className="text-gray-500 mt-4">秒</p>
          </>
        )}
      </div>
    </div>
  );
}

export default SpeakingTimer;
