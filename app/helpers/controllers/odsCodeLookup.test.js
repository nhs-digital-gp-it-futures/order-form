import { getOrganisation } from '../api/oapi/getOrganisation';
import { getOdsCodeForOrganisation } from './odsCodeLookup';

jest.mock('../api/oapi/getOrganisation');

fdescribe('odsLookup', () => {
  const req = {};
  const fakeSessionManager = {};
  const accessToken = 'access_token';

  beforeEach(() => {
    fakeSessionManager.getFromSession = () => { };
    fakeSessionManager.saveToSession = () => { };
  });

  afterEach(() => {
    getOrganisation.mockReset();
  });

  describe('getOdsCodeForOrganisation', () => {
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

  // describe('getOrganisationIdForOdsCode', () => {
  //   it.each`
  //     orgId     | odsCode
  //     ${'abc'}  | ${'123'}
  //     ${'def'}  | ${'456'}
  //     ${'zxy'}  | ${'890'}
  //   `('should give "$odsCode" when orgId is "$orgId"', ({ orgId, odsCode }) => {
  //     const foundOrdId = getOrganisationIdForOdsCode(odsCode);
  //     expect(foundOrdId).toEqual(orgId);
  //   });

  //   it('should give undefined odscode if  organisation id not found', () => {
  //     const odsCode = getOrganisationIdForOdsCode();
  //     expect(odsCode).toEqual(undefined);
  //   });
  // });
});
