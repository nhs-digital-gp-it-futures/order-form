import manifest from './manifest.json';
import { getContext } from './contextCreator';

const solutionName = 'solution-name';
const serviceRecipientName = 'service-recipient-name';
const odsCode = 'ods-code';

describe('catalogue-solutions order-item contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ solutionName, serviceRecipientName, odsCode });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should return the title', () => {
      const context = getContext({ solutionName, serviceRecipientName, odsCode });
      expect(context.title).toEqual(`${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the delete button', () => {
      const context = getContext({});
      expect(context.deleteButtonText).toEqual(manifest.deleteButtonText);
    });

    it('should return the save button', () => {
      const context = getContext({});
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });
  });
});
