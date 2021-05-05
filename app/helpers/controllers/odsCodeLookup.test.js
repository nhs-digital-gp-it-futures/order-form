import { getOdsCodeForOrganisation, getOrganisationIdForOdsCode } from './odsCodeLookup';

fdescribe('odsLookup', () => {
  describe('getOdsCodeForOrganisation', () => {
    it.each`
      orgId     | odsCode
      ${'abc'}  | ${'123'}
      ${'def'}  | ${'456'}
      ${'zxy'}  | ${'890'}
    `('should give "$orgId" org Id when the odsCode is "$odsCode"', ({ orgId, odsCode }) => {
      const foundOrdId = getOdsCodeForOrganisation(orgId);
      expect(foundOrdId).toEqual(odsCode);
    });

    it('should give undefined organisation id if odscode not found', () => {
      const odsCode = getOdsCodeForOrganisation();
      expect(odsCode).toEqual(undefined);
    });
  });

  describe('getOrganisationIdForOdsCode', () => {
    it.each`
      orgId     | odsCode
      ${'abc'}  | ${'123'}
      ${'def'}  | ${'456'}
      ${'zxy'}  | ${'890'}
    `('should give "$odsCode" when orgId is "$orgId"', ({ orgId, odsCode }) => {
      const foundOrdId = getOrganisationIdForOdsCode(odsCode);
      expect(foundOrdId).toEqual(orgId);
    });

    it('should give undefined odscode if  organisation id not found', () => {
      const odsCode = getOrganisationIdForOdsCode();
      expect(odsCode).toEqual(undefined);
    });
  });
});
