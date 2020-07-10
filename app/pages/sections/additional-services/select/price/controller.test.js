import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../../config';
import { logger } from '../../../../../logger';
import {
  findAdditionalServicePrices,
} from './controller';

jest.mock('buying-catalogue-library');

const accessToken = 'access_token';
const catalogueItemId = 'additional-service-1';

describe('findAdditionalServicePrices', () => {
  afterEach(() => {
    getData.mockReset();
  });

  it('should call getData once with the correct params', async () => {
    getData.mockResolvedValueOnce({ data: {} });

    await findAdditionalServicePrices({ accessToken, catalogueItemId });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/prices?catalogueItemId=${catalogueItemId}`,
      accessToken: 'access_token',
      logger,
    });
  });
});
