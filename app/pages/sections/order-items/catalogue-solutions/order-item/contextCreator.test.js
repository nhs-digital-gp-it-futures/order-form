import commonManifest from './commonManifest.json';
import flatPatientManifest from './flat/patient/manifest.json';
import { getContext, getErrorContext } from './contextCreator';

describe('catalogue-solutions order-item contextCreator', () => {
  const selectedPrice = {
    itemUnit: { description: 'per patient' },
    timeUnit: { description: 'per year' },
  };
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref to catalogue solutions when order item id is not neworderitem', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkHref).toEqual('/order/organisation/undefined/catalogue-solutions');
    });

    it('should return the backLinkHref to recipient when order item id is neworderitem', () => {
      const context = getContext({
        commonManifest,
        orderItemId: 'neworderitem',
      });
      expect(context.backLinkHref).toEqual('/order/organisation/undefined/catalogue-solutions/select/solution/price/recipients/date');
    });

    it('should return the title', () => {
      const solutionName = 'solution-name';
      const orderId = 'order-id';

      const context = getContext({
        commonManifest, solutionName, orderId,
      });
      expect(context.title).toEqual(`${solutionName} ${commonManifest.title} ${orderId}`);
    });

    it('should return the description', () => {
      const context = getContext({ commonManifest });
      expect(context.description).toEqual(commonManifest.description);
    });

    it('should return the delete button disabled when neworderitem', () => {
      const context = getContext({ commonManifest, orderItemId: 'neworderitem' });
      expect(context.deleteButton.text).toEqual(commonManifest.deleteButton.text);
      expect(context.deleteButton.disabled).toEqual(true);
      expect(context.deleteButton.altText).toEqual('The Delete Catalogue Solution button will be disabled until you save for the first time');
    });

    it('should return the delete button when not neworderitem', () => {
      const context = getContext({ commonManifest, orderItemId: 'notneworderitem' });
      expect(context.deleteButton.text).toEqual(commonManifest.deleteButton.text);
      expect(context.deleteButton.disabled).toEqual(false);
    });

    it('should return the edit button disabled when neworderitem', () => {
      const context = getContext({ commonManifest, orderItemId: 'neworderitem' });
      expect(context.editButton.text).toEqual(commonManifest.editButton.text);
      expect(context.editButton.disabled).toEqual(true);
      expect(context.editButton.altText).toEqual('The Edit Service Recipients button will be disabled until you save for the first time');
    });

    it('should return the edit button when not neworderitem', () => {
      const context = getContext({ commonManifest, orderItemId: 'notneworderitem' });
      expect(context.editButton.text).toEqual(commonManifest.editButton.text);
      expect(context.editButton.disabled).toEqual(false);
    });

    it('should return the save button', () => {
      const context = getContext({ commonManifest });
      expect(context.saveButtonText).toEqual(commonManifest.saveButtonText);
    });

    describe('flat - patient', () => {
      const recipients = [{ name: 'test', odsCode: 'testCode' }, { name: 'test-2', odsCode: 'notIncluded' }];
      const selectedRecipients = ['testCode'];

      it('should populate the price question with data provided', () => {
        const expectedContext = {
          questions: {
            price: {
              ...flatPatientManifest.questions.price,
              data: 1.25,
              error: undefined,
            },
          },
        };

        const formData = { price: 1.25, deliveryDate: [''] };

        const context = getContext({
          commonManifest,
          selectedPriceManifest: flatPatientManifest,
          formData,
          recipients,
          selectedRecipients,
          selectedPrice,
        });
        expect(context.questions.price)
          .toEqual(expectedContext.questions.price);
      });

      it('should return the solutionTable colummInfo', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatPatientManifest, recipients, selectedRecipients, selectedPrice, formData: { quantity: '', deliveryDate: [''] },
        });

        expect(context.solutionTable.columnInfo)
          .toEqual(flatPatientManifest.solutionTable.columnInfo);
      });

      it('should return the solutionTable with the solution data populated, practice size input and date input populated', () => {
        const expectedContext = {
          solutionTable: {
            ...flatPatientManifest.solutionTable,
            items: [
              [
                {
                  ...flatPatientManifest.solutionTable.cellInfo.recipient,
                  data: 'test (testCode)',
                  dataTestId: 'test-testCode-recipient',
                },
                {
                  ...flatPatientManifest.solutionTable.cellInfo.quantity,
                  question: {
                    ...flatPatientManifest.solutionTable.cellInfo.quantity.question,
                    data: 100,
                    dataTestId: 'test-testCode-quantity',
                    error: undefined,
                  },
                },
                {
                  ...flatPatientManifest.solutionTable.cellInfo.deliveryDate,
                  question: {
                    ...flatPatientManifest.solutionTable.cellInfo.deliveryDate.question,
                    data: {
                      day: 9,
                      month: 2,
                      year: 2021,
                    },
                    dataTestId: 'test-testCode-deliveryDate',
                    error: undefined,
                  },
                },
              ],
            ],
          },
        };

        const formData = {
          price: 0.11,
          quantity: [100],
          deliveryDate: [{
            'deliveryDate-day': 9,
            'deliveryDate-month': 2,
            'deliveryDate-year': 2021,
          }],
        };

        const context = getContext({
          commonManifest,
          selectedPriceManifest: flatPatientManifest,
          formData,
          recipients,
          selectedRecipients,
          selectedPrice,
        });

        expect(context.solutionTable).toEqual(expectedContext.solutionTable);
      });

      it('should only add a recipient to the table if it has been selected', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatPatientManifest, recipients, selectedRecipients, selectedPrice, formData: { quantity: '', deliveryDate: [''] },
        });

        expect(context.solutionTable.items.length)
          .toEqual(1);
      });
    });
  });

  describe('getErrorContext', () => {
    it('should return the context with Errors for price', () => {
      const expectedContext = {
        errors: [
          {
            href: '#price',
            text: flatPatientManifest.errorMessages.PriceRequired,
          },
        ],
        questions: {
          price: {
            error: { message: flatPatientManifest.errorMessages.PriceRequired },
          },
        },
      };

      const context = getErrorContext({
        commonManifest,
        selectedPriceManifest: flatPatientManifest,
        orderId: 'order-id',
        orderItemId: 'order-item-id',
        solutionName: 'solution-name',
        recipients: [{ name: 'test', odsCode: 'testCode' }, { name: 'test-2', odsCode: 'notIncluded' }],
        selectedRecipients: ['testCode'],
        selectedPrice,
        formData: { price: 1.25, deliveryDate: [''] },
        validationErrors: [{
          field: 'Price',
          id: 'PriceRequired',
        }],
      });

      expect(context.errors).toEqual(expectedContext.errors);
      expect(context.questions.price.error.message)
        .toEqual(expectedContext.questions.price.error.message);
    });

    it('should return the context with Errors for practice size', () => {
      const expectedContext = {
        errors: [
          {
            href: '#quantity',
            text: flatPatientManifest.errorMessages.QuantityRequired,
          },
        ],
        solutionTable: {
          errorMessages: [flatPatientManifest.errorMessages.QuantityRequired, undefined],
        },
      };

      const context = getErrorContext({
        commonManifest,
        selectedPriceManifest: flatPatientManifest,
        orderId: 'order-id',
        orderItemId: 'order-item-id',
        solutionName: 'solution-name',
        recipients: [{ name: 'test', odsCode: 'testCode' }, { name: 'test-2', odsCode: 'notIncluded' }],
        selectedRecipients: ['testCode'],
        selectedPrice,
        formData: { price: 1.25, deliveryDate: [''] },
        validationErrors: [{
          field: 'Quantity',
          id: 'QuantityRequired',
        }],
      });

      expect(context.errors).toEqual(expectedContext.errors);
      expect(context.solutionTable.errorMessages)
        .toEqual(expectedContext.solutionTable.errorMessages);
    });

    it('should return the context with Errors for delivery date', () => {
      const expectedContext = {
        errors: [
          {
            href: '#deliveryDate',
            text: flatPatientManifest.errorMessages.DeliveryDateRequired,
          },
        ],
        solutionTable: {
          errorMessages: ['', flatPatientManifest.errorMessages.DeliveryDateRequired],
        },
      };

      const context = getErrorContext({
        commonManifest,
        selectedPriceManifest: flatPatientManifest,
        orderId: 'order-id',
        orderItemId: 'order-item-id',
        solutionName: 'solution-name',
        recipients: [{ name: 'test', odsCode: 'testCode' }, { name: 'test-2', odsCode: 'notIncluded' }],
        selectedRecipients: ['testCode'],
        selectedPrice,
        formData: { price: 1.25, deliveryDate: [''] },
        validationErrors: [{
          field: 'DeliveryDate',
          id: 'DeliveryDateRequired',
        }],
      });

      expect(context.errors).toEqual(expectedContext.errors);
      expect(context.solutionTable.errorMessages)
        .toEqual(expectedContext.solutionTable.errorMessages);
    });
  });
});
