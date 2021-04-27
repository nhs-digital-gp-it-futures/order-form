import { getProxyOrganisations } from './getProxyOrganisations';

jest.mock('./getProxyOrganisations');

describe('getProxyOrganisations', () => {
  const expectedOrgList = [
    { organisationId: '001', name: 'org one' },
    { organisationId: '002', name: 'a org two' },
    { organisationId: '003', name: 'zzz org three' },
    { organisationId: '004', name: 'org four' },
  ];

  beforeEach(() => {
    getProxyOrganisations.mockResolvedValueOnce(expectedOrgList);
  });

  it('should return 4 organisations', async () => {
    const organisationList = await getProxyOrganisations({
      accessToken: 'access_token',
      orgId: 'abc',
    });

    expect(organisationList.length).toEqual(4);

    expect(organisationList[0].name).toEqual('org one');
    expect(organisationList[0].organisationId).toEqual('001');
  });
});
