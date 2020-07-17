export const nockCheck = async (nock) => {
  if (process.env.NOCK_CHECK === 'true') {
    const isDone = nock.isDone();
    if (!isDone) {
      throw new Error(`pending mocks: ${nock.pendingMocks()}`);
    }
  }
};
