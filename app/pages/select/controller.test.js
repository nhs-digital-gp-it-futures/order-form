import { getIsUserProxy, getProxyOrganisations, getSelectContext } from './controller';
import { getRelatedOrganisations } from '../../helpers/api/oapi/getOrganisation';

jest.mock('../../helpers/api/oapi/getOrganisation');

describe('organisation select controller', async () => {
  const options = {
    accessToken: 'access_token',
    orgId: 'abc',
    orgName: 'primary',
  };

  const expectedOrgList = [
    { organisationId: '001', name: 'org one' },
    { organisationId: '002', name: 'a org two' },
    { organisationId: '003', name: 'zzz org three' },
    { organisationId: '004', name: 'org four' },
  ];

  beforeEach(() => {
    getRelatedOrganisations.mockResolvedValueOnce(expectedOrgList);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getProxyOrganisations', async () => {
    it('should return 4 organisations', async () => {
      const organisationList = await getProxyOrganisations({
        accessToken: options.accessToken,
        orgId: options.organisation,
      });

      expect(organisationList.length).toEqual(4);

      expect(organisationList[0].name).toEqual('org one');
      expect(organisationList[0].organisationId).toEqual('001');
    });
  });

  describe('getSelectContext', async () => {
    it('should call getRelatedOrganisations once', async () => {
      const returnedContext = await getSelectContext(options);

      expect(getRelatedOrganisations.mock.calls.length).toEqual(1);
      expect(getRelatedOrganisations).toHaveBeenCalledWith({ accessToken: 'access_token', orgId: 'abc' });

      expect(returnedContext.organisationList.length).toEqual(4);
    });

    it('should give results in alphabetical order', async () => {
      const returnedContext = await getSelectContext(options);

      expect(returnedContext.organisationList.length).toEqual(4);
      expect(returnedContext.organisationList[0].text).toEqual('a org two');
      expect(returnedContext.organisationList[1].text).toEqual('org four');
      expect(returnedContext.organisationList[2].text).toEqual('org one');
      expect(returnedContext.organisationList[3].text).toEqual('zzz org three');
    });
  });

  describe('getIsUserProxy', async () => {
    it('should be true if user has proxy organisations', async () => {
      const userIsProxy = await getIsUserProxy({
        accessToken: options.accessToken,
        orgId: options.orgId,
      });

      expect(userIsProxy).toEqual(true);
    });
  });
});
