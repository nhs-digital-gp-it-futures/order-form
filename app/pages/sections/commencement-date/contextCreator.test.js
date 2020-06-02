import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../config';

const orderId = 'order-id';

const validationErrors = [{
  id: 'CommencementDateDayRequired',
  part: ['day'],
}];

const data = {
  'commencementDate-day': '13',
  'commencementDate-month': '01',
  'commencementDate-year': '2020',
};

describe('commencement-date contextCreator', () => {
  describe('getContext', () => {
    describe('without data', () => {
      it('should return the contents of manifest', () => {
        const context = getContext({});
        expect(context.backLinkText).toEqual(manifest.backLinkText);
        expect(context.description).toEqual(manifest.description);
        expect(context.saveButtonText).toEqual(manifest.saveButtonText);
        expect(context.questions.length).toEqual(1);
        expect(context.questions[0].id).toEqual('commencementDate');
        expect(context.questions[0].mainAdvice).toEqual('Commencement date');
        expect(context.questions[0].additionalAdvice).toEqual('For example 14 01 2020');
      });
    });

    describe('with data', () => {
      it('should return the contents of manifest', () => {
        const context = getContext({ data: '2020-01-13' });
        expect(context.backLinkText).toEqual(manifest.backLinkText);
        expect(context.description).toEqual(manifest.description);
        expect(context.saveButtonText).toEqual(manifest.saveButtonText);
        expect(context.questions.length).toEqual(1);
        expect(context.questions[0].id).toEqual('commencementDate');
        expect(context.questions[0].mainAdvice).toEqual('Commencement date');
        expect(context.questions[0].additionalAdvice).toEqual('For example 14 01 2020');
      });

      it('should add data to the question', () => {
        const context = getContext({ data: '2020-01-13' });
        expect(context.questions[0].data).toBeTruthy();
        expect(context.questions[0].data.day).toEqual('13');
        expect(context.questions[0].data.month).toEqual('01');
        expect(context.questions[0].data.year).toEqual('2020');
      });
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should construct title with orderId', () => {
      const context = getContext({ orderId });
      expect(context.title).toEqual('Commencement date for order-id');
    });
  });

  describe('getErrorContext', () => {
    it('should return the contents of manifest', () => {
      const context = getErrorContext({ validationErrors, orderId, data });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
      expect(context.questions.length).toEqual(1);
      expect(context.questions[0].id).toEqual('commencementDate');
      expect(context.questions[0].mainAdvice).toEqual('Commencement date');
      expect(context.questions[0].additionalAdvice).toEqual('For example 14 01 2020');
    });

    it('should add data to the question', () => {
      const context = getErrorContext({ validationErrors, orderId, data });
      expect(context.questions[0].data).toBeTruthy();
      expect(context.questions[0].data.day).toEqual('13');
      expect(context.questions[0].data.month).toEqual('01');
      expect(context.questions[0].data.year).toEqual('2020');
    });

    it('should add error to the question', () => {
      const context = getErrorContext({ validationErrors, orderId, data });
      expect(context.questions[0].error).toBeTruthy();
      expect(context.questions[0].error.message).toEqual('Commencement date must include a day');
      expect(context.questions[0].error.fields).toEqual(['day']);
    });

    it('should add day month and year to error part array to the question if not given', () => {
      const validationErrorsNoPart = [{
        id: 'CommencementDateDayRequired',
      }];
      const context = getErrorContext({ validationErrors: validationErrorsNoPart, orderId, data });
      expect(context.questions[0].error).toBeTruthy();
      expect(context.questions[0].error.message).toEqual('Commencement date must include a day');
      expect(context.questions[0].error.fields).toEqual(['day', 'month', 'year']);
    });

    it('should add errors array to the context', () => {
      const context = getErrorContext({ validationErrors, orderId, data });
      expect(context.errors.length > 0).toBeTruthy();
      expect(context.errors[0].text).toEqual('Commencement date must include a day');
      expect(context.errors[0].href).toEqual('#commencementDate');
    });

    it('should construct the backLinkHref', () => {
      const context = getErrorContext({ validationErrors, orderId, data });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should construct title with orderId', () => {
      const context = getErrorContext({ validationErrors, orderId, data });
      expect(context.title).toEqual('Commencement date for order-id');
    });
  });
});
