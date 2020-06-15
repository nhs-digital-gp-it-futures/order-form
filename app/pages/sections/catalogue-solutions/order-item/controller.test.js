import { getOrderItemContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../select/recipient/controller', () => ({
  getSolution: () => ({ name: 'solution-name' }),
}));

describe('catalogue-solutions order-item controller', () => {
  describe('getOrderItemContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getOrderItemContext({
        selectedSolutionId: 'order-1',
        selectedRecipientId: 'fake-recipient-id',
        recipients: [
          {
            name: 'Some service recipient 1',
            odsCode: 'fake-recipient-id',
          },
        ],
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
