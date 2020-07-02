import fs from 'fs';
import path from 'path';
import { getSelectedPriceManifest } from './manifestProvider';

jest.mock('fs');

const onDemandDescription = 'This is the on-demand price manifest.';
const patientDescription = 'This is the on-demand price manifest.';
const onDemandManifestFile = `{"description": "${onDemandDescription}"}`;
const patientManifestFile = `{"description": "${patientDescription}"}`;
const onDemandManifest = { description: onDemandDescription };
const patientManifest = { description: patientDescription };

describe('getSelectedPriceManifest', () => {
  afterEach(() => {
    fs.readFileSync.mockReset();
  });

  it.each`
    provisioningType | manifestFile            | expectedResult
    ${'OnDemand'}    | ${onDemandManifestFile} | ${onDemandManifest}
    ${'Patient'}     | ${patientManifestFile}  | ${patientManifest}
    `('getPriceManifest $provisioningType returns expected result', ({ provisioningType, manifestFile, expectedResult }) => {
  fs.readFileSync.mockReturnValue(manifestFile);
  expect(getSelectedPriceManifest(provisioningType)).toEqual(expectedResult);
});

  it.each`
    provisioningType | expectedPath
    ${'OnDemand'}    | ${'/ondemand/manifest.json'}
    ${'Patient'}     | ${'/patient/manifest.json'}
    `('should call readFileSync with the path $expectedPath', ({ provisioningType, expectedPath }) => {
  JSON.parse = jest.fn();
  getSelectedPriceManifest(provisioningType);
  expect(fs.readFileSync.mock.calls.length).toEqual(1);
  expect(fs.readFileSync).toHaveBeenCalledWith(path.join(__dirname, expectedPath));
});
});
