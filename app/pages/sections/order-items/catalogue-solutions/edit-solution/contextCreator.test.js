import commonManifest from './commonManifest.json';
import flatPatientManifest from './flat/patient/manifest.json';
import { getContext } from './contextCreator';

describe('catalogue-solutions order-item contextCreator', () => {
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

    describe('flat - patient', () => {
      const recipients = [{ name: 'test', odsCode: 'testCode' }];
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

        const formData = { price: 1.25 };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatPatientManifest, formData, recipients,
        });
        expect(context.questions.price)
          .toEqual(expectedContext.questions.price);
      });

      it('should return the solutionTable colummInfo', () => {
        const context = getContext({
          commonManifest, selectedPriceManifest: flatPatientManifest, recipients, formData: { practiceSize: '' },
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
                  ...flatPatientManifest.solutionTable.cellInfo.practiceSize,
                  question: {
                    ...flatPatientManifest.solutionTable.cellInfo.practiceSize.question,
                    data: 100,
                    dataTestId: 'test-testCode-practiceSize',
                    error: undefined,
                  },
                },
                {
                  ...flatPatientManifest.solutionTable.cellInfo.plannedDeliveryDate,
                  question: {
                    ...flatPatientManifest.solutionTable.cellInfo.plannedDeliveryDate.question,
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
          practiceSize: 100,
          deliveryDate: {
            day: 9,
            month: 2,
            year: 2021,
          },
        };

        const context = getContext({
          commonManifest,
          selectedPriceManifest: flatPatientManifest,
          formData,
          recipients,
        });

        expect(context.solutionTable).toEqual(expectedContext.solutionTable);
      });
    });
  });
});
