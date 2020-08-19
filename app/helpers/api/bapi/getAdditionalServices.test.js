import { getData } from 'buying-catalogue-library';
import { getAdditionalServices } from './getAdditionalServices';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getAdditionalServices', () => {
  afterEach(() => {
    getData.mockReset();
  });

  const accessToken = 'access_token';

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ additionalServices: [] });

    const addedCatalogueSolutions = ['1', '2', '3'];
    await getAdditionalServices({ addedCatalogueSolutions, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/additional-services?solutionIds=1&solutionIds=2&solutionIds=3`,
      accessToken,
      logger,
    });
  });

  it('should return empty list when getData returns undefined', async () => {
    getData
      .mockResolvedValueOnce({ additionalServices: undefined });

    const addedCatalogueSolutions = ['1', '2', '3'];
    const expected = await getAdditionalServices({ addedCatalogueSolutions, accessToken });
    expect(expected).toEqual([]);
  });

  it('should return expected list when addedCatalogueSolutions is an empty array', async () => {
    const additionalServices = [
      {
        additionalServiceId: 'additional-service-1',
        name: 'Additional Service 1',
      },
    ];

    getData
      .mockResolvedValueOnce({ additionalServices });

    const addedCatalogueSolutions = [];
    const expected = await getAdditionalServices({ addedCatalogueSolutions, accessToken });
    expect(expected).toEqual(additionalServices);
  });
});
