import fs from 'fs';
import path from 'path';
import { getSelectedPriceManifest } from './manifestProvider';

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
    expect(getSelectedPriceManifest({ orderItemType: 'solution', provisioningType: 'OnDemand', type: 'Flat' })).toEqual(manifest);
  });

  it.each`
    orderItemType             | provisioningType | type      | expectedPath
    ${'solution'}  | ${'OnDemand'}    | ${'Flat'} | ${'../../pages/sections/solution/order-item/flat/ondemand/manifest.json'}
    ${'solution'}  | ${'Patient'}     | ${'Flat'} | ${'../../pages/sections/solution/order-item/flat/patient/manifest.json'}
    ${'solution'}  | ${'Declarative'} | ${'Flat'} | ${'../../pages/sections/solution/order-item/flat/declarative/manifest.json'}
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

    getSelectedPriceManifest({ orderItemType: 'solution', provisioningType: 'Patient', type: 'Flat' });
    expect(fs.readFileSync.mock.calls.length).toEqual(1);
    expect(fs.readFileSync).toHaveBeenCalledWith(expectedPath);
  });
});
