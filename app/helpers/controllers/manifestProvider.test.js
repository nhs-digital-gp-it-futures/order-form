import fs from 'fs';
import path from 'path';
import { getSelectedPriceManifest, modifyManifestIfOnDemand } from './manifestProvider';

jest.mock('fs');
jest.mock('path');

describe('getSelectedPriceManifest', () => {
  afterEach(() => {
    fs.readFileSync.mockReset();
    path.join.mockReset();
  });

  it('should return an object', () => {
    const description = 'This is the on-demand price manifest.';
    const manifestFileContent = `{"description": "${description}"}`;
    const manifest = { description };

    fs.readFileSync.mockReturnValue(manifestFileContent);
    expect(getSelectedPriceManifest({ orderItemType: 'Solution', provisioningType: 'OnDemand', type: 'Flat' })).toEqual(manifest);
  });

  it.each`
    orderItemType           | provisioningType | type      | expectedPath
    ${'Solution'}           | ${'OnDemand'}    | ${'Flat'} | ${'../../pages/sections/order-items/catalogue-solutions/order-item/flat/ondemand/manifest.json'}
    ${'Solution'}           | ${'Patient'}     | ${'Flat'} | ${'../../pages/sections/order-items/catalogue-solutions/order-item/flat/patient/manifest.json'}
    ${'Solution'}           | ${'Declarative'} | ${'Flat'} | ${'../../pages/sections/order-items/catalogue-solutions/order-item/flat/declarative/manifest.json'}
    ${'AdditionalService'}  | ${'OnDemand'}    | ${'Flat'} | ${'../../pages/sections/order-items/additional-services/order-item/flat/ondemand/manifest.json'}
    ${'AdditionalService'}  | ${'Patient'}     | ${'Flat'} | ${'../../pages/sections/order-items/additional-services/order-item/flat/patient/manifest.json'}
    ${'AdditionalService'}  | ${'Declarative'} | ${'Flat'} | ${'../../pages/sections/order-items/additional-services/order-item/flat/declarative/manifest.json'}
    ${'AssociatedService'}  | ${'Declarative'} | ${'Flat'} | ${'../../pages/sections/order-items/associated-services/order-item/flat/declarative/manifest.json'}
  `('should call path.join with the path $expectedPath', ({
    orderItemType, provisioningType, type, expectedPath,
  }) => {
    JSON.parse = jest.fn();
    getSelectedPriceManifest({ orderItemType, provisioningType, type });
    expect(path.join.mock.calls.length).toEqual(1);
    expect(path.join).toHaveBeenCalledWith(__dirname, expectedPath);
  });

  it('should call readFileSync with the expected path', () => {
    JSON.parse = jest.fn();

    const expectedPath = 'expected/path';
    path.join.mockReturnValue(expectedPath);

    getSelectedPriceManifest({ orderItemType: 'Solution', provisioningType: 'Patient', type: 'Flat' });
    expect(fs.readFileSync.mock.calls.length).toEqual(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath);
  });
});

describe('modifyManifestIfOnDemand', () => {
  const selectedPrice = { 
    provisioningType: 'OnDemand',
    timeUnit: {
      name: 'year',
    },
  };
  const selectedEstimationPeriod = 'month';

  it('should set data for provisioning type of on demand', () => {
    const selectedPriceManifest = {
      solutionTable: {
        columnInfo: [{}, { data: 'Quantity per' }],
      },
    };

    modifyManifestIfOnDemand(selectedPrice, selectedPriceManifest, selectedEstimationPeriod);

    expect(selectedPriceManifest.solutionTable.columnInfo[1].data).toEqual('Quantity per month');
  });
  
  it('should set data from selectedPrice timeUnit if no estimation period for provisioning type of on demand', () => {
    const selectedPriceManifest = {
      solutionTable: {
        columnInfo: [{}, { data: 'Quantity per' }],
      },
    };

    modifyManifestIfOnDemand(selectedPrice, selectedPriceManifest, '');

    expect(selectedPriceManifest.solutionTable.columnInfo[1].data).toEqual('Quantity per year');
  });

  it('should not change data for provisioning type is not on demand', () => {
    const selectedPriceManifest = {
      solutionTable: {
        columnInfo: [{}, { data: 'Quantity per' }],
      },
    };

    selectedPrice.provisioningType = 'Per Patient';

    modifyManifestIfOnDemand(selectedPrice, selectedPriceManifest, selectedEstimationPeriod);

    expect(selectedPriceManifest.solutionTable.columnInfo[1].data).toEqual('Quantity per');
  });
});
