import { getData } from 'buying-catalogue-library';
import { getOrderSummary } from './getOrderSummary';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

xdescribe('getOrderSummary', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const accessToken = 'access_token';
  const orderId = 'order-id';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({});

    await getOrderSummary({ orderId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${orderApiUrl}/api/v1/orders/order-id/summary`,
      accessToken,
      logger,
    });
  });

  it('should return the expected orderSummaryData', async () => {
    getData.mockResolvedValueOnce({
      orderId: 'order-id',
      description: 'some-order-data',
      sections: [],
      sectionStatus: 'some status',
    });

    const orderData = await getOrderSummary({ orderId, accessToken });

    expect(orderData).toEqual({
      orderId: 'order-id',
      description: 'some-order-data',
      sections: [],
      enableSubmitButton: false,
    });
  });

  it('should return the enableSubmitButton property as true when API supplies a sectionStatus of complete', async () => {
    getData.mockResolvedValueOnce({
      description: 'some-order-data',
      sectionStatus: 'complete',
    });

    const orderData = await getOrderSummary({ orderId, accessToken });

    expect(orderData.enableSubmitButton).toEqual(true);
  });
});
