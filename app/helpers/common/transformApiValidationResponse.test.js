import { transformApiValidationResponse } from './transformApiValidationResponse';

describe('transformApiValidationResponse', () => {
  const deliveryDate = 'DeliveryDate';
  const deliveryDateError = 'DeliveryDateOutsideDeliveryWindow';
  const quantity = 'Quantity';
  const quantityError = 'QuantityRequired';

  it.only('should transform a non-bulk validation error response', () => {
    const errors = transformApiValidationResponse({ [`${deliveryDate}`]: [deliveryDateError] });

    expect(errors).toEqual([{ field: deliveryDate, id: deliveryDateError }]);
  });

  it('should transform multiple errors in a non-bulk validation error response', () => {
    const errors = transformApiValidationResponse({
      [`${deliveryDate}`]: [deliveryDateError],
      [`${quantity}`]: [quantityError],
    });

    expect(errors).toEqual([
      { field: deliveryDate, id: deliveryDateError },
      { field: quantity, id: quantityError },
    ]);
  });

  it('should remove the index from a bulk validation error response', () => {
    const errors = transformApiValidationResponse({ [`[0].${deliveryDate}`]: [deliveryDateError] });

    expect(errors).toEqual([{ field: deliveryDate, id: deliveryDateError }]);
  });

  it('should transform multiple errors for the same field', () => {
    const error1 = 'DeliveryDateError1';
    const error2 = 'DeliveryDateError2';

    const errors = transformApiValidationResponse({ [`[0].${deliveryDate}`]: [error1, error2] });

    expect(errors).toEqual([
      { field: deliveryDate, id: error1 },
      { field: deliveryDate, id: error2 },
    ]);
  });

  it('should de-duplicate errors in a bulk validation response', () => {
    const errors = transformApiValidationResponse({
      [`[0].${deliveryDate}`]: [deliveryDateError],
      [`[1].${deliveryDate}`]: [deliveryDateError],
    });

    expect(errors).toEqual([{ field: deliveryDate, id: deliveryDateError }]);
  });

  it('should transform multiple errors in a bulk validation error response', () => {
    const errors = transformApiValidationResponse({
      [`[0].${deliveryDate}`]: [deliveryDateError],
      [`[0].${quantity}`]: [quantityError],
    });

    expect(errors).toEqual([
      { field: deliveryDate, id: deliveryDateError },
      { field: quantity, id: quantityError },
    ]);
  });
});
