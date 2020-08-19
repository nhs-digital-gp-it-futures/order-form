import { putData } from 'buying-catalogue-library';
import { putServiceRecipients } from './putServiceRecipients';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

const mockData = {
  _csrf: 'testCSRF',
  XX1: 'Some service recipient 1',
  XX2: 'Some service recipient 2',
};

const formattedMockData = {
  serviceRecipients: [
    { name: 'Some service recipient 1', odsCode: 'XX1' },
    { name: 'Some service recipient 2', odsCode: 'XX2' },
  ],
};

describe('putServiceRecipients', () => {
  beforeEach(() => {
    putData.mockReset();
  });

  it('should call putData once with the correct params', async () => {
    putData
      .mockResolvedValueOnce({});

    await putServiceRecipients({
      orderId: 'order-id', data: mockData, accessToken: 'access_token',
    });
    expect(putData.mock.calls.length).toEqual(1);
    expect(putData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/service-recipients`,
      body: formattedMockData,
      accessToken: 'access_token',
      logger,
    });
  });

  it('should return success as true if data is saved successfully', async () => {
    putData
      .mockResolvedValueOnce({});
    const response = await putServiceRecipients({
      orderId: 'order-id', data: mockData, accessToken: 'access_token',
    });
    expect(response.success).toEqual(true);
    expect(response.errors).toEqual(undefined);
  });
});
