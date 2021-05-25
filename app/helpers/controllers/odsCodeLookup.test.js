import { sessionManager } from 'buying-catalogue-library';
import { sessionKeys } from '../routes/sessionHelper';
import { getOrganisation } from '../api/oapi/getOrganisation';
import { getOrganisationUsingOdsCode } from '../api/oapi/getOrganisationUsingOdsCode';
import { getOdsCodeForOrganisation, getOrganisationFromOdsCode } from './odsCodeLookup';

jest.mock('../api/oapi/getOrganisation');
jest.mock('../api/oapi/getOrganisationUsingOdsCode');
jest.mock('../../logger');

describe('odsCodeLookup', () => {
  const accessToken = 'access_token';
  const organisationData = {
    organisationId: '123',
    name: 'org 1',
    odsCode: 'abc',
  };

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

  describe('getOrganisationFromOdsCode', () => {
    const req = {};
    const fakeSessionManager = {};

    beforeEach(() => {
      fakeSessionManager.getFromSession = () => { };
      fakeSessionManager.saveToSession = () => { };
    });

    afterEach(() => {
      getOrganisationUsingOdsCode.mockReset();
    });

    it('should give organisation if odscode is "abc"', async () => {
      getOrganisationUsingOdsCode.mockReturnValue({ odsCode: 'abc', organisationId: '123', organisationName: 'org 1' });

      const orgData = await getOrganisationFromOdsCode({
        req, sessionManager: fakeSessionManager, odsCode: 'abc', accessToken,
      });
      expect(orgData).toEqual(organisationData);
    });

    it('should give undefined odscode if organisation id not found', async () => {
      getOrganisationUsingOdsCode.mockReturnValue();

      const foundOdsCode = await getOrganisationUsingOdsCode({
        req, sessionManager: fakeSessionManager, odsCode: 'i do not exist', accessToken,
      });
      expect(foundOdsCode).toEqual(undefined);
    });
  });

  describe('getOrganisationFromOdsCode using SESSION MANAGER', () => {
    const req = { session: [] };
    const fakeLogger = { debug: () => '' };

    const session = sessionManager({ logger: fakeLogger });

    beforeAll(() => {
      jest.spyOn(session, 'saveToSession');

      getOrganisationUsingOdsCode.mockReturnValue({ organisationId: 'abc', odsCode: '123' });
    });

    afterAll(() => {
      getOrganisationUsingOdsCode.mockReset();
    });

    it('should save to session', async () => {
      await getOrganisationFromOdsCode({
        req, sessionManager: session, odsCode: '123', accessToken,
      });

      expect(session.saveToSession).toHaveBeenCalled();
    });

    it('should read from session', async () => {
      await getOrganisationFromOdsCode({
        req, sessionManager: session, odsCode: '123', accessToken,
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
