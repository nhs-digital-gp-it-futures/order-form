import { getData } from 'buying-catalogue-library';
import { getServiceRecipients } from './getServiceRecipients';
import { organisationApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getServiceRecipients', () => {
  afterEach(() => {
    getData.mockReset();
  });

  const accessToken = 'access_token';
  const orgId = 'org-1';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({ orgId: 'org-1' });

    await getServiceRecipients({ orgId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${organisationApiUrl}/api/v1/Organisations/${orgId}/service-recipients`,
      accessToken,
      logger,
    });
  });
});
