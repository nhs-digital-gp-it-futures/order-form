import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';
import * as errorContext from '../../../../getSectionErrorContext';

jest.mock('../../../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

describe('catalogue-solutions solution contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/catalogue-solutions`);
    });

    it('should return the title', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.title).toEqual(`${manifest.title} ${orderId}`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the select solution question', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectSolution',
            mainAdvice: 'Select Catalogue Solution',
            options: [
              {
                value: 'solution-1',
                text: 'Solution 1',
              },
              {
                value: 'solution-2',
                text: 'Solution 2',
              },
            ],
          },
        ],
      };

      const solutions = [
        {
          catalogueItemId: 'solution-1',
          name: 'Solution 1',
        },
        {
          catalogueItemId: 'solution-2',
          name: 'Solution 2',
        },
      ];

      const context = getContext({ solutions });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return selected solution question with the selectedSolution checked', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectSolution',
            mainAdvice: 'Select Catalogue Solution',
            options: [
              {
                value: 'solution-1',
                text: 'Solution 1',
              },
              {
                value: 'solution-2',
                text: 'Solution 2',
                checked: true,
              },
            ],
          },
        ],
      };

      const solutions = [
        {
          catalogueItemId: 'solution-1',
          name: 'Solution 1',
        },
        {
          catalogueItemId: 'solution-2',
          name: 'Solution 2',
        },
      ];

      const selectedSolutionId = 'solution-2';

      const context = getContext({ solutions, selectedSolutionId });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({});
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'selectSolution',
      id: 'SelectSolutionRequired',
    }];

    const solutions = [
      { id: 'solution-1', name: 'Solution 1' },
      { id: 'solution-2', name: 'Solution 2' },
    ];

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        solutions,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });
  });
});
