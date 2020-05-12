import neworderPageManifest from './neworder/manifest.json';
import taskListManifest from './taskListManifest.json';
import { generateTaskList } from './helpers/generateTaskList';
import { baseUrl } from '../../config';


export const getContext = ({ orderId }) => ({
  ...neworderPageManifest,
  taskList: generateTaskList({ orderId, taskListManifest }),
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
});
