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
    ['牛肉', '羊肉'],
    ['西瓜', '哈密瓜'],
    ['冰淇淋', '雪糕'],
    ['油条', '煎饼'],
    ['馒头', '花卷'],
    ['寿司', '刺身'],
    ['披萨', '汉堡'],
    ['薯条', '薯片'],
    ['酸奶', '牛奶'],
    ['柠檬', '青柠'],
    ['葡萄', '提子'],
    ['桃子', '李子'],
  ],
  ANIMAL: [
    ['猫', '狗'],
    ['狮子', '老虎'],
    ['企鹅', '海鸥'],
    ['兔子', '松鼠'],
    ['熊猫', '考拉'],
    ['海豚', '鲸鱼'],
    ['大象', '长颈鹿'],
    ['狐狸', '狼'],
    ['猴子', '猩猩'],
    ['孔雀', '鹦鹉'],
    ['金鱼', '鲤鱼'],
    ['蝴蝶', '蜜蜂'],
    ['蚂蚁', '蟑螂'],
    ['蜘蛛', '蝎子'],
    ['鳄鱼', '蜥蜴'],
    ['袋鼠', '树袋熊'],
    ['斑马', '驴'],
    ['骆驼', '羊驼'],
    ['公鸡', '母鸡'],
    ['鸭子', '鹅'],
  ],
  OCCUPATION: [
    ['医生', '护士'],
    ['老师', '教授'],
    ['警察', '保安'],
    ['程序员', '设计师'],
    ['厨师', '服务员'],
    ['律师', '法官'],
    ['记者', '编辑'],
    ['歌手', '演员'],
    ['画家', '雕塑家'],
    ['建筑师', '工程师'],
    ['会计', '审计师'],
    ['经理', '主管'],
    ['销售员', '客服'],
    ['快递员', '外卖员'],
    ['司机', '飞行员'],
    ['船员', '潜水员'],
    ['消防员', '救援员'],
    ['科学家', '研究员'],
    ['作家', '诗人'],
    ['导游', '翻译'],
  ],
  LOCATION: [
    ['图书馆', '书店'],
    ['公园', '花园'],
    ['电影院', '剧院'],
    ['超市', '商场'],
    ['酒店', '民宿'],
    ['机场', '车站'],
    ['医院', '诊所'],
    ['学校', '幼儿园'],
    ['办公室', '会议室'],
    ['餐厅', '咖啡馆'],
    ['健身房', '游泳池'],
    ['博物馆', '美术馆'],
    ['动物园', '植物园'],
    ['海滩', '海岛'],
    ['山峰', '峡谷'],
    ['河流', '湖泊'],
    ['森林', '草原'],
    ['沙漠', '绿洲'],
    ['教堂', '寺庙'],
    ['广场', '步行街'],
  ],
  LIFE: [
    ['手机', '平板'],
    ['电脑', '笔记本'],
    ['手表', '手环'],
    ['眼镜', '墨镜'],
    ['雨伞', '阳伞'],
    ['背包', '手提包'],
    ['钱包', '卡包'],
    ['钥匙', '门锁'],
    ['台灯', '落地灯'],
    ['空调', '风扇'],
    ['冰箱', '冰柜'],
    ['洗衣机', '烘干机'],
    ['电视', '投影仪'],
    ['音箱', '耳机'],
    ['相机', '摄像机'],
    ['鼠标', '键盘'],
    ['充电器', '充电宝'],
    ['水杯', '保温杯'],
    ['毛巾', '浴巾'],
    ['枕头', '被子'],
  ],
  ENTERTAINMENT: [
    ['电影', '电视剧'],
    ['唱歌', '跳舞'],
    ['篮球', '足球'],
    ['游戏', '动漫'],
    ['音乐', '舞蹈'],
    ['漫画', '小说'],
    ['扑克', '麻将'],
    ['象棋', '围棋'],
    ['台球', '乒乓球'],
    ['羽毛球', '网球'],
    ['跑步', '游泳'],
    ['登山', '徒步'],
    ['摄影', '绘画'],
    ['烹饪', '烘焙'],
    [' gardening', '种植'],
    ['旅行', '露营'],
    ['阅读', '写作'],
    ['收藏', '鉴赏'],
    ['直播', '短视频'],
    ['播客', '电台'],
  ],
  RANDOM: [], // 混合所有主题
};

// Additional word pairs for even more variety
interface WordPairWithTheme {
  words: [string, string];
  theme: WordTheme;
}

