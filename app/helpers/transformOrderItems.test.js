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

const additionalServiceOnDemand = {
  catalogueItemType: 'Additional Service',
  itemId: 'C000001-01-A10001-3',
  provisioningType: 'On Demand',
};

const additionalServicePatient = {
  catalogueItemType: 'Additional Service',
  itemId: 'C000001-01-A10001-4',
  provisioningType: 'Patient',
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

const recurringAdditionalServices = [additionalServiceOnDemand, additionalServicePatient];
const bothAssociatedServices = [associatedService1, associatedService2];
const bothSolutions = [solution1, solution2];
const allItems = [additionalService1, additionalService2,
  associatedService1, associatedService2,
  additionalServicePatient, additionalServiceOnDemand,
  solution1, solution2];

const allRecurringCosts = [solution1, solution2,
  additionalService1, additionalService2,
  additionalServiceOnDemand, additionalServicePatient];

describe('transformOrderItems', () => {
  it.each`
    orderItems                     | expected
    ${[associatedService1]}        | ${{ oneOffCosts: [associatedService1], recurringCosts: [] }}
    ${[additionalService1]}        | ${{ oneOffCosts: [], recurringCosts: [additionalService1] }}
    ${[solution1]}                 | ${{ oneOffCosts: [], recurringCosts: [solution1] }}
    ${bothAssociatedServices}       | ${{ oneOffCosts: bothAssociatedServices, recurringCosts: [] }}
    ${bothSolutions}                | ${{ oneOffCosts: [], recurringCosts: [solution1, solution2] }}
    ${recurringAdditionalServices} | ${{ oneOffCosts: [], recurringCosts: recurringAdditionalServices }}
    ${allItems}                    | ${{ oneOffCosts: bothAssociatedServices, recurringCosts: allRecurringCosts }}
  `('transformOrderItems returns expected', ({ orderItems, expected }) => {
  expect(transformOrderItems(orderItems)).toEqual(expected);
});
});
