import commonManifest from './commonManifest.json';
import flatOndemandManifest from './flat/ondemand/manifest.json';
import { getContext, getErrorContext } from './contextCreator';

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

      it('should populate the quantity with data provided', () => {
        const expectedContext = {
          questions: {
            quantity: {
              ...flatOndemandManifest.questions.quantity,
              data: 'some quantity data',
            },
          },
        };

        const formData = {
          quantity: 'some quantity data',
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest, formData,
        });
        expect(context.questions.quantity).toEqual(expectedContext.questions.quantity);
      });

      it('should return the selected estimation period as checked', () => {
        const expectedContext = {
          questions: {
            selectEstimationPeriod: {
              ...flatOndemandManifest.questions.selectEstimationPeriod,
              options: [
                {
                  value: 'perMonth',
                  text: 'Per month',
                  checked: true,
                },
                {
                  value: 'perYear',
                  text: 'Per year',
                },
              ],
            },
          },
        };

        const formData = {
          selectEstimationPeriod: 'perMonth',
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest, formData,
        });
        expect(context.questions.selectEstimationPeriod)
          .toEqual(expectedContext.questions.selectEstimationPeriod);
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

        const formData = { price: 0.1 };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest, selectedPrice, formData,
        });

        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });
  });

  describe('getErrorContext', () => {
    describe('flat - ondemand', () => {
      it('should return error for plannedDeliveryDate', () => {
        const expectedContext = {
          errors: [
            { href: '#plannedDeliveryDate', text: flatOndemandManifest.errorMessages.PlannedDeliveryDateRequired },
          ],
          questions: {
            ...flatOndemandManifest.questions,
            plannedDeliveryDate: {
              ...flatOndemandManifest.questions.plannedDeliveryDate,
              error: {
                message: flatOndemandManifest.errorMessages.PlannedDeliveryDateRequired,
                fields: ['day', 'month', 'year'],
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOndemandManifest,
          validationErrors: [{
            field: 'PlannedDeliveryDate',
            id: 'PlannedDeliveryDateRequired',
            part: ['day', 'month', 'year'],
          }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return error for quantity', () => {
        const expectedContext = {
          errors: [
            { href: '#quantity', text: flatOndemandManifest.errorMessages.QuantityRequired },
          ],
          questions: {
            ...flatOndemandManifest.questions,
            quantity: {
              ...flatOndemandManifest.questions.quantity,
              error: {
                message: flatOndemandManifest.errorMessages.QuantityRequired,
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOndemandManifest,
          validationErrors: [{ field: 'Quantity', id: 'QuantityRequired' }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return error for estimation period', () => {
        const expectedContext = {
          errors: [
            { href: '#selectEstimationPeriod', text: flatOndemandManifest.errorMessages.EstimationPeriodRequired },
          ],
          questions: {
            ...flatOndemandManifest.questions,
            selectEstimationPeriod: {
              ...flatOndemandManifest.questions.selectEstimationPeriod,
              error: {
                message: flatOndemandManifest.errorMessages.EstimationPeriodRequired,
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOndemandManifest,
          validationErrors: [{ field: 'SelectEstimationPeriod', id: 'EstimationPeriodRequired' }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return error for price', () => {
        const expectedContext = {
          errors: [
            { href: '#price', text: flatOndemandManifest.errorMessages.PriceRequired },
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
                      message: flatOndemandManifest.errorMessages.PriceRequired,
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
          validationErrors: [{ field: 'Price', id: 'PriceRequired' }],
          selectedPrice,
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });
  });
});
