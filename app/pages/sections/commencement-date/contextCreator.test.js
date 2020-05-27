import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

const orderId = 'order-id';

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
        expect(context.questions[0].additionalAdvice).toEqual('For example 14 1 2020');
      });
    });

    describe('with data', () => {
      it('should return the contents of manifest', () => {
        const context = getContext({ data: '2020-1-13' });
        expect(context.backLinkText).toEqual(manifest.backLinkText);
        expect(context.description).toEqual(manifest.description);
        expect(context.saveButtonText).toEqual(manifest.saveButtonText);
        expect(context.questions.length).toEqual(1);
        expect(context.questions[0].id).toEqual('commencementDate');
        expect(context.questions[0].mainAdvice).toEqual('Commencement date');
        expect(context.questions[0].additionalAdvice).toEqual('For example 14 1 2020');
      });

      it('should add data to the question', () => {
        const context = getContext({ data: '2020-1-13' });
        expect(context.questions[0].data).toBeTruthy();
        expect(context.questions[0].data.day).toEqual('13');
        expect(context.questions[0].data.month).toEqual('1');
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
});
