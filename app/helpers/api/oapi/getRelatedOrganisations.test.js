import { getData } from 'buying-catalogue-library';
import { getRelatedOrganisations } from './getRelatedOrganisations';
import { organisationApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getRelatedOrganisations', () => {
  afterEach(() => {
    getData.mockReset();
  });

  const accessToken = 'access_token';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce(
      { organisationId: 'org one' },
      { organisationId: 'org two' },
    );

    await getRelatedOrganisations({ accessToken, orgId: 'abc' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${organisationApiUrl}/api/v1/Organisations/abc/related-organisations`,
      accessToken,
      logger,
    });
  });
});
