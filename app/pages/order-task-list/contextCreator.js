import neworderPageManifest from './neworder/manifest.json';
import taskListManifest from './taskListManifest.json';
import { generateTaskList } from './helpers/generateTaskList';
import { baseUrl } from '../../config';


// new folder existingorder with a manifest

export const getContext = ({ orderId }) => ({
  // if orderId === neworder
  ...neworderPageManifest,
  // else get existingorder
  taskList: generateTaskList({ orderId, taskListManifest }),
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
});
