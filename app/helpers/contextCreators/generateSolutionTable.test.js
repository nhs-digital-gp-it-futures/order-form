import { generateSolutionTable } from './generateSolutionTable';

describe('generateSolutionTable', () => {
  const recipients = [{ name: 'test', odsCode: '1' }];
  const selectedEstimationPeriod = 'year';
  const solutionTable = {
    columnInfo: [
      {
        data: 'Recipient name (ODS code)',
        width: '33%',
        classes: 'nhsuk-u-padding-bottom-5 nhsuk-u-font-size-20',
      },
      {
        data: 'Quantity per',
        width: '33%',
        classes: 'nhsuk-u-padding-bottom-5 nhsuk-u-font-size-20',
      },
    ],
    cellInfo: {
      recipient: {
        dataTestId: 'recipient',
      },
      quantity: {
        question: {
          type: 'input',
          id: 'quantity',
        },
        classes: 'nhsuk-input--width-10',
      },
      deliveryDate: {
        question: {
          type: 'input',
          id: 'deliveryDate',
        },
        classes: 'nhsuk-input--width-10',
      },
    },
  };

  it('should return the generated price table with the data populated', () => {
    const expectedGeneratedTable = {
      ...solutionTable,
      items: [
        [
          {
            data: 'test (1)',
            dataTestId: 'test-1-recipient',
          },
          {
            classes: 'nhsuk-input--width-10',
            question: {
              data: undefined,
              dataTestId: 'test-1-quantity',
              error: undefined,
              id: 'quantity',
              type: 'input',
            },
          },
          {
            classes: 'nhsuk-input--width-10',
            question: {
              data: {
                day: undefined,
                month: undefined,
                year: undefined,
              },
              dataTestId: 'test-1-deliveryDate',
              error: undefined,
              id: 'deliveryDate',
              type: 'input',
            },
          },
        ],
      ],
    };

    const generatedAddPriceTable = generateSolutionTable({
      solutionTable, recipients, deliveryDate: [{}], quantity: [], selectedEstimationPeriod,
    });

    expect(generatedAddPriceTable).toEqual(expectedGeneratedTable);
  });

  it('should return the generated price table with the data and error on price', () => {
    const expectedGeneratedTable = {
      ...solutionTable,
      items: [
        [
          {
            data: 'test (1)',
            dataTestId: 'test-1-recipient',
          },
          {
            classes: 'nhsuk-input--width-10',
            question: {
              data: 'test',
              dataTestId: 'test-1-quantity',
              error: { message: 'Error message' },
              id: 'quantity',
              type: 'input',
            },
          },
          {
            classes: 'nhsuk-input--width-10',
            question: {
              data: {
                day: undefined,
                month: undefined,
                year: undefined,
              },
              dataTestId: 'test-1-deliveryDate',
              error: { message: 'Error message' },
              id: 'deliveryDate',
              type: 'input',
            },
          },
        ],
      ],
    };

    const errorMap = {
      quantity: {
        errorMessages: ['Error message'],
      },
      deliveryDate: {
        errorMessages: ['Error message'],
      },
    };

    const generatedAddPriceTable = generateSolutionTable({
      solutionTable, errorMap, recipients, quantity: ['test'], deliveryDate: ['test'], selectedEstimationPeriod,
    });

    expect(generatedAddPriceTable).toEqual(expectedGeneratedTable);
  });
});
