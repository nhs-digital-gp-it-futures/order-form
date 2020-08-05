import { addParamsToManifest } from './addParamsToManifest';

describe('addParamsToManifest', () => {
  const params = {
    username: 'john_smith',
    emailAddress: 'john.smith@email.com',
    firstName: 'John',
    lastName: 'Smith',
    organisationName: 'Secret',
  };

  it('should add params to strings within manifest if provided', () => {
    const exampleManifest = {
      title: 'You have added the user {{username}}.',
      description: 'An email has been sent to {{emailAddress}} so they can reset their password.',
    };

    const expectedManifestWithParams = {
      title: 'You have added the user john_smith.',
      description: 'An email has been sent to john.smith@email.com so they can reset their password.',
    };

    const manifestWithParams = addParamsToManifest(exampleManifest, params);
    expect(manifestWithParams).toEqual(expectedManifestWithParams);
  });

  it('should not add params to strings within manifest if not provided', () => {
    const exampleManifest = {
      title: 'You have added the user {{username}}.',
      description: 'An email has been sent to {{emailAddress}} so they can reset their password.',
    };

    const manifestWithoutParams = addParamsToManifest(exampleManifest, {});
    expect(manifestWithoutParams).toEqual(exampleManifest);
  });

  it('should add params to objects within manifest if provided', () => {
    const exampleManifest = {
      someObject: {
        organisation: {
          name: '{{username}} is from the {{organisationName}} organisation.',
        },
        user: {
          name: '{{username}}\'s real name is {{firstName}} {{lastName}}.',
          email: '{{username}}\'s email address is {{emailAddress}}.',
        },
      },
    };

    const expectedManifestWithParams = {
      someObject: {
        organisation: {
          name: 'john_smith is from the Secret organisation.',
        },
        user: {
          name: 'john_smith\'s real name is John Smith.',
          email: 'john_smith\'s email address is john.smith@email.com.',
        },
      },
    };

    const manifestWithParams = addParamsToManifest(exampleManifest, params);
    expect(manifestWithParams).toEqual(expectedManifestWithParams);
  });

  it('should not add params to objects within manifest if not provided', () => {
    const exampleManifest = {
      someObject: {
        organisation: {
          name: '{{username}} is from the {{organisationName}} organisation.',
        },
        user: {
          name: '{{username}}\'s real name is {{firstName}} {{lastName}}.',
          email: '{{username}}\'s email address is {{emailAddress}}.',
        },
      },
    };

    const manifestWithoutParams = addParamsToManifest(exampleManifest, {});
    expect(manifestWithoutParams).toEqual(exampleManifest);
  });

  it('should add params to arrays within manifest if provided', () => {
    const exampleManifest = {
      someArray: [
        {
          key: 'username',
          value: '{{username}}',
        },
        {
          key: 'emailAddress',
          value: '{{emailAddress}}',
        },
      ],
    };

    const expectedManifestWithParams = {
      someArray: [
        {
          key: 'username',
          value: 'john_smith',
        },
        {
          key: 'emailAddress',
          value: 'john.smith@email.com',
        },
      ],
    };

    const manifestWithParams = addParamsToManifest(exampleManifest, params);
    expect(manifestWithParams).toEqual(expectedManifestWithParams);
  });

  it('should not add params to arrays within manifest if not provided', () => {
    const exampleManifest = {
      someArray: [
        {
          key: 'username',
          value: '{{username}}',
        },
        {
          key: 'emailAddress',
          value: '{{emailAddress}}',
        },
        {
          key: 'firstName',
          value: '{{firstName}}',
        },
        {
          key: 'lastName',
          value: '{{lastName}}',
        },
        {
          key: 'fullName',
          value: '{{firstName}} {{lastName}}',
        },
      ],
    };

    const manifestWithoutParams = addParamsToManifest(exampleManifest, {});
    expect(manifestWithoutParams).toEqual(exampleManifest);
  });
});
