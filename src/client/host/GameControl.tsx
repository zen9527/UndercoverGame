function GameControl() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        🎮 游戏控制
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:translate-y-[-3px] transition-all">
          开始游戏
        </button>
        <button className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:translate-y-[-3px] transition-all">
          暂停
        </button>
        <button className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:translate-y-[-3px] transition-all">
          结束游戏
        </button>
        <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:translate-y-[-3px] transition-all">
          设置
        </button>
      </div>
    </div>
  );
}

export default GameControl;
