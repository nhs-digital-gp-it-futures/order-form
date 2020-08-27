import {
  getServiceRecipientsContext,
  validateSolutionRecipientsForm,
  getServiceRecipientsErrorPageContext,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('../../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
  getErrorContext: jest.fn(),
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

  describe('validateSolutionRecipientsForm', () => {
    describe('when there are no validation errors', () => {
      it('should return success as true', () => {
        const data = {
          _csrf: 'nbU52r5S-xUzcID3fXzt3ZBiwIxgvQCF5K2o',
          B81032: 'WILBERFORCE SURGERY',
        };

        const response = validateSolutionRecipientsForm({ data });

        expect(response.success).toEqual(true);
      });
    });

    describe('when there are validation errors', () => {
      const expectedValidationErrors = [
        {
          field: 'selectSolutionRecipients',
          id: 'SelectSolutionRecipientsRequired',
        },
      ];

      it('should return an array of one validation error and success as false if only the csrf is passed in', () => {
        const data = {
          _csrf: 'nbU52r5S-xUzcID3fXzt3ZBiwIxgvQCF5K2o',
        };

        const response = validateSolutionRecipientsForm({ data });

        expect(response.success).toEqual(false);
        expect(response.errors).toEqual(expectedValidationErrors);
      });
    });
  });

  describe('getServiceRecipientsErrorPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls getErrorContext once with correct params', async () => {
      contextCreator.getErrorContext.mockResolvedValueOnce();

      await getServiceRecipientsErrorPageContext({
        orderId: 'order-id',
        itemName: 'Solution One',
        selectStatus: 'select',
        serviceRecipients: dataFromOapi,
        validationErrors: [],
      });

      expect(contextCreator.getErrorContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getErrorContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        itemName: 'Solution One',
        serviceRecipientsData: dataFromOapi,
        selectedRecipientIdsData: [],
        selectStatus: 'select',
        validationErrors: [],
      });
    });
  });
});
