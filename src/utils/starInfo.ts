import { ElNotification } from 'element-plus';
import type { IFunctionalAstrolabe } from '../astro/FunctionalAstrolabe';

// This type needs to be aligned with what is passed from the component.
// It should cover major stars, minor stars, and adjective stars.
// The most generic definition is used here.
type Star = IFunctionalAstrolabe['palaces'][number]['majorStars'][number];

/**
 * Shows a notification with detailed information about a star.
 * @param star The star object, which must contain a `key` and a `name`.
 */
export const showStarNotification = async (star: Star) => {
  if (!star.key) {
    ElNotification({
      title: star.name,
      message: '暂无该星耀的详细信息。',
      position: 'top-left',
    });
    return;
  }

  try {
    const module = await import(`../data/star-info/${star.key}.json`);
    const starDetails = module.default || module;

    const messageHTML = `
      <div>
        <p><strong>基本描述:</strong> ${starDetails.description}</p>
        <p><strong>诗曰:</strong> ${starDetails.poem}</p>
        <p><strong>性格:</strong> ${starDetails.meaning.personality}</p>
        <p><strong>事业:</strong> ${starDetails.meaning.career}</p>
        <p><strong>财富:</strong> ${starDetails.meaning.wealth}</p>
      </div>
    `;

    ElNotification({
      title: starDetails.name,
      dangerouslyUseHTMLString: true,
      message: messageHTML,
      position: 'top-left',
      duration: 0, // A duration of 0 means the notification will not close automatically
    });
  } catch (e) {
    console.error(e);
    ElNotification({
      title: star.name,
      message: '无法加载星耀信息。',
      position: 'top-left',
      type: 'error',
    });
  }
}; 