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

  it('should return the generated price table', () => {
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

  it('should return the generated price table with the data populated', () => {
    const expectedGeneratedTable = {
      ...addPriceTable,
      items: [
        [
          {
            question: {
              type: 'input',
              id: 'price',
              data: '1892.23',
            },
          },
          {
            dataTestId: 'unit-of-order',
            data: 'per patient per year',
          },
        ],
      ],
    };

    const generatedAddPriceTable = generateAddPriceTable({
      addPriceTable, price: '1892.23', itemUnitDescription: 'per patient', timeUnitDescription: 'per year',
    });

    expect(generatedAddPriceTable).toEqual(expectedGeneratedTable);
  });
});
