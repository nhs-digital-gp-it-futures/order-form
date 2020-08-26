import { generateTaskList } from './helpers/generateTaskList';
import taskListManifest from './taskListManifest.json';

const createFakeSectionData = ({
  completedSections,
  catalogueSolutionCount,
  associatedServiceCount,
  additionalServiceCount,
}) => {
  const result = completedSections.map(s => ({ id: s, status: 'complete' }));

  if (catalogueSolutionCount) {
    result.push({
      id: 'catalogue-solutions',
      status: 'complete',
      count: catalogueSolutionCount,
    });
  }

  if (associatedServiceCount) {
    result.push({
      id: 'associated-services',
      status: 'complete',
      count: associatedServiceCount,
    });
  }

  if (additionalServiceCount) {
    result.push({
      id: 'additional-services',
      status: 'complete',
      count: additionalServiceCount,
    });
  }

  return result;
};

describe('taskListManifest', () => {
  describe('funding source', () => {
    const description = ['description'];
    const orderingParty = [...description, 'ordering-party'];
    const supplier = [...orderingParty, 'supplier'];
    const commencementDate = [...supplier, 'commencement-date'];
    const associatedServices = [...commencementDate, 'associated-services'];

    it.each`
      completedSections     | catalogueSolutionCount | associatedServiceCount | additionalServiceCount | expectedEnabled
      ${[]}                 | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${description}        | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${orderingParty}      | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${supplier}           | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${commencementDate}   | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${associatedServices} | ${undefined}           | ${0}                   | ${undefined}           | ${false}
      ${associatedServices} | ${undefined}           | ${1}                   | ${undefined}           | ${true}
      ${associatedServices} | ${0}                   | ${1}                   | ${undefined}           | ${true}
      ${associatedServices} | ${1}                   | ${1}                   | ${undefined}           | ${true}
      ${associatedServices} | ${0}                   | ${0}                   | ${undefined}           | ${false}
      ${associatedServices} | ${1}                   | ${0}                   | ${undefined}           | ${true}
      ${associatedServices} | ${0}                   | ${1}                   | ${1}                   | ${true}
      ${associatedServices} | ${1}                   | ${1}                   | ${1}                   | ${true}
      ${associatedServices} | ${0}                   | ${1}                   | ${0}                   | ${true}
      ${associatedServices} | ${1}                   | ${1}                   | ${1}                   | ${true}
      ${associatedServices} | ${0}                   | ${0}                   | ${0}                   | ${false}
    `('generateTaskList with $completedSections, $catalogueSolutionCount catalogue solution(s), $associatedServiceCount associated service(s) and $additionalServiceCount additional service(s) is enabled: $expectedEnabled', async ({
  completedSections,
  catalogueSolutionCount,
  associatedServiceCount,
  additionalServiceCount,
  expectedEnabled,
}) => {
  const sectionsData = createFakeSectionData({
    completedSections,
    catalogueSolutionCount,
    associatedServiceCount,
    additionalServiceCount,
  });

  const taskList = generateTaskList({
    orderId: 'order-1',
    taskListManifest,
    sectionsData,
  });

  expect(Boolean(taskList[6].items[0].href)).toBe(expectedEnabled);
});
  });
});
