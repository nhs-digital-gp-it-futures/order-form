import neworderPageManifest from './neworder/manifest.json';
import taskListManifest from './taskListManifest.json';
import { baseUrl } from '../../config';

export const getContext = ({ pageName }) => ({
  ...neworderPageManifest,
  taskList: taskListManifest.taskList,
  backLinkHref: `${baseUrl}/organisation`,
  pageName,
});
