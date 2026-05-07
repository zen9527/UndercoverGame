import { useEffect } from 'react';

interface ViewWordProps {
  onViewed: () => void;
}

function ViewWord({ onViewed }: ViewWordProps) {
  useEffect(() => {
    // Simulate word being shown after a delay
    const timer = setTimeout(() => {
      // Word is shown
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleView = () => {
    onViewed();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          📝 查看词语
        </h2>
        <p className="text-gray-400 mb-8">等待显示你的词语...</p>
        <button
          onClick={handleView}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-10 py-4 rounded-xl text-xl font-bold"
        >
          我已查看
        </button>
      </div>
    </div>
  );
}

export default ViewWord;
