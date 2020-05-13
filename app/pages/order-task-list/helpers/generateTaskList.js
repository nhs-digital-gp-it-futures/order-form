import { baseUrl } from '../../../config';

const convertSectionsDataToDict = ({ sectionsData }) => {
  if (sectionsData && sectionsData.length > 0) {
    const sectionsDataDict = sectionsData.reduce((dict, item) => (
      { ...dict, [item.id]: item }), {});

    return sectionsDataDict;
  }
  return undefined;
};

export const generateTaskList = ({ orderId, taskListManifest, sectionsData }) => {
  const sectionsDataDict = convertSectionsDataToDict({ sectionsData });

  const taskLists = taskListManifest.tasks.map((task) => {
    const items = task.sections.map((section) => {
      const itemHref = section.enabled ? `${baseUrl}/organisation/${orderId}/${section.id}` : undefined;
      const isItemComplete = sectionsDataDict && sectionsDataDict[section.id].status === 'complete' ? true : undefined;

      return ({
        description: section.title,
        href: itemHref,
        complete: isItemComplete,
      });
    });

    return ({
      taskName: task.name,
      items,
    });
  });

  return taskLists;
};
