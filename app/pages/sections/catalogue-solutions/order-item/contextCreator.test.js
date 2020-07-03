import commonManifest from './commonManifest.json';
import flatOndemandManifest from './flat/ondemand/manifest.json';
import { getContext, getErrorContext, generateErrorMessageMap } from './contextCreator';

describe('catalogue-solutions order-item contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the title', () => {
      const solutionName = 'solution-name';
      const serviceRecipientName = 'service-recipient-name';
      const odsCode = 'ods-code';

      const context = getContext({
        commonManifest, solutionName, serviceRecipientName, odsCode,
      });
      expect(context.title).toEqual(`${solutionName} ${commonManifest.title} ${serviceRecipientName} (${odsCode})`);
    });

    it('should return the description', () => {
      const context = getContext({ commonManifest });
      expect(context.description).toEqual(commonManifest.description);
    });

    it('should return the delete button', () => {
      const context = getContext({ commonManifest });
      expect(context.deleteButtonText).toEqual(commonManifest.deleteButtonText);
    });

    it('should return the save button', () => {
      const context = getContext({ commonManifest });
      expect(context.saveButtonText).toEqual(commonManifest.saveButtonText);
    });

    describe('flat - ondemand', () => {
      it('should return the questions', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest,
        });
        expect(context.questions).toEqual(flatOndemandManifest.questions);
      });

      it('should return the addPriceTable colummInfo', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest,
        });

        expect(context.addPriceTable.columnInfo)
          .toEqual(flatOndemandManifest.addPriceTable.columnInfo);
      });

      it('should return the addPriceTable with items and the price input and unit of order populated', () => {
        const expectedContext = {
          addPriceTable: {
            ...flatOndemandManifest.addPriceTable,
            items: [
              [
                {
                  ...flatOndemandManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatOndemandManifest.addPriceTable.cellInfo.price.question,
                    data: 0.1,
                  },
                },
                {
                  ...flatOndemandManifest.addPriceTable.cellInfo.unitOfOrder,
                  data: 'per consultation',
                },
              ],
            ],
          },
        };

        const selectedPrice = {
          price: 0.1,
          itemUnit: { description: 'per consultation' },
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest, selectedPrice,
        });

        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });
  });

  describe('getErrorContext', () => {
    describe('flat - ondemand', () => {
      it('should return error for quantity', () => {
        const expectedContext = {
          errors: [
            { href: '#quantity', text: flatOndemandManifest.errorMessages.quantityRequired },
          ],
          questions: {
            ...flatOndemandManifest.questions,
            quantity: {
              ...flatOndemandManifest.questions.quantity,
              error: {
                message: flatOndemandManifest.errorMessages.quantityRequired,
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOndemandManifest,
          validationErrors: [{ field: 'quantity', id: 'quantityRequired' }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return error for estimation period', () => {
        const expectedContext = {
          errors: [
            { href: '#selectEstimationPeriod', text: flatOndemandManifest.errorMessages.estimationPeriodRequired },
          ],
          questions: {
            ...flatOndemandManifest.questions,
            selectEstimationPeriod: {
              ...flatOndemandManifest.questions.selectEstimationPeriod,
              error: {
                message: flatOndemandManifest.errorMessages.estimationPeriodRequired,
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOndemandManifest,
          validationErrors: [{ field: 'selectEstimationPeriod', id: 'estimationPeriodRequired' }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return error for price', () => {
        const expectedContext = {
          errors: [
            { href: '#price', text: flatOndemandManifest.errorMessages.priceRequired },
          ],
          addPriceTable: {
            ...flatOndemandManifest.addPriceTable,
            items: [
              [
                {
                  ...flatOndemandManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatOndemandManifest.addPriceTable.cellInfo.price.question,
                    error: {
                      message: flatOndemandManifest.errorMessages.priceRequired,
                    },
                  },
                },
                {
                  ...flatOndemandManifest.addPriceTable.cellInfo.unitOfOrder,
                  data: 'per consultation',
                },
              ],
            ],
          },
        };

        const selectedPrice = {
          itemUnit: { description: 'per consultation' },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOndemandManifest,
          validationErrors: [{ field: 'price', id: 'priceRequired' }],
          selectedPrice,
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });
  });
});
