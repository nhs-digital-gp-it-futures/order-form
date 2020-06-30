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
    ${'single declarative associated service'}   | ${[associatedService1]}        | ${{ oneOffCostItems: [associatedService1], recurringCostItems: [] }}
    ${'single additional service'}               | ${[additionalService1]}        | ${{ oneOffCostItems: [], recurringCostItems: [additionalService1] }}
    ${'single solution'}                         | ${[solution1]}                 | ${{ oneOffCostItems: [], recurringCostItems: [solution1] }}
    ${'two declarative associated services'}     | ${oneOffAssociatedServices}    | ${{ oneOffCostItems: oneOffAssociatedServices, recurringCostItems: [] }}
    ${'two solutions'}                           | ${bothSolutions}               | ${{ oneOffCostItems: [], recurringCostItems: bothSolutions }}
    ${'two non-declarative associated services'} | ${recurringAssociatedServices} | ${{ oneOffCostItems: [], recurringCostItems: recurringAssociatedServices }}
    ${'multiple one-off and recurring items'}    | ${allItems}                    | ${{ oneOffCostItems: oneOffAssociatedServices, recurringCostItems: allRecurringCosts }}
  `('transformOrderItems $key returns expected output', ({ orderItems, expected }) => {
  expect(transformOrderItems(orderItems)).toEqual(expected);
});

  it('returns when there are no order items', () => {
    expect(transformOrderItems()).toEqual({ oneOffCostItems: [], recurringCostItems: [] });
  });
});
