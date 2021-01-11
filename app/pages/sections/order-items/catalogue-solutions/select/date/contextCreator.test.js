import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';

const orderId = 'order-id';
const itemName = 'Solution One';
const data = { 'deliveryDate-day': '10', 'deliveryDate-month': '10', 'deliveryDate-year': '2020' };

describe('delivery-date contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.organisationHeading).toEqual(manifest.organisationHeading);
      expect(context.odsCodeHeading).toEqual(manifest.odsCodeHeading);
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });

    it('should construct the title', () => {
      const context = getContext({ orderId, itemName });
      expect(context.title).toEqual('Planned delivery date of Solution One for order-id');
    });

    it('should construct the backLinkHref when solutionPrices contain not 1', () => {
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients`);
    });

    it('should construct the description', () => {
      const context = getContext({ orderId, itemName });
      expect(context.description).toEqual('The date entered will be applied to all the organisations you’ll be ordering for. We’ve included the commencement date for this Call-off Agreement, but if your planned delivery date is different, you can change it here.');
    });

    it('should populate the delivery date with the commencement date passed in', () => {
      const context = getContext({ orderId, data });

      const { deliveryDate } = context.questions;
      expect(deliveryDate.id).toEqual('deliveryDate');
      expect(deliveryDate.type).toEqual('date');
      expect(deliveryDate.mainAdvice).toEqual('Planned delivery date');
      expect(deliveryDate.additionalAdvice).toEqual('For example 14 01 2020');
      expect(deliveryDate.expandableSection.dataTestId).toEqual('view-section-planned-delivery-date-id');
      expect(deliveryDate.expandableSection.title).toEqual('What date should I enter?');
      expect(deliveryDate.expandableSection.innerComponent).toEqual('Enter the planned delivery date you\'ve agreed with the supplier. This is the day that each of the listed Service Recipients will start using this Catalogue Solution.<br><br>We\'ve included the commencement date for this Call-off Agreement, but you can change it if you’ve agreed a different delivery date.');
      expect(deliveryDate.data).toEqual({ day: '10', month: '10', year: '2020' });
    });
  });

  describe('getErrorContext', () => {
    it('should return error for deliveryDate', () => {
      const expectedContext = {
        errors: [
          { href: '#deliveryDate', text: manifest.errorMessages.DeliveryDateRequired },
        ],
        questions: {
          ...manifest.questions,
          deliveryDate: {
            ...manifest.questions.deliveryDate,
            error: {
              message: manifest.errorMessages.DeliveryDateRequired,
              fields: ['day', 'month', 'year'],
            },
          },
        },
      };

      const context = getErrorContext({
        manifest,
        validationErrors: [{
          field: 'DeliveryDate',
          id: 'DeliveryDateRequired',
          part: ['day', 'month', 'year'],
        }],
      });

      expect(context.errors).toEqual(expectedContext.errors);
      expect(context.questions).toEqual(expectedContext.questions);
    });
  });
});
