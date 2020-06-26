import { transformOrderItems } from './transformOrderItems';

const additionalService1 = {
  catalogueItemType: 'Additional Service',
  itemId: 'C000001-01-A10001-1',
  provisioningType: 'Declarative',
};

const additionalService2 = {
  catalogueItemType: 'Additional Service',
  itemId: 'C000001-01-A10001-2',
  provisioningType: 'Declarative',
};

const associatedService1 = {
  catalogueItemType: 'Associated Service',
  itemId: 'C000001-01-08E-1',
  provisioningType: 'Declarative',
};

const associatedService2 = {
  catalogueItemType: 'Associated Service',
  itemId: 'C000001-01-08E-2',
  provisioningType: 'Declarative',
};

const associatedServiceOnDemand = {
  catalogueItemType: 'Associated Service',
  itemId: 'C000001-01-08E-3',
  provisioningType: 'On Demand',
};

const associatedServicePatient = {
  catalogueItemType: 'Associated Service',
  itemId: 'C000001-01-08E-4',
  provisioningType: 'Patient',
};

const solution1 = {
  catalogueItemType: 'Solution',
  itemId: 'C000001-01-10001-1',
  provisioningType: 'Declarative',
};

const solution2 = {
  catalogueItemType: 'Solution',
  itemId: 'C000001-01-10001-2',
  provisioningType: 'Declarative',
};

const bothSolutions = [solution1, solution2];
const oneOffAssociatedServices = [associatedService1, associatedService2];
const recurringAssociatedServices = [associatedServiceOnDemand, associatedServicePatient];

const allItems = [solution1, solution2,
  associatedService1, associatedService2,
  associatedServiceOnDemand, associatedServicePatient,
  additionalService1, additionalService2];

const allRecurringCosts = [solution1, solution2,
  associatedServiceOnDemand, associatedServicePatient,
  additionalService1, additionalService2];

describe('transformOrderItems', () => {
  it.each`
    key                                          | orderItems                     | expected
    ${'single declarative associated service'}   | ${[associatedService1]}        | ${{ oneOffCosts: [associatedService1], recurringCosts: [] }}
    ${'single additional service'}               | ${[additionalService1]}        | ${{ oneOffCosts: [], recurringCosts: [additionalService1] }}
    ${'single solution'}                         | ${[solution1]}                 | ${{ oneOffCosts: [], recurringCosts: [solution1] }}
    ${'two declarative associated services'}     | ${oneOffAssociatedServices}    | ${{ oneOffCosts: oneOffAssociatedServices, recurringCosts: [] }}
    ${'two solutions'}                           | ${bothSolutions}               | ${{ oneOffCosts: [], recurringCosts: bothSolutions }}
    ${'two non-declarative associated services'} | ${recurringAssociatedServices} | ${{ oneOffCosts: [], recurringCosts: recurringAssociatedServices }}
    ${'multiple one-off and recurring items'}    | ${allItems}                    | ${{ oneOffCosts: oneOffAssociatedServices, recurringCosts: allRecurringCosts }}
  `('transformOrderItems $key returns expected output', ({ orderItems, expected }) => {
  expect(transformOrderItems(orderItems)).toEqual(expected);
});
});
