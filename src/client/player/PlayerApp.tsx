import { useState } from 'react';
import JoinRoom from './JoinRoom';
import ViewWord from './ViewWord';
import SpeakingTimer from './SpeakingTimer';
import VoteInterface from './VoteInterface';

function PlayerApp() {
  const [joined, setJoined] = useState(false);
  const [wordViewed, setWordViewed] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_gamePhase, _setGamePhase] = useState<'WORD' | 'SPEAKING' | 'VOTING' | 'RESULT'>('WORD');

  if (!joined) {
    return <JoinRoom onJoined={() => setJoined(true)} />;
  }

  if (!wordViewed) {
    return <ViewWord onViewed={() => setWordViewed(true)} />;
  }

  switch (_gamePhase) {
    case 'SPEAKING':
      return <SpeakingTimer />;
    case 'VOTING':
      return <VoteInterface />;
    case 'RESULT':
      return <div className="text-white text-center py-20">等待结果公布...</div>;
    default:
      return <div className="text-white text-center py-20">等待游戏开始...</div>;
  }
}

export default PlayerApp;
