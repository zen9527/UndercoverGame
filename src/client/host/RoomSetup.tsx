import { useState } from 'react';

interface RoomSetupProps {
  onRoomCreated: () => void;
}

function RoomSetup({ onRoomCreated }: RoomSetupProps) {
  const [config, setConfig] = useState({
    playerCount: 8,
    spyCount: 1,
    wordTheme: 'RANDOM',
    voteTimeout: 45,
    speakTimeout: 30,
  });
  
  const handleCreateRoom = () => {
    // TODO: Connect to WebSocket and create room
    onRoomCreated();
  };
  
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        🎮 创建游戏房间
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            玩家人数
          </label>
          <select
            value={config.playerCount}
            onChange={(e) => setConfig({ ...config, playerCount: Number(e.target.value) })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          >
            {[4, 6, 8, 10, 12].map(n => (
              <option key={n} value={n}>{n}人</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            卧底人数
          </label>
          <select
            value={config.spyCount}
            onChange={(e) => setConfig({ ...config, spyCount: Number(e.target.value) })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          >
            {[1, 2].map(n => (
              <option key={n} value={n}>{n}人</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            词语主题
          </label>
          <select
            value={config.wordTheme}
            onChange={(e) => setConfig({ ...config, wordTheme: e.target.value })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          >
            <option value="RANDOM">随机混合</option>
            <option value="FOOD">美食饮品</option>
            <option value="ANIMAL">动物世界</option>
            <option value="OCCUPATION">职业工作</option>
            <option value="LOCATION">地点场所</option>
            <option value="LIFE">生活用品</option>
            <option value="ENTERTAINMENT">影视娱乐</option>
          </select>
        </div>
        
        <div className="bg-white/8 p-5 rounded-xl border border-white/10">
          <label className="text-sm text-gray-400 uppercase tracking-wider block mb-3">
            投票倒计时 (秒)
          </label>
          <input
            type="number"
            value={config.voteTimeout}
            onChange={(e) => setConfig({ ...config, voteTimeout: Number(e.target.value) })}
            className="w-full bg-black/30 border-2 border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg focus:border-purple-500/80 outline-none"
          />
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <button
          onClick={handleCreateRoom}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-10 py-4 rounded-xl text-xl font-bold uppercase tracking-wider hover:translate-y-[-3px] transition-all hover:shadow-lg hover:shadow-purple-500/50"
        >
          创建房间
        </button>
      </div>
    </div>
  );
}

export default RoomSetup;
