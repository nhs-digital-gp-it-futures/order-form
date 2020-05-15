import { generateTaskList } from './generateTaskList';
import { baseUrl } from '../../../config';

const orderId = 'neworder';

const taskListManifest = {
  tasks: [{
    name: 'task 1',
    sections: [{
      id: 'task1item1',
      title: 'task 1 item 1',
    }],
  }, {
    name: 'task 2',
    sections: [{
      id: 'task2item1',
      title: 'task 1 item 1',
      dependencies: ['task1item1'],
    }, {
      id: 'task2item2',
      title: 'task 1 item 2',
      dependencies: ['task1item1', 'task2item1'],
    }],
  }],
};

const sectionsData = [
  {
    id: 'task1item1',
    status: 'complete',
  },
  {
    id: 'task2item1',
    status: 'complete',
  },
  {
    id: 'task2item2',
    status: 'incomplete',
  },
];
// [
//   { taskName: 'task 1', items: [ [Object] ] },
//   { taskName: 'task 2', items: [ [Object], [Object] ] }
// ]
describe('generateTaskList', () => {
  describe('taskName', () => {
    it('should return task.name as taskName in tasks array for each task in manifest', () => {
      const taskList = generateTaskList({ orderId, taskListManifest });
      taskList.forEach((task, i) => {
        expect(task.taskName).toEqual(taskListManifest.tasks[i].name);
      });
    });
  });

  describe('items', () => {
    it('should return an items array with the same number of items as section in the manifest for each task', () => {
      const taskList = generateTaskList({ orderId, taskListManifest });
      taskList.forEach((task, i) => {
        expect(task.items.length).toEqual(taskListManifest.tasks[i].sections.length);
      });
    });

    it('should return the title of the item in the manifest as description', () => {
      const taskList = generateTaskList({ orderId, taskListManifest });
      taskList.forEach((task, i) => {
        task.items.forEach((item, j) => {
          expect(item.description)
            .toEqual(taskListManifest.tasks[i].sections[j].title);
        });
      });
    });

    it('should not add href to item if no section data is available if the item has dependencies', () => {
      const taskList = generateTaskList({ orderId, taskListManifest });
      taskList.forEach((task, i) => {
        task.items.forEach((item, j) => {
          if (taskListManifest.tasks[i].sections[j].dependencies) expect(item.href).toBeFalsy();
        });
      });
    });

    it('should add href to item if no section data is available if the item has no dependencies', () => {
      const taskList = generateTaskList({ orderId, taskListManifest });
      taskList.forEach((task, i) => {
        task.items.forEach((item, j) => {
          if (!taskListManifest.tasks[i].sections[j].dependencies) expect(item.href).toBeTruthy();
        });
      });
    });

    it('should construct correct href for item', () => {
      const taskList = generateTaskList({ orderId, taskListManifest });
      taskList.forEach((task, i) => {
        task.items.forEach((item, j) => {
          if (item.href) {
            expect(item.href)
              .toEqual(`${baseUrl}/organisation/${orderId}/${taskListManifest.tasks[i].sections[j].id}`);
          }
        });
      });
    });

    it('should show item as complete: true if sectionData has status as complete', () => {
      const taskList = generateTaskList({ orderId, taskListManifest, sectionsData });
      expect(taskList[0].items[0].complete).toBeTruthy();
      expect(taskList[1].items[0].complete).toBeTruthy();
      expect(taskList[1].items[1].complete).toBeFalsy();
    });
  });
});
