import { getData } from 'buying-catalogue-library';
import { getSelectedPrice } from './getSelectedPrice';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getSelectedPrice', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: {} });

    await getSelectedPrice({ selectedPriceId: 'price-1', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/prices/price-1`,
      accessToken: 'access_token',
      logger,
    });
  });
});
