import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../config';

const odsCode = 'odsCode';
const orderId = 'order-id';

describe('commencement-date contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId });

      expect(context.title).toEqual(`${manifest.title} ${orderId}`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the questions', () => {
      const context = getContext({});
      expect(context.questions).toEqual(manifest.questions);
    });

    it('should populate the commencement data with data provided', () => {
      const expectedContext = {
        questions: {
          commencementDate: {
            ...manifest.questions.commencementDate,
            data: {
              day: '09',
              month: '02',
              year: '2021',
            },
          },
        },
      };

      const formData = {
        'commencementDate-day': '09',
        'commencementDate-month': '02',
        'commencementDate-year': '2021',
      };

      const context = getContext({ orderId: 'order-1', data: formData });
      expect(context.questions.deliveryDate)
        .toEqual(expectedContext.questions.deliveryDate);
    });

    it('should return the save button', () => {
      const context = getContext({});
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });
  });

  describe('getErrorContext', () => {
    it('should return error for commencementDate', () => {
      const expectedContext = {
        errors: [
          { href: '#commencementDate', text: manifest.errorMessages.CommencementDateRequired },
        ],
        questions: {
          ...manifest.questions,
          commencementDate: {
            ...manifest.questions.commencementDate,
            error: {
              message: manifest.errorMessages.CommencementDateRequired,
              fields: ['day', 'month', 'year'],
            },
          },
        },
      };

      const context = getErrorContext({
        manifest,
        validationErrors: [{
          field: 'CommencementDate',
          id: 'CommencementDateRequired',
          part: ['day', 'month', 'year'],
        }],
      });

      expect(context.errors).toEqual(expectedContext.errors);
      expect(context.questions).toEqual(expectedContext.questions);
    });
  });
});
