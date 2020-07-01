export const questionExtractor = ((questionId, manifest) => manifest.questions
  .find(question => question.id === questionId));
