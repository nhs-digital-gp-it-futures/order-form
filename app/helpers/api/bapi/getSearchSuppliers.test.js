import { getData } from 'buying-catalogue-library';
import { getSearchSuppliers } from './getSearchSuppliers';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getSearchSuppliers', () => {
  afterEach(() => {
    getData.mockReset();
  });

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: [] });

    await getSearchSuppliers({ name: 'some-supp', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=some-supp&solutionPublicationStatus=Published`,
      accessToken: 'access_token',
      logger,
    });
  });

  it('should encode search term in the url', async () => {
    getData
      .mockResolvedValueOnce({ data: [] });

    await getSearchSuppliers({ name: '&', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=%26&solutionPublicationStatus=Published`,
      accessToken: 'access_token',
      logger,
    });
  });

  it('should encode the endpoint called to find suppliers', async () => {
    getData
      .mockResolvedValueOnce({ data: [] });

    await getSearchSuppliers({ name: '%', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=%25&solutionPublicationStatus=Published`,
      accessToken: 'access_token',
      logger,
    });
  });
});