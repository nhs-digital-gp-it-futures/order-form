import { getSelectContext, getSelectErrorContext } from './controller';
import { getRelatedOrganisations } from '../../helpers/api/oapi/getRelatedOrganisations';
import { baseUrl } from '../../config';
import manifest from './manifest.json';

jest.mock('../../helpers/api/oapi/getRelatedOrganisations');

describe('organisation select controller', () => {
  const options = {
    accessToken: 'access_token',
    orgId: 'abc',
    orgName: 'primary',
    odsCode: 'odsCode',
    selectedOrgId: '002',
    selectedOdsCode: 'currentOdsCode',
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

      expect(returnedContext.questions.length).toEqual(1);
      const question = returnedContext.questions[0];
      expect(question.id).toEqual('organisation');
      expect(question.options.length).toEqual(expectedOrgList.length + 1);
    });

    it('should return backLinkHref with selectedOdsCode if valid', async () => {
      const returnedContext = await getSelectContext(options);

      expect(returnedContext.backLinkHref).toEqual(`${baseUrl}/organisation/${options.selectedOdsCode}`);
    });

    it('should return backLinkHref with odsCode if selectedOdsCode is invalid ', async () => {
      options.selectedOdsCode = undefined;

      const returnedContext = await getSelectContext(options);

      expect(returnedContext.backLinkHref).toEqual(`${baseUrl}/organisation/${options.odsCode}`);
    });

    it('should return manifest values', async () => {
      const returnedContext = await getSelectContext(options);

      expect(returnedContext.backLinkText).toEqual(manifest.backLinkText);
      expect(returnedContext.continueButtonText).toEqual(manifest.continueButtonText);
      expect(returnedContext.description).toEqual(manifest.description);
      expect(returnedContext.errorMessages).toEqual(manifest.errorMessages);
      expect(returnedContext.title).toEqual(manifest.title);
    });

    it('should return org values', async () => {
      const returnedContext = await getSelectContext(options);

      expect(returnedContext.odsCode).toEqual(options.odsCode);
      expect(returnedContext.orgId).toEqual(options.orgId);
      expect(returnedContext.orgName).toEqual(options.orgName);
      expect(returnedContext.primaryName).toEqual(options.orgName);
    });

    it('should return question options with current Organisation as the first option', async () => {
      const returnedContext = await getSelectContext(options);

      const question = returnedContext.questions[0];
      expect(question.options[0].text).toEqual('primary');
      expect(question.options[0].value).toEqual('abc');

      expect(question.options[1].text).toEqual('a org two');
      expect(question.options[1].value).toEqual('002');
    });

    it('should return question options in alphabetical order with formatted value', async () => {
      const returnedContext = await getSelectContext(options);

      const question = returnedContext.questions[0];
      expect(question.options.length).toEqual(5);
      expect(question.options[0].text).toEqual(options.orgName);
      expect(question.options[0].value).toEqual(options.orgId);
      expect(question.options[0].checked).toEqual(undefined);

      expect(question.options[1].text).toEqual('a org two');
      expect(question.options[1].value).toEqual('002');
      expect(question.options[1].checked).toEqual(undefined);

      expect(question.options[2].text).toEqual('org four');
      expect(question.options[2].value).toEqual('004');
      expect(question.options[2].checked).toEqual(undefined);

      expect(question.options[3].text).toEqual('org one');
      expect(question.options[3].value).toEqual('001');
      expect(question.options[3].checked).toEqual(undefined);

      expect(question.options[4].text).toEqual('zzz org three');
      expect(question.options[4].value).toEqual('003');
      expect(question.options[4].checked).toEqual(undefined);
    });
  });

  describe('getSelectErrorContext', () => {
    const params = {
      accessToken: 'access_token',
      req: {
        body: {
          odsCode: 'odsCode',
          orgId: 'orgId',
          orgName: 'orgName',
        },
      },
      selectedOdsCode: 'currentOdsCode',
    };

    it('should return expected backLinkHref', async () => {
      const returnedContext = await getSelectErrorContext(params);

      expect(returnedContext.backLinkHref).toEqual(`${baseUrl}/organisation/${params.selectedOdsCode}`);
    });

    it('should return expected errors', async () => {
      const returnedContext = await getSelectErrorContext(params);

      expect(returnedContext.errors.length).toEqual(1);
      expect(returnedContext.errors[0].text).toEqual(manifest.errorMessages.SelectOrganisation);
      expect(returnedContext.errors[0].href).toEqual('#organisation');
    });

    it('should return manifest values', async () => {
      const returnedContext = await getSelectErrorContext(params);

      expect(returnedContext.backLinkText).toEqual(manifest.backLinkText);
      expect(returnedContext.continueButtonText).toEqual(manifest.continueButtonText);
      expect(returnedContext.description).toEqual(manifest.description);
      expect(returnedContext.errorMessages).toEqual(manifest.errorMessages);
      expect(returnedContext.title).toEqual(manifest.title);
    });

    it('should return org values', async () => {
      const returnedContext = await getSelectErrorContext(params);

      expect(returnedContext.odsCode).toEqual(params.req.body.odsCode);
      expect(returnedContext.orgId).toEqual(params.req.body.orgId);
      expect(returnedContext.orgName).toEqual(params.req.body.orgName);
      expect(returnedContext.primaryName).toEqual(params.req.body.orgName);
    });
  });
});
