import { generateQuestions } from './generateQuestions';

describe('generateQuestions', () => {
  describe('when questions contains just a single question', () => {
    it('should return the question with all its props', () => {
      const questions = { firstQuestion: { firstProp: 'some value' } };

      const generatedQuestions = generateQuestions({ questions });

      expect(generatedQuestions).toEqual(questions);
    });

    describe('populate question with data when provided', () => {
      it('should return the question', () => {
        const expectedGeneratedQuestions = { firstQuestion: { data: 'some data' } };

        const formData = { firstQuestion: 'some data' };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, formData });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question without data if the formData is for another question', () => {
        const expectedGeneratedQuestions = { firstQuestion: {} };

        const formData = { anotherQuestion: 'some data' };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, formData });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with the date data when question is of type "date"', () => {
        const expectedGeneratedQuestions = {
          dateQuestion: {
            type: 'date',
            data: {
              day: 'some day',
              month: 'some month',
              year: 'some year',
            },
          },
        };

        const formData = {
          'dateQuestion-day': 'some day',
          'dateQuestion-month': 'some month',
          'dateQuestion-year': 'some year',
        };
        const questions = { dateQuestion: { type: 'date' } };
        const generatedQuestions = generateQuestions({ questions, formData });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with the option flagged as checked when question is of type "radio"', () => {
        const expectedGeneratedQuestions = {
          radioQuestion: {
            type: 'radio',
            options: [
              {
                value: 'value1',
                text: 'Value One',
                checked: true,
              },
              {
                value: 'value2',
                text: 'Value Two',
              },
            ],
          },
        };

        const formData = {
          radioQuestion: 'value1',
        };

        const questions = {
          radioQuestion: {
            type: 'radio',
            options: [
              {
                value: 'value1',
                text: 'Value One',
              },
              {
                value: 'value2',
                text: 'Value Two',
              },
            ],
          },
        };
        const generatedQuestions = generateQuestions({ questions, formData });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });
    });

    describe('add errors to question when provided with errorMap', () => {
      it('should return the question with one error', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            error: {
              message: 'First Error',
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question without the error if the errorMap is for another question', () => {
        const expectedGeneratedQuestions = { firstQuestion: {} };

        const errorMap = {
          anotherQuestion: {
            errorMessages: ['another Error'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with multiple errors', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            error: {
              message: 'First Error, Second Error',
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error', 'Second Error'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with the fields errored', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            error: {
              message: 'First Error',
              fields: ['firstField', 'secondField'],
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
            fields: ['firstField', 'secondField'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with the fields errored as ["day", "month", "year"] '
        + 'when question is of type "date" and fields not provided from errorMap', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            type: 'date',
            error: {
              message: 'First Error',
              fields: ['day', 'month', 'year'],
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
          },
        };
        const questions = { firstQuestion: { type: 'date' } };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });
    });

    describe('populate question and add errors to question when formData and errorMap provided', () => {
      it('should return the question with the data and errors', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            data: 'some data',
            error: {
              message: 'First Error',
            },
          },
        };

        const formData = { firstQuestion: 'some data' };
        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, formData, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });
    });
  });

  describe('when questions contains multiple questions', () => {
    it('should return the questions with all its props', () => {
      const questions = {
        firstQuestion: { firstProp: 'some value' },
        secondQuestion: { anotherProp: 'some other value' },
      };

      const generatedQuestions = generateQuestions({ questions });

      expect(generatedQuestions).toEqual(questions);
    });

    describe('populate questions with data when provided', () => {
      it('should return the questions', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: { data: 'some data' },
          secondQuestion: { data: 'some more data' },
        };

        const formData = { firstQuestion: 'some data', secondQuestion: 'some more data' };
        const questions = { firstQuestion: {}, secondQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, formData });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should only populate for the question provided', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {},
          secondQuestion: { data: 'some more data' },
        };

        const formData = { secondQuestion: 'some more data' };
        const questions = { firstQuestion: {}, secondQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, formData });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });
    });

    describe('add errors to questions when provided with errorMap', () => {
      it('should return the questions with their errors', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            error: {
              message: 'First Error',
            },
          },
          secondQuestion: {
            error: {
              message: 'Second Error',
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
          },
          secondQuestion: {
            errorMessages: ['Second Error'],
          },
        };
        const questions = { firstQuestion: {}, secondQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question without the error if the errorMap is for another question', () => {
        const expectedGeneratedQuestions = { firstQuestion: {} };

        const errorMap = {
          anotherQuestion: {
            errorMessages: ['another Error'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with multiple errors', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            error: {
              message: 'First Error, Second Error',
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error', 'Second Error'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with the fields errored', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            error: {
              message: 'First Error',
              fields: ['firstField', 'secondField'],
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
            fields: ['firstField', 'secondField'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });

      it('should return the question with the fields errored as ["day", "month", "year"] '
        + 'when question is of type "date" and fields not provided from errorMap', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            type: 'date',
            error: {
              message: 'First Error',
              fields: ['day', 'month', 'year'],
            },
          },
        };

        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
          },
        };
        const questions = { firstQuestion: { type: 'date' } };
        const generatedQuestions = generateQuestions({ questions, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });
    });

    describe('populate question and add errors to question when formData and errorMap provided', () => {
      it('should return the question with the data and errors', () => {
        const expectedGeneratedQuestions = {
          firstQuestion: {
            data: 'some data',
            error: {
              message: 'First Error',
            },
          },
        };

        const formData = { firstQuestion: 'some data' };
        const errorMap = {
          firstQuestion: {
            errorMessages: ['First Error'],
          },
        };
        const questions = { firstQuestion: {} };
        const generatedQuestions = generateQuestions({ questions, formData, errorMap });

        expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
      });
    });
  });
});
