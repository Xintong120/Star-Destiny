import { ElNotification } from 'element-plus';
import type { IFunctionalAstrolabe } from '../astro/FunctionalAstrolabe';

// This type needs to be aligned with what is passed from the component.
// It should cover major stars, minor stars, and adjective stars.
// The most generic definition is used here.
type Star = IFunctionalAstrolabe['palaces'][number]['majorStars'][number];

// 星耀名称到英文标识符的映射
const starNameToKey: Record<string, string> = {
  '紫微': 'ziweiMaj',
  '天机': 'tianjiMaj',
  '太阳': 'taiyangMaj',
  '武曲': 'wuquMaj',
  '天同': 'tiantongMaj',
  '廉贞': 'lianzhenMaj',
  '天府': 'tianfuMaj',
  '太阴': 'taiyinMaj',
  '贪狼': 'tanlangMaj',
  '巨门': 'jumenMaj',
  '天相': 'tianxiangMaj',
  '天梁': 'tianliangMaj',
  '七杀': 'qishaMaj',
  '破军': 'pojunMaj',
  '文昌': 'wenchangMin',
  '文曲': 'wenquMin',
  '左辅': 'zuofuMin',
  '右弼': 'youbiMin',
  '天魁': 'tiankuiMin',
  '天钺': 'tianyueMin',
  '禄存': 'lucunMin',
  '天马': 'tianmaMin',
  '擎羊': 'qingyangMin',
  '陀罗': 'tuoluoMin',
  '火星': 'huoxingMin',
  '铃星': 'lingxingMin',
  '地空': 'dikongMin',
  '地劫': 'dijieMin',
  '天空': 'tiankong',
  '天劫': 'tianjie',
  '龙池': 'longchi',
  '凤阁': 'fengge',
  '红鸾': 'hongluan',
  '天喜': 'tianxi',
  '天姚': 'tianyao',
  '天刑': 'tianxing',
  '天巫': 'tianwu',
  '天月': 'tianyue',
  '阴煞': 'yinsha',
  '解神': 'jieshen',
  '天德': 'tiande',
  '月德': 'yuede',
  '天厨': 'tianchu',
  '天福': 'tianfu',
  '天官': 'tianguan',
  '天寿': 'tianshou',
  '天贵': 'tiangui',
  '天虚': 'tianxu',
  '天哭': 'tianku',
  '天伤': 'tianshang'
};

/**
 * Shows a notification with detailed information about a star.
 * @param star The star object, which must contain a `name`.
 */
export const showStarNotification = async (star: Star) => {
  // Diagnostic log to inspect the received star object
  console.log('Star object received:', star);

  if (!star || !star.name) {
    console.error('Invalid star object:', star);
    ElNotification({
      title: '错误',
      message: '无效的星耀对象',
      position: 'top-left',
      type: 'error',
    });
    return;
  }

  // 如果没有 key，尝试从 name 生成一个
  let starKey = star.key;
  if (!starKey) {
    console.log('Star key is missing, generating from name:', star.name);
    // 首先尝试从映射表中获取
    starKey = starNameToKey[star.name];
    if (!starKey) {
      // 如果映射表中没有，则使用原来的方法
      starKey = star.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!starKey) {
        console.error('Failed to generate star key from name:', star.name);
        ElNotification({
          title: '错误',
          message: '无法生成星耀标识符',
          position: 'top-left',
          type: 'error',
        });
        return;
      }
    }
  }
  console.log('Using star key:', starKey);

  try {
    // Diagnostic log
    console.log(`Execution path: Trying to import with key: ${starKey}`);
    const module = await import(`../data/star-info/${starKey}.json`);
    const starDetails = module.default || module;
    // Diagnostic log
    console.log('Loaded JSON data:', starDetails);

    // Helper function to recursively build HTML from the star details object.
    const buildHtml = (data, level = 3) => {
      let html = '';
      if (!data) {
        return '';
      }

      if (typeof data === 'string') {
        // Replace markdown-style bold with <strong> tags
        return `<p>${data.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      }

      if (Array.isArray(data)) {
        html += '<ul>';
        for (const item of data) {
          html += `<li>${buildHtml(item, level)}</li>`;
        }
        html += '</ul>';
        return html;
      }

      if (typeof data === 'object' && data !== null) {
        if (data.title) {
          html += `<h${level}>${data.title}</h${level}>`;
        }
        
        const content = data.content || data.points;
        if (content) {
          html += buildHtml(content, level + 1);
        } else {
          // If no specific content/points, iterate through all keys
          for (const key in data) {
            if (key !== 'title') {
              html += buildHtml(data[key], level + 1);
            }
          }
        }
      }
      return html;
    };

    let messageHTML = '';
    // Build HTML by iterating over top-level keys of the JSON data
    for (const key in starDetails) {
      if (key !== 'name' && key !== 'nameCn') {
        messageHTML += buildHtml(starDetails[key], 3); // Start with <h3>
      }
    }

    // Fallback if no details were found at all
    if (!messageHTML.trim()) {
      messageHTML = '暂无该星耀的详细信息。';
    }

    ElNotification({
      title: starDetails.nameCn || starDetails.name || star.name,
      dangerouslyUseHTMLString: true,
      message: `<div>${messageHTML}</div>`,
      position: 'top-left',
      duration: 0, // A duration of 0 means the notification will not close automatically
    });
  } catch (e) {
    console.error('Error loading star info:', e);
    ElNotification({
      title: star.name,
      message: '暂无该星耀的详细信息。',
      position: 'top-left',
      type: 'error',
    });
  }
}; 