const additionalWords: WordPairWithTheme[] = [
  { words: ['草莓', '樱桃'], theme: 'FOOD' },
  { words: ['芒果', '菠萝'], theme: 'FOOD' },
  { words: ['海带', '紫菜'], theme: 'FOOD' },
  { words: ['豆腐', '豆干'], theme: 'FOOD' },
  { words: ['腊肉', '火腿'], theme: 'FOOD' },
  
  { words: ['乌龟', '壁虎'], theme: 'ANIMAL' },
  { words: ['青蛙', '蟾蜍'], theme: 'ANIMAL' },
  { words: ['蛇', '蚯蚓'], theme: 'ANIMAL' },
  { words: ['老鹰', '秃鹫'], theme: 'ANIMAL' },
  { words: ['鲨鱼', '鲈鱼'], theme: 'ANIMAL' },
  
  { words: ['理发师', '美容师'], theme: 'OCCUPATION' },
  { words: ['摄影师', '摄像师'], theme: 'OCCUPATION' },
  { words: ['营养师', '健身教练'], theme: 'OCCUPATION' },
  { words: ['社工', '志愿者'], theme: 'OCCUPATION' },
  { words: ['牧师', '神父'], theme: 'OCCUPATION' },
  
  { words: ['网吧', '电竞馆'], theme: 'LOCATION' },
  { words: ['KTV', '酒吧'], theme: 'LOCATION' },
  { words: ['夜市', '集市'], theme: 'LOCATION' },
  { words: ['码头', '港口'], theme: 'LOCATION' },
  { words: ['仓库', '工厂'], theme: 'LOCATION' },
  
  { words: ['拖鞋', '凉鞋'], theme: 'LIFE' },
  { words: ['围巾', '手套'], theme: 'LIFE' },
  { words: ['帽子', '头盔'], theme: 'LIFE' },
  { words: ['镜子', '放大镜'], theme: 'LIFE' },
  { words: ['剪刀', '钳子'], theme: 'LIFE' },
  
  { words: ['桌游', '卡牌'], theme: 'ENTERTAINMENT' },
  { words: ['剧本杀', '密室逃脱'], theme: 'ENTERTAINMENT' },
  { words: ['演唱会', '音乐节'], theme: 'ENTERTAINMENT' },
  { words: ['展览', '展销会'], theme: 'ENTERTAINMENT' },
  { words: ['晚会', '庆典'], theme: 'ENTERTAINMENT' },
];

export function getRandomWordPair(theme: WordTheme): [string, string] {
  if (theme === 'RANDOM') {
    // Combine all themes except RANDOM
    const allPairs = Object.entries(wordPairs)
      .filter(([key]) => key !== 'RANDOM')
      .flatMap(([, pairs]) => pairs);
    
    // Add additional words
    additionalWords.forEach(({ words }) => {
      allPairs.push(words);
    });
    
    const randomIndex = Math.floor(Math.random() * allPairs.length);
    return allPairs[randomIndex];
  }
  
  const pairs = wordPairs[theme];
  if (!pairs || pairs.length === 0) {
    // Fallback to RANDOM if theme has no words
    return getRandomWordPair('RANDOM');
  }
  
  const randomIndex = Math.floor(Math.random() * pairs.length);
  return pairs[randomIndex];
}

// Get total word count for display
export function getTotalWordCount(): number {
  let count = 0;
  Object.entries(wordPairs).forEach(([key, pairs]) => {
    if (key !== 'RANDOM') {
      count += pairs.length;
    }
  });
  count += additionalWords.length;
  return count;
}

// Get all themes with word counts
export function getThemeStats(): Record<WordTheme, number> {
  const stats: Record<WordTheme, number> = {
    RANDOM: 0,
    FOOD: wordPairs.FOOD.length + additionalWords.filter(w => w.theme === 'FOOD').length,
    ANIMAL: wordPairs.ANIMAL.length + additionalWords.filter(w => w.theme === 'ANIMAL').length,
    OCCUPATION: wordPairs.OCCUPATION.length + additionalWords.filter(w => w.theme === 'OCCUPATION').length,
    LOCATION: wordPairs.LOCATION.length + additionalWords.filter(w => w.theme === 'LOCATION').length,
    LIFE: wordPairs.LIFE.length + additionalWords.filter(w => w.theme === 'LIFE').length,
    ENTERTAINMENT: wordPairs.ENTERTAINMENT.length + additionalWords.filter(w => w.theme === 'ENTERTAINMENT').length,
  };
  return stats;
}
