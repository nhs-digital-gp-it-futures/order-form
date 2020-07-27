import { generateTaskList } from './helpers/generateTaskList';
import taskListManifest from './taskListManifest.json';

const createFakeSectionData = ({
  completedSections,
  serviceRecipientCount,
  catalogueSolutionCount,
  associatedServiceCount,
  additionalServiceCount,
}) => {
  const result = completedSections.map(s => ({ id: s, status: 'complete' }));

  if (serviceRecipientCount) {
    result.push({
      id: 'service-recipients',
      status: 'complete',
      count: serviceRecipientCount,
    });
  }

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
    const serviceRecipients = [...commencementDate, 'service-recipients'];
    const associatedServices = [...serviceRecipients, 'associated-services'];

    it.each`
      completedSections     | serviceRecipientCount | catalogueSolutionCount | associatedServiceCount | additionalServiceCount | expectedEnabled
      ${[]}                 | ${0}                  | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${description}        | ${0}                  | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${orderingParty}      | ${0}                  | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${supplier}           | ${0}                  | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${commencementDate}   | ${0}                  | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${serviceRecipients}  | ${0}                  | ${0}                   | ${0}                   | ${0}                   | ${false}
      ${serviceRecipients}  | ${1}                  | ${1}                   | ${undefined}           | ${1}                   | ${false}
      ${associatedServices} | ${0}                  | ${undefined}           | ${0}                   | ${undefined}           | ${false}
      ${associatedServices} | ${0}                  | ${undefined}           | ${1}                   | ${undefined}           | ${true}
      ${associatedServices} | ${0}                  | ${0}                   | ${1}                   | ${undefined}           | ${true}
      ${associatedServices} | ${0}                  | ${1}                   | ${1}                   | ${undefined}           | ${true}
      ${associatedServices} | ${1}                  | ${0}                   | ${0}                   | ${undefined}           | ${false}
      ${associatedServices} | ${1}                  | ${1}                   | ${0}                   | ${undefined}           | ${true}
      ${associatedServices} | ${1}                  | ${0}                   | ${1}                   | ${1}                   | ${true}
      ${associatedServices} | ${1}                  | ${1}                   | ${1}                   | ${1}                   | ${true}
      ${associatedServices} | ${0}                  | ${0}                   | ${1}                   | ${0}                   | ${true}
      ${associatedServices} | ${0}                  | ${1}                   | ${1}                   | ${1}                   | ${true}
      ${associatedServices} | ${0}                  | ${0}                   | ${0}                   | ${0}                   | ${false}
    `('generateTaskList with $completedSections, $serviceRecipientCount service recipient(s), $catalogueSolutionCount catalogue solution(s), $associatedServiceCount associated service(s) and $additionalServiceCount additional service(s) is enabled: $expectedEnabled', async ({
  completedSections,
  serviceRecipientCount,
  catalogueSolutionCount,
  associatedServiceCount,
  additionalServiceCount,
  expectedEnabled,
}) => {
  const sectionsData = createFakeSectionData({
    completedSections,
    serviceRecipientCount,
    catalogueSolutionCount,
    associatedServiceCount,
    additionalServiceCount,
  });

  const taskList = generateTaskList({
    orderId: 'order-1', taskListManifest, sectionsData,
  });

  expect(Boolean(taskList[7].items[0].href)).toBe(expectedEnabled);
});
  });
});
