import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { addParamsToManifest } from '../../../../../../helpers/contextCreators/addParamsToManifest';

export const getContext = ({ orderId, solutionName }) => {
  const context = ({
    ...addParamsToManifest(manifest, { orderId, solutionName })
  });
  return context;
};