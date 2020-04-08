import { getData } from '../../../apiProvider';
import { status } from '../status';

export const getReadyStatus = async () => {
  let identityApi;
  try {
    identityApi = await getData({ endpointLocator: 'getIdentityApiHealth' });
  } catch (e) {
    identityApi = status.unhealthy.message;
  }

  const isHealthy = healthcheckResponse => healthcheckResponse === status.healthy.message;
  const isUnhealthy = healthcheckResponse => healthcheckResponse === status.unhealthy.message;

  if (isHealthy(identityApi)) {
    return status.healthy;
  }

  if (isUnhealthy(identityApi)) {
    return status.unhealthy;
  }

  return status.degraded;
};
