import { getProxyOrganisations } from '../api/oapi/getProxyOrganisations';
import { getIsUserProxy } from './getIsUserProxy';

jest.mock('../api/oapi/getProxyOrganisations');

describe('getIsUserProxy', () => {
  beforeEach(() => {
    getProxyOrganisations.mockResolvedValueOnce(['', '']);
  });

  it('should be true if user has proxy organisations', async () => {
    const userIsProxy = await getIsUserProxy(['abc', 'def']);
    expect(userIsProxy).toEqual(true);
  });

  it('should be false if access_token is not supplied', async () => {
    const userIsProxy = await getIsUserProxy();
    expect(userIsProxy).toEqual(false);
  });
});
