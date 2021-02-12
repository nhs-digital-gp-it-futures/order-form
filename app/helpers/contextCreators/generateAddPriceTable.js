import { formatPrice } from '../common/priceFormatter';

export const generateAddPriceTable = ({
  addPriceTable, price, itemUnitDescription, timeUnitDescription = '', errorMap,
}) => {
  const columns = [];

  columns.push({
    ...addPriceTable.cellInfo.price,
    question: {
      ...addPriceTable.cellInfo.price.question,
      data: price !== undefined
        ? formatPrice(
          { value: price, minimumFractionDigits: 0, maximumFractionDigits: 20 },
        ) : undefined,
      error: errorMap && errorMap.price
        ? { message: errorMap.price.errorMessages.join(', ') }
        : undefined,
    },
  });

  columns.push({
    ...addPriceTable.cellInfo.unitOfOrder,
    data: itemUnitDescription ? `${itemUnitDescription} ${timeUnitDescription}` : undefined,
  });

  const items = [columns];
  return ({
    ...addPriceTable,
    items,
  });
};
