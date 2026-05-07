function PlayerList() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        👥 玩家列表
        <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </h2>
      
      <div className="text-center text-gray-400 py-12">
        <p className="text-xl">等待玩家加入...</p>
        <p className="text-sm mt-2">房间 ID: 待生成</p>
      </div>
    </div>
  );
}

export default PlayerList;
