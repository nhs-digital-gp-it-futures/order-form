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
        name: 'Big Auto Additional Service',
      },
      {
        additionalServiceId: 'additional-service-1',
        name: 'That Additional Service',
      },
      {
        additionalServiceId: 'additional-service-1',
        name: 'Additional Service 1',
      },
      {
        additionalServiceId: 'additional-service-2',
        name: 'Additional Service 2',
      },
      {
        additionalServiceId: 'big-additional-service-1',
        name: 'Big Additional Service',
      },
    ];

    getData
      .mockResolvedValueOnce({ additionalServices });

    const addedCatalogueSolutions = [];
    const expected = await getAdditionalServices({ addedCatalogueSolutions, accessToken });
    expect(expected).toEqual(additionalServices);
    expect(expected[0].name).toEqual('Additional Service 1');
    expect(expected[1].name).toEqual('Additional Service 2');
    expect(expected[2].name).toEqual('Big Additional Service');
    expect(expected[3].name).toEqual('Big Auto Additional Service');
    expect(expected[4].name).toEqual('That Additional Service');
  });
});
