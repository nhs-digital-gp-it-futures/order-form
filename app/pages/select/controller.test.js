import { getSelectContext } from './controller';
import { getRelatedOrganisations } from '../../helpers/api/oapi/getRelatedOrganisations';

jest.mock('../../helpers/api/oapi/getRelatedOrganisations');

fdescribe('organisation select controller', () => {
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

  describe('getSelectContext', () => {
    it('should call getRelatedOrganisations once', async () => {
      const returnedContext = await getSelectContext(options);

      expect(getRelatedOrganisations.mock.calls.length).toEqual(1);
      expect(getRelatedOrganisations).toHaveBeenCalledWith({ accessToken: 'access_token', orgId: 'abc' });

      expect(returnedContext.organisationList.length).toEqual(4);
    });

    it('should give results in alphabetical order with formatted value', async () => {
      const returnedContext = await getSelectContext(options);

      expect(returnedContext.organisationList.length).toEqual(4);
      expect(returnedContext.organisationList[0].text).toEqual('a org two');
      expect(returnedContext.organisationList[0].value).toEqual('002|a org two');

      expect(returnedContext.organisationList[1].text).toEqual('org four');
      expect(returnedContext.organisationList[1].value).toEqual('004|org four');

      expect(returnedContext.organisationList[2].text).toEqual('org one');
      expect(returnedContext.organisationList[2].value).toEqual('001|org one');

      expect(returnedContext.organisationList[3].text).toEqual('zzz org three');
      expect(returnedContext.organisationList[3].value).toEqual('003|zzz org three');
    });
  });
});
