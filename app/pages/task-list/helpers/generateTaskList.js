import { baseUrl } from '../../../config';

const convertDataToDict = ({ sectionsData }) => (sectionsData && sectionsData.length > 0
  ? sectionsData.reduce((dict, item) => ({ ...dict, [item.id]: item }), {})
  : undefined);

const areAllStatusDepedenciesMet = (dataDict, statusDependencies = []) => (
  statusDependencies.length > 0 ? !statusDependencies.find(
    statusDependency => !dataDict[statusDependency]
      || (dataDict[statusDependency] && dataDict[statusDependency].status === 'incomplete'),
  ) : true
);

const areAllCountDepedenciesMet = (dataDict, countDependencies = []) => (
  countDependencies.length > 0 ? !countDependencies.find(
    countDependency => !dataDict[countDependency]
      || (dataDict[countDependency] && dataDict[countDependency].count === 0),
  ) : true
);

const isSectionEnabled = (dataDict = {}, dependencies = []) => (
  dependencies.length > 0
    ? dependencies.map(dependency => (
      areAllStatusDepedenciesMet(dataDict, dependency.statusDependencies)
          && areAllCountDepedenciesMet(dataDict, dependency.countDependencies)))
      .includes(true)
    : true
);

const isSectionComplete = (sectionsDataDict = {}, section = {}) => !!(sectionsDataDict && sectionsDataDict[section.id] && sectionsDataDict[section.id].status === 'complete');

export const generateTaskList = ({ orderId, taskListManifest, sectionsData }) => {
  const sectionsDataDict = convertDataToDict({ sectionsData });
  const taskLists = taskListManifest.tasks.map(task => ({
    taskName: task.name,
    items: task.sections.map(section => ({
      description: section.title,
      href: isSectionEnabled(
        sectionsDataDict, section.dependencies,
      )
        ? `${baseUrl}/organisation/${orderId}/${section.id}`
        : undefined,
      complete: isSectionComplete(sectionsDataDict, section),
    })),
  }));
  return taskLists;
};
