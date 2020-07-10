import { generateQuestions } from './generateQuestions';

describe('generateQuestions', () => {
  it('should return the questions', () => {
    const questions = { firstQuestion: {}, secondQuestion: {} };

    const generatedQuestions = generateQuestions({ questions });

    expect(generatedQuestions).toEqual(questions);
  });

  it('should return the question with the form data provided', () => {
    const expectedGeneratedQuestions = { firstQuestion: { data: 'some data' } };

    const formData = { firstQuestion: 'some data' };
    const questions = { firstQuestion: {} };
    const generatedQuestions = generateQuestions({ questions, formData });

    expect(generatedQuestions).toEqual(expectedGeneratedQuestions);
  });

  it('should return the question with the form data provided when question is of type "date"', () => {
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

  it('should return the question with the option flagged as checked when provided from the form data and question is of type "radio"', () => {
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
