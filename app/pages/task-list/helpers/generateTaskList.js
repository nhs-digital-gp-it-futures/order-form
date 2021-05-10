import { baseUrl } from '../../../config';

const convertDataToDict = ({ sectionsData }) => (sectionsData && sectionsData.length > 0
  ? sectionsData.reduce((dict, item) => ({ ...dict, [item.id]: item }), {})
  : undefined);

const areAllStatusDepedenciesMet = (dataDict, statusDependencies = []) => (
  statusDependencies.length > 0
    ? statusDependencies
      .map((statusDependency) => (
        !!dataDict[statusDependency] && dataDict[statusDependency].status === 'complete'))
      .every((dependencyMet) => dependencyMet === true)
    : true
);

const areAllCountDepedenciesMet = (dataDict, countDependencies = []) => (
  countDependencies.length > 0
    ? countDependencies
      .map((countDependency) => (
        !!dataDict[countDependency] && dataDict[countDependency].count > 0))
      .every((dependencyMet) => dependencyMet === true)
    : true
);

const areAllZeroCountDepedenciesMet = (dataDict, zeroCountDependencies = []) => (
  zeroCountDependencies.length > 0
    ? zeroCountDependencies
      .map((zeroCountDependency) => (
        !!dataDict[zeroCountDependency] && dataDict[zeroCountDependency].count === 0))
      .every((dependencyMet) => dependencyMet === true)
    : true
);

const isSectionEnabled = (dataDict = {}, dependencies = []) => (
  dependencies.length > 0
    ? dependencies
      .map((dependency) => (
        areAllStatusDepedenciesMet(dataDict, dependency.statusDependencies)
          && areAllCountDepedenciesMet(dataDict, dependency.countDependencies)
          && areAllZeroCountDepedenciesMet(dataDict, dependency.zeroCountDependencies)))
      .includes(true)
    : true
);

const isSectionComplete = (sectionsDataDict = {}, section = {}) => (
  !!(sectionsDataDict
    && sectionsDataDict[section.id]
    && sectionsDataDict[section.id].status === 'complete')
);

export const generateTaskList = ({
  orderId, taskListManifest, sectionsData, odsCode,
}) => {
  const sectionsDataDict = convertDataToDict({ sectionsData });
  const taskLists = taskListManifest.tasks.map((task) => ({
    taskName: task.name,
    items: task.sections.map((section) => ({
      description: section.title,
      href: isSectionEnabled(
        sectionsDataDict, section.dependencies,
      )
        ? `${baseUrl}/organisation/${odsCode}/order/${orderId}/${section.id}`
        : undefined,
      complete: isSectionComplete(sectionsDataDict, section),
    })),
  }));
  return taskLists;
};
