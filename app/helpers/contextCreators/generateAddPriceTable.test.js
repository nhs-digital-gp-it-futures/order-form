import { generateAddPriceTable } from './generateAddPriceTable';

describe('generateAddPriceTable', () => {
  const addPriceTable = {
    cellInfo: {
      price: {
        question: {
          type: 'input',
          id: 'price',
        },
      },
      unitOfOrder: {
        dataTestId: 'unit-of-order',
      },
    },
  };

  it('should return the generated price table with the price question', () => {
    const expectedGeneratedTable = {
      ...addPriceTable,
      items: [
        [
          {
            question: {
              type: 'input',
              id: 'price',
            },
          },
          {
            dataTestId: 'unit-of-order',
          },
        ],
      ],
    };

    const generatedAddPriceTable = generateAddPriceTable({ addPriceTable });

    expect(generatedAddPriceTable).toEqual(expectedGeneratedTable);
  });
});
