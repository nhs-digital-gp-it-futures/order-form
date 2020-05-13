import manifest from './manifest.json';
import { baseUrl } from '../../../config';

export const getContext = ({ orderId, description }) => {
  const context = ({
    ...manifest,
    backlinkHref: `${baseUrl}/organisation/${orderId}`,
  });
  context.descriptionQuestion.question.data = description;
  return context;
};
