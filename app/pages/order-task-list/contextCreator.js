import neworderPageManifest from './neworder/manifest.json';
import existingorderPageManifest from './existingorder/manifest.json';
import taskListManifest from './taskListManifest.json';
import { generateTaskList } from './helpers/generateTaskList';
import { baseUrl } from '../../config';

export const getContext = ({ orderId, orderDescription }) => orderId === 'neworder' ? getNewOrderContext({ orderId }) : getExistingOrderContext({ orderId, orderDescription });

export const getNewOrderContext = ({ orderId }) => ({
  ...neworderPageManifest,
  taskList: generateTaskList({ orderId, taskListManifest }),
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
});

export const getExistingOrderContext = ({ orderId, orderDescription }) => ({
  ...existingorderPageManifest,
  title: `${existingorderPageManifest.title} ${orderId}`,
  orderDescription: orderDescription,
  taskList: generateTaskList({ orderId, taskListManifest }),
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
});
