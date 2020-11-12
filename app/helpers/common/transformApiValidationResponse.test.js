import { transformApiValidationResponse } from './transformApiValidationResponse';

describe('transformApiValidationResponse', () => {
  it('should transform a non-bulk validation error response', () => {
    const field = 'DeliveryDate';
    const id = 'DeliveryDateOutsideDeliveryWindow';
    const response = { [`${field}`]: [id] };

    const errors = transformApiValidationResponse(response);

    expect(errors).toEqual([{ field, id }]);
  });

  it('should transform multiple errors in a non-bulk validation error response', () => {
    const field1 = 'DeliveryDate';
    const id1 = 'DeliveryDateOutsideDeliveryWindow';
    const field2 = 'Quantity';
    const id2 = 'QuantityRequired';
    const response = { [`${field1}`]: [id1], [`${field2}`]: [id2] };

    const errors = transformApiValidationResponse(response);

    expect(errors).toEqual([{ field: field1, id: id1 }, { field: field2, id: id2 }]);
  });

  it('should remove the index from a bulk validation error response', () => {
    const field = 'DeliveryDate';
    const id = 'DeliveryDateOutsideDeliveryWindow';
    const response = { [`[0].${field}`]: [id] };

    const errors = transformApiValidationResponse(response);

    expect(errors).toEqual([{ field, id }]);
  });

  it('should transform multiple errors for the same field', () => {
    const field = 'DeliveryDate';
    const id1 = 'DeliveryDateError1';
    const id2 = 'DeliveryDateError2';
    const response = { [`[0].${field}`]: [id1, id2] };

    const errors = transformApiValidationResponse(response);

    expect(errors).toEqual([{ field, id: id1 }, { field, id: id2 }]);
  });

  it('should de-duplicate errors in a bulk validation response', () => {
    const field = 'DeliveryDate';
    const id = 'DeliveryDateOutsideDeliveryWindow';
    const response = { [`[0].${field}`]: [id], [`[1].${field}`]: [id] };

    const errors = transformApiValidationResponse(response);

    expect(errors).toEqual([{ field, id }]);
  });

  it('should transform multiple errors in a bulk validation error response', () => {
    const field1 = 'DeliveryDate';
    const id1 = 'DeliveryDateOutsideDeliveryWindow';
    const field2 = 'Quantity';
    const id2 = 'QuantityRequired';
    const response = { [`[0].${field1}`]: [id1], [`[0].${field2}`]: [id2] };

    const errors = transformApiValidationResponse(response);

    expect(errors).toEqual([{ field: field1, id: id1 }, { field: field2, id: id2 }]);
  });
});
