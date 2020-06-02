import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import { getSectionErrorContext } from './getSectionErrorContext';
import { baseUrl } from '../../config';

jest.mock('buying-catalogue-library');

const mockValidationErrors = [
  {
    field: 'field1',
    id: 'Field1Required',
  },
  {
    field: 'field1',
    id: 'OrderDescriptionTooLong',
  },
];

const mockManifest = {
  title: 'a lovely title',
  questions: [
    {
      id: 'field1',
      mainAdvice: 'field1 main advice',
    },
  ],
};

const orderId = 'order-id';

describe('getSectionErrorContext', () => {
  it('should construct errors array from the data provided', () => {
    formatErrors.mockReturnValue({});
    addErrorsAndDataToManifest.mockReturnValue({});
    formatAllErrors.mockReturnValue([
      { href: '#field1', text: 'field1 is too long' },
      { href: '#field1', text: 'field1 is required' },
    ]);

    const context = getSectionErrorContext({
      orderId,
      validationErrors: mockValidationErrors,
      data: { field1: 'a lovely field1' },
      manifest: mockManifest,
    });

    expect(context.errors.length).toEqual(2);
    expect(context.errors[0].href).toEqual('#field1');
    expect(context.errors[0].text).toEqual('field1 is too long');
    expect(context.errors[1].href).toEqual('#field1');
    expect(context.errors[1].text).toEqual('field1 is required');
    formatErrors.mockRestore();
    addErrorsAndDataToManifest.mockRestore();
    formatAllErrors.mockRestore();
  });

  it('should call the helper functions', () => {
    formatErrors.mockReturnValue({});
    addErrorsAndDataToManifest.mockReturnValue({});
    formatAllErrors.mockReturnValue([
      { href: '#field1', text: 'field1 is too long' },
      { href: '#field1', text: 'field1 is required' },
    ]);

    getSectionErrorContext({
      orderId: 'order-id',
      validationErrors: mockValidationErrors,
      data: { field1: 'a lovely field1' },
      manifest: mockManifest,
    });

    expect(formatErrors.mock.calls.length).toEqual(1);
    expect(addErrorsAndDataToManifest.mock.calls.length).toEqual(1);
    expect(formatAllErrors.mock.calls.length).toEqual(1);

    formatErrors.mockRestore();
    addErrorsAndDataToManifest.mockRestore();
    formatAllErrors.mockRestore();
  });

  it('should construct the backLinkHref', () => {
    formatErrors.mockReturnValue({});
    addErrorsAndDataToManifest.mockReturnValue({});
    formatAllErrors.mockReturnValue([
      { href: '#field1', text: 'field1 is too long' },
      { href: '#field1', text: 'field1 is required' },
    ]);
    const context = getSectionErrorContext({
      orderId,
      validationErrors: mockValidationErrors,
      data: { field1: 'a lovely field1' },
      manifest: mockManifest,
    });
    expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
  });
});
