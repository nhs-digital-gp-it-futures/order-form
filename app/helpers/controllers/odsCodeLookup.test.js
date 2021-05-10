import { sessionManager } from 'buying-catalogue-library';
import { sessionKeys } from '../routes/sessionHelper';
import { getOrganisation } from '../api/oapi/getOrganisation';
import { getOdsCodeForOrganisation } from './odsCodeLookup';

jest.mock('../api/oapi/getOrganisation');
jest.mock('../../logger');

fdescribe('odsCodeLookup', () => {
  const accessToken = 'access_token';

  describe('getOdsCodeForOrganisation', () => {
    const req = {};
    const fakeSessionManager = {};

    beforeEach(() => {
      fakeSessionManager.getFromSession = () => { };
      fakeSessionManager.saveToSession = () => { };
    });

    afterEach(() => {
      getOrganisation.mockReset();
    });

    it('should give "abc" organisation id if odscode is "123"', async () => {
      getOrganisation.mockReturnValue({ organisationId: 'abc', odsCode: '123' });

      const foundOdsCode = await getOdsCodeForOrganisation({
        req, sessionManager: fakeSessionManager, orgId: 'abc', accessToken,
      });
      expect(foundOdsCode).toEqual('123');
    });

    it('should give undefined organisation id if odscode not found', async () => {
      getOrganisation.mockReturnValue();

      const foundOdsCode = await getOdsCodeForOrganisation({
        req, sessionManager: fakeSessionManager, orgId: 'i do not exist', accessToken,
      });
      expect(foundOdsCode).toEqual(undefined);
    });
  });

  describe('getOdsCodeForOrganisation using SESSION MANAGER', () => {
    const req = { session: [] };
    const fakeLogger = { debug: () => '' };

    const session = sessionManager({ logger: fakeLogger });

    beforeAll(() => {
      jest.spyOn(session, 'saveToSession');

      getOrganisation.mockReturnValue({ organisationId: 'abc', odsCode: '123' });
    });

    afterAll(() => {
      getOrganisation.mockReset();
    });

    it('should save to session', async () => {
      await getOdsCodeForOrganisation({
        req, sessionManager: session, orgId: 'abc', accessToken,
      });

      expect(session.saveToSession).toHaveBeenCalled();
    });

    it('should read from session', async () => {
      await getOdsCodeForOrganisation({
        req, sessionManager: session, orgId: 'abc', accessToken,
      });

      expect(session.saveToSession).toHaveBeenCalled();

      const lookupTable = session.getFromSession({ req, key: sessionKeys.odsLookupTable });

      expect(lookupTable).toBeDefined();
      expect(lookupTable.length).toBe(1);
      expect(lookupTable[0].organisationId).toBe('abc');
      expect(lookupTable[0].odsCode).toBe('123');
    });
  });
});
