import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

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

describe('call-off-ordering-party contextCreator', () => {
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

    it('should add data', () => {
      const context = getContext({ data: mockOrderingPartyData });
      expect(context.name).toEqual(mockOrderingPartyData.name);
      expect(context.odsCode).toEqual(mockOrderingPartyData.odsCode);
      expect(context.address).toEqual(mockOrderingPartyData.address);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backlinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should construct title with orderId', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.title).toEqual('Call-off Ordering Party information for order-id');
    });
  });
});
