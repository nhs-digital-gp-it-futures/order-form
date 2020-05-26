import { putCommencementDate } from './controller';

import * as dateValidator from './getDateErrors';

jest.mock('./getDateErrors', () => ({
  getDateErrors: jest.fn(),
}));


const mockData = {
  'commencementDate-day': '1',
  'commencementDate-month': '12',
  'commencementDate-year': '2020',
};

const mockDataError = {
  field: 'CommencementDate',
  part: ['day'],
  id: 'CommencementDateDayRequired',
};

describe('commencement-date controller', () => {
  describe('putCommencementDate', () => {
    afterEach(() => {
      dateValidator.getDateErrors.mockReset();
    });

    it('should call getDateErrors with the correct params', () => {
      putCommencementDate({ data: mockData });

      expect(dateValidator.getDateErrors.mock.calls.length).toEqual(1);
      expect(dateValidator.getDateErrors).toHaveBeenCalledWith(mockData);
    });

    it('should return success as false and errors if found', async () => {
      dateValidator.getDateErrors
        .mockReturnValue(mockDataError);
      const response = await putCommencementDate({ data: mockData });
      expect(response.success).toEqual(false);
      expect(response.errors.length).toEqual(1);
      expect(response.errors[0]).toEqual(mockDataError);
    });

    it('should return success as true if errors not found', async () => {
      dateValidator.getDateErrors
        .mockReturnValue(null);
      const response = await putCommencementDate({ data: mockData });
      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});
