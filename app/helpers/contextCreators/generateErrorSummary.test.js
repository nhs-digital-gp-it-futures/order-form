import { generateErrorSummary } from './generateErrorSummary';

describe('generateErrorSummary', () => {
  it('should return an empty array if the errorMap provided is empty', () => {
    const generatedErrorSummary = generateErrorSummary({ errorMap: {} });

    expect(generatedErrorSummary).toEqual([]);
  });

  it('should return an single array if the errorMap', () => {
    const expectedErrorSummary = [
      {
        href: '#firstQuestion',
        text: 'First Error',
      },
    ];

    const errorMap = {
      firstQuestion: {
        errorMessages: ['First Error'],
      },
    };

    const generatedErrorSummary = generateErrorSummary({ errorMap });

    expect(generatedErrorSummary).toEqual(expectedErrorSummary);
  });

  it('should return an single array with multiple errors', () => {
    const expectedErrorSummary = [
      {
        href: '#firstQuestion',
        text: 'First Error, Another Error',
      },
    ];

    const errorMap = {
      firstQuestion: {
        errorMessages: ['First Error', 'Another Error'],
      },
    };

    const generatedErrorSummary = generateErrorSummary({ errorMap });

    expect(generatedErrorSummary).toEqual(expectedErrorSummary);
  });

  it('should return an error summary for each question provided in the errorMap', () => {
    const expectedErrorSummary = [
      {
        href: '#firstQuestion',
        text: 'First Error',
      },
      {
        href: '#secondQuestion',
        text: 'Second Error',
      },
    ];

    const errorMap = {
      firstQuestion: {
        errorMessages: ['First Error'],
      },
      secondQuestion: {
        errorMessages: ['Second Error'],
      },
    };

    const generatedErrorSummary = generateErrorSummary({ errorMap });

    expect(generatedErrorSummary).toEqual(expectedErrorSummary);
  });
});
