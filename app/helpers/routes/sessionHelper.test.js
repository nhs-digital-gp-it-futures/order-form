import { fakeSessionManager } from 'buying-catalogue-library';
import { getFromSessionOrApi } from './sessionHelper';

describe('getFromSessionOrApi', () => {
  it('should invoke the callApi function when the requested data is not in session', async () => {
    fakeSessionManager.getFromSession = () => undefined;
    fakeSessionManager.saveToSession = () => {};

    const fakeApiCall = jest.fn();

    await getFromSessionOrApi({
      sessionData: {},
      sessionManager: fakeSessionManager,
      apiCall: fakeApiCall,
    });

    expect(fakeApiCall.mock.calls.length).toEqual(1);
  });

  it('should not invoke the callApi function when the requested data is in session', async () => {
    fakeSessionManager.getFromSession = () => 'Some data';
    fakeSessionManager.saveToSession = () => {};

    const fakeApiCall = jest.fn();

    await getFromSessionOrApi({
      sessionData: {},
      sessionManager: fakeSessionManager,
      apiCall: fakeApiCall,
    });

    expect(fakeApiCall.mock.calls.length).toEqual(0);
  });

  it('should save the result of the api call to session', async () => {
    const apiData = 'Some API data';
    let sessionData;

    fakeSessionManager.getFromSession = () => undefined;
    fakeSessionManager.saveToSession = (d) => { sessionData = d.value; };

    const fakeApiCall = jest.fn();
    fakeApiCall.mockResolvedValueOnce(apiData);

    await getFromSessionOrApi({
      sessionData: {},
      sessionManager: fakeSessionManager,
      apiCall: fakeApiCall,
    });

    expect(sessionData).toEqual(apiData);
  });

  it('should return the expected result from api call', async () => {
    const apiData = 'Some API data';

    fakeSessionManager.getFromSession = () => undefined;
    fakeSessionManager.saveToSession = () => {};

    const fakeApiCall = jest.fn();
    fakeApiCall.mockResolvedValueOnce(apiData);

    const result = await getFromSessionOrApi({
      sessionData: {},
      sessionManager: fakeSessionManager,
      apiCall: fakeApiCall,
    });

    expect(result).toEqual(apiData);
  });

  it('should return the expected result from session', async () => {
    const sessionData = 'Some session data';

    fakeSessionManager.getFromSession = () => sessionData;
    fakeSessionManager.saveToSession = () => {};

    const fakeApiCall = jest.fn();

    const result = await getFromSessionOrApi({
      sessionData: {},
      sessionManager: fakeSessionManager,
      apiCall: fakeApiCall,
    });

    expect(result).toEqual(sessionData);
  });
});
