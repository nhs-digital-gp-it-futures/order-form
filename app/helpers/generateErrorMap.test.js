import { generateErrorMap } from './generateErrorMap';

describe('generateErrorMap', () => {
  it('should return error map for 1 question with 1 error', () => {
    const expectedErrorMap = {
      question1: {
        errorMessages: ['Question 1 required'],
      },
    };

    const validationErrors = [{ field: 'Question1', id: 'Question1Required' }];

    const errorMessagesFromManifest = {
      Question1Required: 'Question 1 required',
    };

    const errorMap = generateErrorMap({ validationErrors, errorMessagesFromManifest });

    expect(errorMap).toEqual(expectedErrorMap);
  });

  it('should return a map for 1 question with 2 errors', () => {
    const expectedErrorMap = {
      question1: {
        errorMessages: ['Question 1 too long', 'Question 1 invalid type'],
      },
    };

    const validationErrors = [
      { field: 'Question1', id: 'Question1TooLong' },
      { field: 'Question1', id: 'Question1InvalidType' },
    ];

    const errorMessagesFromManifest = {
      Question1TooLong: 'Question 1 too long',
      Question1InvalidType: 'Question 1 invalid type',
    };

    const errorMap = generateErrorMap({ validationErrors, errorMessagesFromManifest });

    expect(errorMap).toEqual(expectedErrorMap);
  });

  it('should return error map for 2 questions with 1 error each', () => {
    const expectedErrorMap = {
      question1: {
        errorMessages: ['Question 1 required'],
      },
      question2: {
        errorMessages: ['Question 2 required'],
      },
    };
    const validationErrors = [
      { field: 'Question1', id: 'Question1Required' },
      { field: 'Question2', id: 'Question2Required' },
    ];

    const errorMessagesFromManifest = {
      Question1Required: 'Question 1 required',
      Question2Required: 'Question 2 required',
    };

    const errorMap = generateErrorMap({ validationErrors, errorMessagesFromManifest });

    expect(errorMap).toEqual(expectedErrorMap);
  });

  it('should return error map for 2 questions with 2 errors each', () => {
    const expectedErrorMap = {
      question1: {
        errorMessages: ['Question 1 too long', 'Question 1 invalid type'],
      },
      question2: {
        errorMessages: ['Question 2 too long', 'Question 2 invalid type'],
      },
    };

    const validationErrors = [
      { field: 'Question1', id: 'Question1TooLong' },
      { field: 'Question1', id: 'Question1InvalidType' },
      { field: 'Question2', id: 'Question2TooLong' },
      { field: 'Question2', id: 'Question2InvalidType' },
    ];

    const errorMessagesFromManifest = {
      Question1TooLong: 'Question 1 too long',
      Question1InvalidType: 'Question 1 invalid type',
      Question2TooLong: 'Question 2 too long',
      Question2InvalidType: 'Question 2 invalid type',
    };

    const errorMap = generateErrorMap({ validationErrors, errorMessagesFromManifest });

    expect(errorMap).toEqual(expectedErrorMap);
  });

  it('should return error map with all the fields when question consists of multiple parts', () => {
    const expectedErrorMap = {
      question1: {
        errorMessages: ['Question 1 required'],
        fields: ['part1', 'part2'],
      },
    };

    const validationErrors = [{ field: 'Question1', id: 'Question1Required', part: ['part1', 'part2'] }];

    const errorMessagesFromManifest = {
      Question1Required: 'Question 1 required',
    };

    const errorMap = generateErrorMap({ validationErrors, errorMessagesFromManifest });

    expect(errorMap).toEqual(expectedErrorMap);
  });
});
