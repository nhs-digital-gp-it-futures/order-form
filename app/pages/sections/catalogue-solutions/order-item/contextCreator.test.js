import manifest from './manifest.json';
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
        solutionName, serviceRecipientName, odsCode, selectedPrice,
      });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should return the title', () => {
      const context = getContext({
        solutionName, serviceRecipientName, odsCode, selectedPrice,
      });
      expect(context.title).toEqual(`${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`);
    });

    it('should return the description', () => {
      const context = getContext({ selectedPrice });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the delete button', () => {
      const context = getContext({ selectedPrice });
      expect(context.deleteButtonText).toEqual(manifest.deleteButtonText);
    });

    it('should return the questions', () => {
      const questions = [{
        id: 'plannedDeliveryDate',
        mainAdvice: 'Planned delivery date',
        additionalAdvice: 'For example 14 01 2020',
      },
      {
        id: 'quantity',
        mainAdvice: 'Quantity',
        rows: 3,
        expandableSection: {
          dataTestId: 'view-section-quantity-id',
          title: 'What quantity should I enter?',
          innerComponent: "Estimate the quantity you think you'll need either per month or per year.",
        },
      },
      {
        id: 'selectEstimationPeriod',
        mainAdvice: 'Estimation period',
        options: [
          {
            value: 'perMonth',
            text: 'Per month',
          },
          {
            value: 'perYear',
            text: 'Per year',
            checked: true,
          },
        ],
        expandableSection: {
          dataTestId: 'view-section-estimation-period-id',
          title: 'What period should I enter?',
          innerComponent: 'This should be based on how you estimated the quantity you want to order.',
        },
      },
      {
        type: 'input',
        id: 'price',
      },
      ];

      const context = getContext({ selectedPrice });
      expect(context.questions).toEqual(questions);
    });

    it('should return the table headings', () => {
      const context = getContext({ selectedPrice });
      expect(context.addPriceTable.columnInfo).toEqual(manifest.addPriceTable.columnInfo);
    });

    it('should return the table class', () => {
      const context = getContext({ selectedPrice });
      expect(context.addPriceTable.columnClass).toEqual(manifest.addPriceTable.columnClass);
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
      const context = getContext({ selectedPrice });
      expect(context.addPriceTable.data).toEqual(tableData);
    });

    it('should return the save button', () => {
      const context = getContext({ selectedPrice });
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });
  });
  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'quantity',
      id: 'quantityRequired',
    },
    {
      field: 'price',
      id: 'priceRequired',
    }];
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

    it('should call add error message to the table data', async () => {
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
