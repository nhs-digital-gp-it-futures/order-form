import { getOrderItemContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('../select/recipient/controller', () => ({
  getSolution: () => ({ name: 'solution-name' }),
  getRecipients: () => ([
    {
      name: 'Some service recipient 1',
      odsCode: 'fake-recipient-id',
    },
  ]),
}));

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getOrderItemContext({
        orderId: 'order-1',
        selectedSolutionId: 'solution-1',
        selectedRecipientId: 'fake-recipient-id',
        accessToken: 'token',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        odsCode: 'fake-recipient-id',
        serviceRecipientName: 'Some service recipient 1',
        solutionName: 'solution-name',
      });
    });
  });
});
