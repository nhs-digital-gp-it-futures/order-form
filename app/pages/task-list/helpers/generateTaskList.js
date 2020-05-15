import { baseUrl } from '../../../config';

const convertDataToDict = ({ sectionsData }) => (sectionsData && sectionsData.length > 0
  ? sectionsData.reduce((dict, item) => ({ ...dict, [item.id]: item }), {})
  : undefined);

const isSectionEnabled = (dataDict = {}, dependencies = []) => (
  dependencies.length > 0 ? !dependencies.find(
    dependency => !dataDict[dependency] || (dataDict[dependency] && dataDict[dependency].status === 'incomplete'),
  ) : true);

const isSectionComplete = (sectionsDataDict = {}, section = []) => !!(sectionsDataDict && sectionsDataDict[section.id] && sectionsDataDict[section.id].status === 'complete');

export const generateTaskList = ({ orderId, taskListManifest, sectionsData }) => {
  const sectionsDataDict = convertDataToDict({ sectionsData });
  const taskLists = taskListManifest.tasks.map(task => ({
    taskName: task.name,
    items: task.sections.map(section => ({
      description: section.title,
      href: isSectionEnabled(sectionsDataDict, section.dependencies) ? `${baseUrl}/organisation/${orderId}/${section.id}` : undefined,
      complete: isSectionComplete(sectionsDataDict, section),
    })),
  }));
  return taskLists;
};
