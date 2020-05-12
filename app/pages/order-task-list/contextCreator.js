import neworderPageManifest from './neworder/manifest.json';
import taskListManifest from './taskListManifest.json';
import { generateTaskList } from './helpers/generateTaskList';
import { baseUrl } from '../../config';


export const getContext = ({ pageName }) => ({
  ...neworderPageManifest,
  taskList: generateTaskList({ orderId: pageName, taskListManifest }),
  backLinkHref: `${baseUrl}/organisation`,
  pageName,
});
