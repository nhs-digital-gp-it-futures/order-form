import { getSelectContext } from './controller';
import { getRelatedOrganisations } from '../../helpers/api/oapi/getOrganisation';

jest.mock('../../helpers/api/oapi/getOrganisation');

describe('organisation select controller', () => {
  describe('getSelectContext', () => {
    const expectedOrgList = [
      { organisationId: '001', name: 'org one' },
      { organisationId: '002', name: 'org two' },
    ];

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getRelatedOrganisations once', async () => {
      getRelatedOrganisations.mockResolvedValueOnce(expectedOrgList);

      const options = {
        accessToken: 'access_token',
        organisation: {
          primary: {
            id: 'abc',
            name: 'primary',
          },
        },
      };

      const returnedContext = await getSelectContext(options);

      expect(getRelatedOrganisations.mock.calls.length).toEqual(1);
      expect(getRelatedOrganisations).toHaveBeenCalledWith({ accessToken: 'access_token', orgId: 'abc' });

      expect(returnedContext.organisationList.length).toEqual(2);
      expect(returnedContext.organisationList[0].text).toEqual('org one');
      expect(returnedContext.organisationList[0].value).toEqual('001');
    });
  });
});
