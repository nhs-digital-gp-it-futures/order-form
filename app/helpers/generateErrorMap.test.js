import { generateErrorMap } from './generateErrorMap';

describe('generateErrorMap', () => {
  it('should return error map for 1 question with 1 error', () => {
    const expectedErrorMap = {
      question1: {
        errorMessages: ['Question 1 required'],
      },
    };

    const validationErrors = [{ field: 'question1', id: 'question1Required' }];

    const errorMessagesFromManifest = {
      question1Required: 'Question 1 required',
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
      { field: 'question1', id: 'question1TooLong' },
      { field: 'question1', id: 'question1InvalidType' },
    ];

    const errorMessagesFromManifest = {
      question1TooLong: 'Question 1 too long',
      question1InvalidType: 'Question 1 invalid type',
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
      { field: 'question1', id: 'question1Required' },
      { field: 'question2', id: 'question2Required' },
    ];

    const errorMessagesFromManifest = {
      question1Required: 'Question 1 required',
      question2Required: 'Question 2 required',
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
      { field: 'question1', id: 'question1TooLong' },
      { field: 'question1', id: 'question1InvalidType' },
      { field: 'question2', id: 'question2TooLong' },
      { field: 'question2', id: 'question2InvalidType' },
    ];

    const errorMessagesFromManifest = {
      question1TooLong: 'Question 1 too long',
      question1InvalidType: 'Question 1 invalid type',
      question2TooLong: 'Question 2 too long',
      question2InvalidType: 'Question 2 invalid type',
    };

    const errorMap = generateErrorMap({ validationErrors, errorMessagesFromManifest });

    expect(errorMap).toEqual(expectedErrorMap);
  });
});
