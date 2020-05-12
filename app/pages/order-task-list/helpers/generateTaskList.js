import { baseUrl } from '../../../config';

export const generateTaskList = ({ orderId, taskListManifest }) => {
  const taskLists = taskListManifest.tasks.map((task) => {
    const items = task.sections.map((section) => {
      const itemHref = section.enabled ? `${baseUrl}/organisation/${orderId}/${section.id}` : undefined;

      return ({
        description: section.title,
        href: itemHref,
      });
    });

    return ({
      taskName: task.name,
      items,
    });
  });

  return taskLists;
};
