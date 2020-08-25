import { getServiceRecipientsContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('../../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const dataFromOapi = [{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}];

describe('service-recipients controller', () => {
  describe('getServiceRecipientsContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls getContext once with correct params', async () => {
      contextCreator.getContext.mockResolvedValueOnce();

      await getServiceRecipientsContext({
        orderId: 'order-id',
        itemName: 'Solution One',
        selectStatus: 'select',
        serviceRecipients: dataFromOapi,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        itemName: 'Solution One',
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: [],
        selectStatus: 'select',
      });
    });
  });
});
