import { questionExtractor } from './questionExtractor';

const manifest = {
  questions: [
    {
      id: 'test-id',
      data: 'test data',
    },
  ],
};
describe('questionExtractor', () => {
  it('returns the correct question', () => {
    expect(questionExtractor('test-id', manifest)).toEqual(manifest.questions[0]);
  });

  it('does not return a question if there is no match', () => {
    expect(questionExtractor('wrong-id', manifest)).toEqual(undefined);
  });
});
