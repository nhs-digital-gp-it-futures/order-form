import { generateSolutionTable } from './generateSolutionTable';

describe('generateSolutionTable', () => {
  const recipients = [{ name: 'test', odsCode: '1' }];
  const solutionTable = {
    cellInfo: {
      recipient: {
        dataTestId: 'recipient',
      },
      practiceSize: {
        question: {
          type: 'input',
          id: 'practiceSize',
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
              dataTestId: 'test-1-practiceSize',
              error: undefined,
              id: 'practiceSize',
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
      solutionTable, recipients, deliveryDate: [{}],
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
              dataTestId: 'test-1-practiceSize',
              error: { message: 'Error message' },
              id: 'practiceSize',
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
      practiceSize: {
        errorMessages: ['Error message'],
      },
      deliveryDate: {
        errorMessages: ['Error message'],
      },
    };

    const generatedAddPriceTable = generateSolutionTable({
      solutionTable, errorMap, recipients, practiceSize: ['test'], deliveryDate: ['test'],
    });

    expect(generatedAddPriceTable).toEqual(expectedGeneratedTable);
  });
});
