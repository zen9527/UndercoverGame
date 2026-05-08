import { useState, useEffect } from 'react';
import { wsClient } from '../shared/WebSocketClient';

interface ViewWordProps {
  onViewed: () => void;
}

function ViewWord({ onViewed }: ViewWordProps) {
  const [word, setWord] = useState<string>('');
  const [showWord, setShowWord] = useState(true);

  useEffect(() => {
    const unsubscribe = wsClient.on('wordAssigned', (data: any) => {
      setWord(data.word);
    });

    return unsubscribe;
  }, []);

  const handleConfirm = () => {
    setShowWord(false);
    wsClient.send('confirmWordViewed', { roomId: wsClient.getRoomId() });
    setTimeout(() => {
      onViewed();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-8">🔐 你的词语</h2>

        {!word ? (
          <div className="text-gray-400 text-lg animate-pulse mb-8">
            等待词语分配...
          </div>
        ) : showWord ? (
          <>
            <p className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-8">
              {word}
            </p>
            <button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-10 py-4 rounded-xl text-xl font-bold"
            >
              我已查看
            </button>
          </>
        ) : (
          <div className="text-gray-400 text-lg animate-pulse">
            词语已隐藏...
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewWord;
