import commonManifest from './commonManifest.json';
import flatDeclarativeManifest from './flat/declarative/manifest.json';
import flatOndemandManifest from './flat/ondemand/manifest.json';
import { backLinkHref, getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../config';

describe('associated-services order-item contextCreator', () => {
  describe('backLinkHref', () => {
    const orderId = 'order-id';
    const mockAssociatedServicePrices = { prices: [{ priceId: 29 }, { priceId: 30 }] };
    const somefakeUrl = 'https://some.url.co.uk/order-id';
    it.each`
    senderUrl                               |  expectedUrl                           | associatedServicePrices
    ${`${somefakeUrl}/associated-service`}  | ${`${somefakeUrl}/associated-service`} | ${''}   
    ${`${somefakeUrl}/price`}               | ${`${somefakeUrl}/price`}              | ${''}  
    ${`${somefakeUrl}/associated-services`} | ${`${somefakeUrl}/associated-services`}| ${''}   
    ${`${somefakeUrl}/neworderitem`}        | ${`${baseUrl}/organisation/${orderId}/associated-services/select/associated-service/price`} |${mockAssociatedServicePrices}   

  `('backlinkHref should return expected url', ({ senderUrl, expectedUrl, associatedServicePrices }) => {
      const req = {
        headers: {
          referer: senderUrl,
        },
      };
      const actual = backLinkHref({ req, associatedServicePrices, orderId });
      expect(actual).toEqual(expectedUrl);
    });
  });

  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the title', () => {
      const itemName = 'item-name';
      const orderId = 'order-1';

      const context = getContext({
        commonManifest, orderId, itemName,
      });
      expect(context.title).toEqual(`${itemName} ${commonManifest.title} ${orderId}`);
    });

    it('should return the description', () => {
      const context = getContext({ commonManifest });
      expect(context.description).toEqual(commonManifest.description);
    });

    it('should return the delete button disabled when neworderitem', () => {
      const context = getContext({ commonManifest, catalogueItemId: 'neworderitem' });
      expect(context.deleteButton.text).toEqual(commonManifest.deleteButton.text);
      expect(context.deleteButton.disabled).toEqual(true);
    });

    it('should return the delete button when not neworderitem', () => {
      const context = getContext({ commonManifest, catalogueItemId: 'notneworderitem' });
      expect(context.deleteButton.text).toEqual(commonManifest.deleteButton.text);
      expect(context.deleteButton.disabled).toEqual(false);
    });

    it('should return the save button', () => {
      const context = getContext({ commonManifest });
      expect(context.saveButtonText).toEqual(commonManifest.saveButtonText);
    });

    describe('flat - declarative', () => {
      it('should return the questions', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatDeclarativeManifest,
        });
        expect(context.questions).toEqual(flatDeclarativeManifest.questions);
      });

      it('should populate the quantity with data provided', () => {
        const expectedContext = {
          questions: {
            quantity: {
              ...flatDeclarativeManifest.questions.quantity,
              data: 'some quantity data',
            },
          },
        };

        const formData = {
          quantity: 'some quantity data',
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatDeclarativeManifest, formData,
        });
        expect(context.questions.quantity).toEqual(expectedContext.questions.quantity);
      });

      it('should return the addPriceTable colummInfo', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatDeclarativeManifest,
        });

        expect(context.addPriceTable.columnInfo)
          .toEqual(flatDeclarativeManifest.addPriceTable.columnInfo);
      });

      it('should return the addPriceTable with items and the price input and unit of order populated', () => {
        const expectedContext = {
          addPriceTable: {
            ...flatDeclarativeManifest.addPriceTable,
            items: [
              [
                {
                  ...flatDeclarativeManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatDeclarativeManifest.addPriceTable.cellInfo.price.question,
                    data: '0.11',
                  },
                },
                {
                  ...flatDeclarativeManifest.addPriceTable.cellInfo.unitOfOrder,
                  data: 'per consultation ',
                },
              ],
            ],
          },
        };

        const selectedPrice = {
          price: 0.1,
          itemUnit: { description: 'per consultation' },
        };

        const formData = { price: 0.11 };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatDeclarativeManifest, selectedPrice, formData,
        });

        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });
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
                value: 'month',
                text: 'Per month',
                checked: true,
              },
              {
                value: 'year',
                text: 'Per year',
              },
            ],
          },
        },
      };

      const formData = {
        selectEstimationPeriod: 'month',
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
                  data: '0.11',
                },
              },
              {
                ...flatOndemandManifest.addPriceTable.cellInfo.unitOfOrder,
                data: 'per consultation ',
              },
            ],
          ],
        },
      };

      const selectedPrice = {
        price: 0.1,
        itemUnit: { description: 'per consultation' },
      };

      const formData = { price: 0.11 };

      const context = getContext({
        commonManifest, selectedPriceManifest: flatOndemandManifest, selectedPrice, formData,
      });

      expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
    });
  });

  describe('getErrorContext', () => {
    describe('flat - declarative', () => {
      it('should return error for quantity', () => {
        const expectedContext = {
          errors: [
            { href: '#quantity', text: flatDeclarativeManifest.errorMessages.QuantityRequired },
          ],
          questions: {
            ...flatDeclarativeManifest.questions,
            quantity: {
              ...flatDeclarativeManifest.questions.quantity,
              error: {
                message: flatDeclarativeManifest.errorMessages.QuantityRequired,
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatDeclarativeManifest,
          validationErrors: [{ field: 'Quantity', id: 'QuantityRequired' }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return error for price', () => {
        const expectedContext = {
          errors: [
            { href: '#price', text: flatDeclarativeManifest.errorMessages.PriceRequired },
          ],
          addPriceTable: {
            ...flatDeclarativeManifest.addPriceTable,
            items: [
              [
                {
                  ...flatDeclarativeManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatDeclarativeManifest.addPriceTable.cellInfo.price.question,
                    error: {
                      message: flatDeclarativeManifest.errorMessages.PriceRequired,
                    },
                  },
                },
                {
                  ...flatDeclarativeManifest.addPriceTable.cellInfo.unitOfOrder,
                  data: 'per consultation ',
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
          selectedPriceManifest: flatDeclarativeManifest,
          validationErrors: [{ field: 'Price', id: 'PriceRequired' }],
          selectedPrice,
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });

    describe('flat - ondemand', () => {
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
                  data: 'per consultation ',
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
