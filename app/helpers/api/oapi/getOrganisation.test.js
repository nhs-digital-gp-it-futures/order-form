import { getData } from 'buying-catalogue-library';
import { getOrganisation } from './getOrganisation';
import { organisationApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getOrganisation', () => {
  afterEach(() => {
    getData.mockReset();
  });

  const accessToken = 'access_token';
  const orgId = 'org-1';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({ orgId: 'org-1' });

    await getOrganisation({ orgId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${organisationApiUrl}/api/v1/Organisations/${orgId}`,
      accessToken,
      logger,
    });
  });
});
