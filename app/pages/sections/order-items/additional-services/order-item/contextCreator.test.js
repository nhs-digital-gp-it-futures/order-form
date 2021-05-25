import commonManifest from './commonManifest.json';
import flatOnDemandManifest from './flat/ondemand/manifest.json';
import flatPatientManifest from './flat/patient/manifest.json';
import flatDeclarativeManifest from './flat/declarative/manifest.json';
import { getContext, getErrorContext } from './contextCreator';

describe('additional-services order-item contextCreator', () => {
  const selectedOnDemandPrice = {
    itemUnit: { description: 'per consultation – core hours' }, type: 'flat', provisioningType: 'ondemand',
  };

  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref to additional-services when order item id is not neworderitem', () => {
      const context = getContext({
        commonManifest,
        odsCode: 'odsCode',
        orderId: 'order-1',
      });
      expect(context.backLinkHref)
        .toEqual('/order/organisation/odsCode/order/order-1/additional-services');
    });

    it('should return the backLinkHref to recipients when order item id is neworderitem', () => {
      const context = getContext({
        commonManifest,
        odsCode: 'odsCode',
        orderId: 'order-1',
        catalogueItemId: 'neworderitem',
      });
      expect(context.backLinkHref)
        .toEqual('/order/organisation/odsCode/order/order-1/additional-services/select/additional-service/price/recipients');
    });

    it('should return the title', () => {
      const itemName = 'item-name';
      const serviceRecipientName = 'service-recipient-name';
      const odsCode = 'ods-code';

      const context = getContext({
        commonManifest, itemName, serviceRecipientName, odsCode,
      });
      expect(context.title).toEqual(`${itemName} ${commonManifest.title} ${serviceRecipientName} (${odsCode})`);
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

    describe('flat - ondemand', () => {
      const recipients = [{ name: 'test', odsCode: 'testCode' }, { name: 'test-2', odsCode: 'notIncluded' }];
      const selectedRecipients = ['testCode'];

      it('should populate the price question with data provided', () => {
        const expectedContext = {
          questions: {
            price: {
              ...flatOnDemandManifest.questions.price,
              data: '1.25',
              unit: undefined,
              error: undefined,
            },
          },
        };
        const formData = { price: 1.25, deliveryDate: [''] };

        const context = getContext({
          commonManifest,
          selectedPriceManifest: flatOnDemandManifest,
          formData,
          recipients,
          selectedRecipients,
          selectedPrice: selectedOnDemandPrice,
        });
        expect(context.questions.price)
          .toEqual(expectedContext.questions.price);
      });

      it('should populate the quantity with data provided', () => {
        const expectedContext = {
          questions: {
            quantity: {
              ...flatOnDemandManifest.questions.quantity,
              data: 'some quantity data',
            },
          },
        };

        const formData = {
          quantity: 'some quantity data',
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatOnDemandManifest, formData,
        });
        expect(context.questions.quantity).toEqual(expectedContext.questions.quantity);
      });

      it('should return the selected estimation period as checked', () => {
        const expectedContext = {
          questions: {
            selectEstimationPeriod: {
              ...flatOnDemandManifest.questions.selectEstimationPeriod,
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
          commonManifest, selectedPriceManifest: flatOnDemandManifest, formData,
        });
        expect(context.questions.selectEstimationPeriod)
          .toEqual(expectedContext.questions.selectEstimationPeriod);
      });

      it('should return the addPriceTable colummInfo', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatOnDemandManifest,
        });

        expect(context.addPriceTable.columnInfo)
          .toEqual(flatOnDemandManifest.addPriceTable.columnInfo);
      });

      it('should return the addPriceTable with items and the price input and unit of order populated', () => {
        const expectedContext = {
          addPriceTable: {
            ...flatOnDemandManifest.addPriceTable,
            items: [
              [
                {
                  ...flatOnDemandManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatOnDemandManifest.addPriceTable.cellInfo.price.question,
                    data: '0.11',
                  },
                },
                {
                  ...flatOnDemandManifest.addPriceTable.cellInfo.unitOfOrder,
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
          commonManifest, selectedPriceManifest: flatOnDemandManifest, selectedPrice, formData,
        });

        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });

    describe('flat - patient', () => {
      it('should return the questions', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatPatientManifest,
        });
        expect(context.questions).toEqual(flatPatientManifest.questions);
      });

      it('should populate the quantity with data provided', () => {
        const expectedContext = {
          questions: {
            quantity: {
              ...flatPatientManifest.questions.quantity,
              data: 'some quantity data',
            },
          },
        };

        const formData = {
          quantity: 'some quantity data',
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatPatientManifest, formData,
        });
        expect(context.questions.quantity).toEqual(expectedContext.questions.quantity);
      });

      it('should return the addPriceTable colummInfo', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatPatientManifest,
        });

        expect(context.addPriceTable.columnInfo)
          .toEqual(flatPatientManifest.addPriceTable.columnInfo);
      });

      it('should return the addPriceTable with items and the price input and unit of order populated', () => {
        const expectedContext = {
          addPriceTable: {
            ...flatPatientManifest.addPriceTable,
            items: [
              [
                {
                  ...flatPatientManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatPatientManifest.addPriceTable.cellInfo.price.question,
                    data: '0.11',
                  },
                },
                {
                  ...flatPatientManifest.addPriceTable.cellInfo.unitOfOrder,
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
          commonManifest, selectedPriceManifest: flatPatientManifest, selectedPrice, formData,
        });

        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });

    describe('flat - declarative', () => {
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

  describe('getErrorContext', () => {
    describe('flat - ondemand', () => {
      it('should return error for quantity', () => {
        const expectedContext = {
          errors: [
            {
              href: '#quantity',
              text: flatOnDemandManifest.errorMessages.QuantityRequired,
            },
          ],
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOnDemandManifest,
          orderId: 'order-id',
          orderItemId: 'order-item-id',
          solutionName: 'solution-name',
          validationErrors: [{
            field: 'Quantity',
            id: 'QuantityRequired',
          }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
      });

      it('should return error for estimation period', () => {
        const expectedContext = {
          errors: [
            { href: '#selectEstimationPeriod', text: flatOnDemandManifest.errorMessages.EstimationPeriodRequired },
          ],
          questions: {
            ...flatOnDemandManifest.questions,
            selectEstimationPeriod: {
              ...flatOnDemandManifest.questions.selectEstimationPeriod,
              error: {
                message: flatOnDemandManifest.errorMessages.EstimationPeriodRequired,
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatOnDemandManifest,
          validationErrors: [{ field: 'SelectEstimationPeriod', id: 'EstimationPeriodRequired' }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions.selectEstimationPeriod.error.message)
          .toEqual(expectedContext.questions.selectEstimationPeriod.error.message);
      });

      it('should return error for price', () => {
        const expectedContext = {
          errors: [
            { href: '#price', text: flatOnDemandManifest.errorMessages.PriceRequired },
          ],
          addPriceTable: {
            ...flatOnDemandManifest.addPriceTable,
            items: [
              [
                {
                  ...flatOnDemandManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatOnDemandManifest.addPriceTable.cellInfo.price.question,
                    error: {
                      message: flatOnDemandManifest.errorMessages.PriceRequired,
                    },
                  },
                },
                {
                  ...flatOnDemandManifest.addPriceTable.cellInfo.unitOfOrder,
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
          selectedPriceManifest: flatOnDemandManifest,
          validationErrors: [{ field: 'Price', id: 'PriceRequired' }],
          selectedPrice,
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });

    describe('flat - patient', () => {
      it('should return error for quantity', () => {
        const expectedContext = {
          errors: [
            { href: '#quantity', text: flatPatientManifest.errorMessages.QuantityRequired },
          ],
          questions: {
            ...flatPatientManifest.questions,
            quantity: {
              ...flatPatientManifest.questions.quantity,
              error: {
                message: flatPatientManifest.errorMessages.QuantityRequired,
              },
            },
          },
        };

        const context = getErrorContext({
          commonManifest,
          selectedPriceManifest: flatPatientManifest,
          validationErrors: [{ field: 'Quantity', id: 'QuantityRequired' }],
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return error for price', () => {
        const expectedContext = {
          errors: [
            { href: '#price', text: flatPatientManifest.errorMessages.PriceRequired },
          ],
          addPriceTable: {
            ...flatPatientManifest.addPriceTable,
            items: [
              [
                {
                  ...flatPatientManifest.addPriceTable.cellInfo.price,
                  question: {
                    ...flatPatientManifest.addPriceTable.cellInfo.price.question,
                    error: {
                      message: flatPatientManifest.errorMessages.PriceRequired,
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
          selectedPriceManifest: flatPatientManifest,
          validationErrors: [{ field: 'Price', id: 'PriceRequired' }],
          selectedPrice,
        });

        expect(context.errors).toEqual(expectedContext.errors);
        expect(context.addPriceTable).toEqual(expectedContext.addPriceTable);
      });
    });

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
  });
});
