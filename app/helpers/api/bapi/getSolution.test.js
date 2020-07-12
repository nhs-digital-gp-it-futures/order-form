import { getData } from 'buying-catalogue-library';
import { getSolution } from './getSolution';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getSolution', () => {
  afterEach(() => {
    getData.mockReset();
  });

  const accessToken = 'access_token';
  const solutionId = 'sol-1';

  it('should call getData with the correct params when hasSavedData is true', async () => {
    getData.mockResolvedValueOnce({ supplierId: 'supp-1' });

    await getSolution({ solutionId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/solutions/${solutionId}`,
      accessToken,
      logger,
    });
  });
});
