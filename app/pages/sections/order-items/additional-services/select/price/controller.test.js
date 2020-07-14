import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../../../config';
import { logger } from '../../../../../../logger';
import {
  findAdditionalServicePrices,
  validateAdditionalServicePriceForm,
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

describe('validateAdditionalServicePriceForm', () => {
  describe('when there are no validation errors', () => {
    it('should return success as true', () => {
      const data = {
        selectAdditionalServicePrice: 'some-additional-service-id',
      };

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.success).toEqual(true);
    });
  });

  describe('when there are validation errors', () => {
    const expectedValidationErrors = [
      {
        field: 'selectAdditionalServicePrice',
        id: 'SelectAdditionalServicePriceRequired',
      },
    ];

    it('should return an array of one validation error and success as false if empty string is passed in', () => {
      const data = {
        selectAdditionalServicePrice: '',
      };

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.success).toEqual(false);
      expect(response.errors).toEqual(expectedValidationErrors);
    });

    it('should return an array of one validation error and success as false if whitespace only is passed in', () => {
      const data = {
        selectAdditionalServicePrice: '   ',
      };

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.success).toEqual(false);
      expect(response.errors).toEqual(expectedValidationErrors);
    });

    it('should return a validation error if selectAdditionalServicePrice is undefined', () => {
      const data = {};

      const response = validateAdditionalServicePriceForm({ data });

      expect(response.errors).toEqual(expectedValidationErrors);
    });
  });
});
