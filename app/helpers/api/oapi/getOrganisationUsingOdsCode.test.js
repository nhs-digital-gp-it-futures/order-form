import { getData } from 'buying-catalogue-library';
import { getOrganisationUsingOdsCode } from './getOrganisationUsingOdsCode';
import { organisationApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getOrganisationUsingOdsCode', () => {
  afterEach(() => {
    getData.mockReset();
  });

  const accessToken = 'access_token';
  const odsCode = '123';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({ orgId: 'org-1' });

    await getOrganisationUsingOdsCode({ odsCode, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${organisationApiUrl}/api/v1/ods/${odsCode}`,
      accessToken,
      logger,
    });
  });
});
