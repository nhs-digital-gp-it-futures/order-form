import commonManifest from './commonManifest.json';
import flatDeclarativeManifest from './flat/declarative/manifest.json';
import { getContext } from './contextCreator';

describe('associated-services order-item contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref to associated-services when order item id is not neworderitem', () => {
      const context = getContext({
        commonManifest,
        orderId: 'order-1',
      });
      expect(context.backLinkHref).toEqual('/order/organisation/order-1/associated-services');
    });

    it('should return the backLinkHref to the select a price page when order item id is neworderitem', () => {
      const context = getContext({
        commonManifest,
        orderId: 'order-1',
        orderItemId: 'neworderitem',
      });
      expect(context.backLinkHref).toEqual('/order/organisation/order-1/associated-services/select/associated-service/price');
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
      const context = getContext({ commonManifest, orderItemId: 'neworderitem' });
      expect(context.deleteButton.text).toEqual(commonManifest.deleteButton.text);
      expect(context.deleteButton.disabled).toEqual(true);
    });

    it('should return the delete button when not neworderitem', () => {
      const context = getContext({ commonManifest, orderItemId: 'notneworderitem' });
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
                    data: 0.11,
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
});
