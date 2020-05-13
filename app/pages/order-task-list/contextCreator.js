import neworderPageManifest from './neworder/manifest.json';
import existingorderPageManifest from './existingorder/manifest.json';
import taskListManifest from './taskListManifest.json';
import { generateTaskList } from './helpers/generateTaskList';
import { baseUrl } from '../../config';

export const getNewOrderContext = ({ orderId }) => ({
  ...neworderPageManifest,
  taskList: generateTaskList({ orderId, taskListManifest }),
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
});

export const getExistingOrderContext = ({ orderId, orderDescription, sectionsData }) => ({
  ...existingorderPageManifest,
  title: `${existingorderPageManifest.title} ${orderId}`,
  orderDescription,
  taskList: generateTaskList({ orderId, taskListManifest, sectionsData }),
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
});

export const getContext = ({ orderId, orderDescription, sectionsData }) => {
  if (orderId === 'neworder') {
    return getNewOrderContext({ orderId });
  }
  return getExistingOrderContext({ orderId, orderDescription, sectionsData });
};
