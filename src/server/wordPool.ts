import { WordTheme } from '@shared/types';

export const wordPairs: Record<WordTheme, Array<[string, string]>> = {
  FOOD: [
    ['咖啡', '奶茶'],
    ['面包', '蛋糕'],
    ['苹果', '梨'],
    ['米饭', '面条'],
    ['可乐', '雪碧'],
    ['巧克力', '糖果'],
    ['火锅', '烧烤'],
    ['饺子', '包子'],
  ],
  ANIMAL: [
    ['猫', '狗'],
    ['狮子', '老虎'],
    ['企鹅', '海鸥'],
    ['兔子', '松鼠'],
    ['熊猫', '考拉'],
    ['海豚', '鲸鱼'],
  ],
  OCCUPATION: [
    ['医生', '护士'],
    ['老师', '教授'],
    ['警察', '保安'],
    ['程序员', '设计师'],
    ['厨师', '服务员'],
    ['律师', '法官'],
  ],
  LOCATION: [
    ['图书馆', '书店'],
    ['公园', '花园'],
    ['电影院', '剧院'],
    ['超市', '商场'],
    ['酒店', '民宿'],
    ['机场', '车站'],
  ],
  LIFE: [
    ['手机', '平板'],
    ['电脑', '笔记本'],
    ['手表', '手环'],
    ['眼镜', '墨镜'],
    ['雨伞', '阳伞'],
    ['背包', '手提包'],
  ],
  ENTERTAINMENT: [
    ['电影', '电视剧'],
    ['唱歌', '跳舞'],
    ['篮球', '足球'],
    ['游戏', '动漫'],
    ['音乐', '舞蹈'],
    ['漫画', '小说'],
  ],
  RANDOM: [], // 混合所有主题
};

export function getRandomWordPair(theme: WordTheme): [string, string] {
  if (theme === 'RANDOM') {
    const themes: WordTheme[] = ['FOOD', 'ANIMAL', 'OCCUPATION', 'LOCATION', 'LIFE', 'ENTERTAINMENT'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const pairs = wordPairs[randomTheme];
    return pairs[Math.floor(Math.random() * pairs.length)];
  }
  
  const pairs = wordPairs[theme];
  return pairs[Math.floor(Math.random() * pairs.length)];
}
