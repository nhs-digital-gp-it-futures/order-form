import manifest from './manifest.json';
import { baseUrl } from '../../../config';

const addDataToManifest = (commencementDate) => {
  if (commencementDate) {
    const [year, month, day] = commencementDate.split('-');
    return {
      ...manifest,
      questions: [{
        ...manifest.questions[0],
        data: { day, month, year },
      }],
    };
  }
  return manifest;
};

export const getContext = ({ orderId, data }) => ({
  ...addDataToManifest(data),
  title: `${manifest.title} ${orderId}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
