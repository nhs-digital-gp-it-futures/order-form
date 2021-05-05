import { getOdsCodeForOrganisation } from './odsCodeLookup';

fdescribe('getOdsCodeForOrganisation', () => {
  it('should give "123" organisation id for "abc" odscode', () => {
    const odsCode = getOdsCodeForOrganisation('abc');
    expect(odsCode).toEqual('123');
  });

  it('should give "456" organisation id for "def" odscode', () => {
    const odsCode = getOdsCodeForOrganisation('def');
    expect(odsCode).toEqual('456');
  });

  it('should give undefined organisation id if odscode not found', () => {
    const odsCode = getOdsCodeForOrganisation('');
    expect(odsCode).toEqual(undefined);
  });
});
