import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../config';
import * as errorContext from '../getSectionErrorContext';

jest.mock('../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

const mockOrderingPartyData = {
  name: 'Hampshire CC',
  odsCode: 'AB3',
  address: {
    line1: 'line 1',
    line2: 'line 2',
    line3: 'line 3',
    line4: null,
    line5: 'line 5',
    town: 'townville',
    county: 'countyshire',
    postcode: 'HA3 PSH',
    country: 'UK',
  },
};

const questionData = {
  firstName: 'first name',
  lastName: 'lastName',
  telephoneNumber: '07777777777',
  emailAddress: 'email@address.com',
};

const orderId = 'order-id';
const odsCode = 'odsCode';

const mockValidationErrors = [{
  field: 'EmailAddress',
  id: 'EmailAddressRequired',
},
{
  field: 'TelephoneNumber',
  id: 'TelephoneNumberTooLong',
}];

describe('ordering-party contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.orgNameHeading).toEqual(manifest.orgNameHeading);
      expect(context.odsCodeHeading).toEqual(manifest.odsCodeHeading);
      expect(context.orgAddressHeading).toEqual(manifest.orgAddressHeading);
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });

    it('should add organisation data', () => {
      const context = getContext({ orgData: mockOrderingPartyData });
      expect(context.orgData.name).toEqual(mockOrderingPartyData.name);
      expect(context.orgData.odsCode).toEqual(mockOrderingPartyData.odsCode);
      expect(context.orgData.address).toEqual(mockOrderingPartyData.address);
    });

    it('should add contact data to questions if provided', () => {
      const context = getContext({
        orderId, orgData: { ...mockOrderingPartyData, primaryContact: questionData },
      });
      expect(context.questions.length).toEqual(manifest.questions.length);
      expect(context.questions[0].data).toEqual(questionData.firstName);
      expect(context.questions[1].data).toEqual(questionData.lastName);
      expect(context.questions[2].data).toEqual(questionData.emailAddress);
      expect(context.questions[3].data).toEqual(questionData.telephoneNumber);
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}`);
    });

    it('should construct title with orderId', () => {
      const context = getContext({ orderId });
      expect(context.title).toEqual('Call-off Ordering Party information for order-id');
    });
  });

  describe('getErrorContext', () => {
    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();

      const mockParams = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        orgData: mockOrderingPartyData,
        odsCode: 'odsCode',
      };

      const updatedManifest = {
        ...manifest,
        title: 'Call-off Ordering Party information for order-id',
        backLinkHref: '/order/organisation/odsCode/order/order-id',
      };

      getErrorContext(mockParams);

      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
      expect(errorContext.getSectionErrorContext).toHaveBeenCalledWith({
        ...mockParams, manifest: updatedManifest,
      });
    });
  });
});
