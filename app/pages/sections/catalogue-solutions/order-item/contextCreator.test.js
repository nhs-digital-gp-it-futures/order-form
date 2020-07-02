import commonManifest from './commonManifest.json';
import flatOndemandManifest from './flat/ondemand/manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import * as errorContext from '../../getSectionErrorContext';

jest.mock('../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

const solutionName = 'solution-name';
const serviceRecipientName = 'service-recipient-name';
const odsCode = 'ods-code';
const selectedPrice = {
  priceId: 2,
  provisioningType: 'Patient',
  type: 'flat',
  currencyCode: 'GBP',
  itemUnit: {
    name: 'patient',
    description: 'per patient',
  },
  timeUnit: {
    name: 'year',
    description: 'per year',
  },
  price: 1.64,
};

describe('catalogue-solutions order-item contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the title', () => {
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

      it('should return the selectEstimationPeriod question as checked when provided', () => {
        const expectedContext = {
          questions: [
            {
              ...flatOndemandManifest.questions[1],
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
          ],
        };

        const context = getContext({
          commonManifest, selectedPriceManifest: flatOndemandManifest,
        });
        expect(context.questions).toEqual(expectedContext.questions);
      });

      it('should return the table headings', () => {
        const context = getContext({ selectedPriceManifest: flatOndemandManifest });
        expect(context.addPriceTable.columnInfo)
          .toEqual(flatOndemandManifest.addPriceTable.columnInfo);
      });

      it('should return the table class', () => {
        const context = getContext({ selectedPriceManifest: flatOndemandManifest });
        expect(context.addPriceTable.columnClass)
          .toEqual(flatOndemandManifest.addPriceTable.columnClass);
      });

      it('should return the table data', () => {
        const tableData = [
          [
            {
              classes: 'nhsuk-input--width-10',
              expandableSection: {
                dataTestId: 'view-section-input-id',
                innerComponent: 'You can change the list price if you’ve agreed a different rate with the supplier.',
                title: 'What price should I enter?',
              },
              question: {
                data: 1.64,
                id: 'price',
                type: 'input',
              },
            },
            {
              data: 'per patient',
              dataTestId: 'order-unit-id',
            },
          ],
        ];
        const context = getContext({ selectedPriceManifest: flatOndemandManifest, selectedPrice });
        expect(context.addPriceTable.data).toEqual(tableData);
      });
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [
      { field: 'quantity', id: 'quantityRequired' },
      { field: 'price', id: 'priceRequired' },
    ];
    const manifestWithErrors = {
      questions:
      [{
        id: 'quantity',
        mainAdvice: 'Quantity',
        rows: 3,
        error: {
          message: 'quantity error',
        },
      }],
      addPriceTable:
      {
        data: [[{
          question: {
            type: 'input',
            id: 'price',
          },
        }]],
      },
      errorMessages:
      {
        quantityRequired: 'Enter a quantity',
        priceRequired: 'Enter a price',
      },
    };

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockReturnValue(manifestWithErrors);

      const params = {
        orderId: 'order-id',
        solutionName: 'solution-name',
        serviceRecipientName: 'recipient-name',
        odsCode: 'ods-code',
        selectedPrice,
        validationErrors: mockValidationErrors,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });

    it('should add error message to the table data', async () => {
      errorContext.getSectionErrorContext
        .mockReturnValue(manifestWithErrors);

      const params = {
        orderId: 'order-id',
        solutionName: 'solution-name',
        serviceRecipientName: 'recipient-name',
        odsCode: 'ods-code',
        selectedPrice,
        validationErrors: mockValidationErrors,
      };

      const returnedErrorContext = await getErrorContext(params);
      expect(returnedErrorContext.addPriceTable.data[0][0].question.error.message).toEqual('Enter a price');
    });
  });
});
