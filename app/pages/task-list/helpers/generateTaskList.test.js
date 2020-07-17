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
      title: 'task 2 item 1',
      dependencies: [
        { statusDependencies: ['task1item1'] },
      ],
    }, {
      id: 'task2item2',
      title: 'task 2 item 2',
      dependencies: [
        { statusDependencies: ['task1item1', 'task2item1'] },
      ],
    }],
  }, {
    name: 'task 3',
    sections: [{
      id: 'task3item1',
      title: 'task 3 item 1',
      dependencies: [
        {
          statusDependencies: ['task1item1', 'task2item1', 'task2item2'],
          countDependencies: ['task2item2'],
        },
      ],
    }],
  }, {
    name: 'task 4',
    sections: [{
      id: 'task4item1',
      title: 'task 4 item 1',
      dependencies: [
        {
          statusDependencies: ['task1item1', 'task2item1', 'task2item2', 'task3item1'],
          countDependencies: ['task2item2', 'task3item1'],
        },
        {
          statusDependencies: ['task1item1', 'task2item1', 'task3item1'],
          countDependencies: ['task2item1', 'task2item2'],
        },
      ],
    }],
  }, {
    name: 'task 5',
    sections: [{
      id: 'task5item1',
      title: 'task 5 item 1',
      dependencies: [
        {
          statusDependencies: ['task1item1', 'task2item1', 'task2item2'],
          zeroCountDependencies: ['task2item2'],
        },
      ],
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
    status: 'incomplete',
  },
  {
    id: 'task2item2',
    status: 'incomplete',
  },
];

describe('generateTaskList', () => {
  describe('taskName', () => {
    it('should return taskName for each task in manifest', () => {
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

    it('should construct correct href for item', () => {
      const taskList = generateTaskList({ orderId, taskListManifest });
      let hrefFound;
      taskList.forEach((task, i) => {
        task.items.forEach((item, j) => {
          if (item.href) {
            hrefFound = true;
            expect(item.href)
              .toEqual(`${baseUrl}/organisation/${orderId}/${taskListManifest.tasks[i].sections[j].id}`);
          }
        });
      });
      expect(hrefFound).toBeTruthy();
    });

    it('should show item as complete: true if sectionData has status as complete', () => {
      const taskList = generateTaskList({ orderId, taskListManifest, sectionsData });
      expect(taskList[0].items[0].complete).toBeTruthy();
      expect(taskList[1].items[0].complete).toBeFalsy();
      expect(taskList[1].items[1].complete).toBeFalsy();
    });

    describe('href without sectionData', () => {
      it('should add href to item if the item has no dependencies', () => {
        const taskList = generateTaskList({ orderId, taskListManifest });
        let itemWithNoDependanciesFound;
        taskList.forEach((task, i) => {
          task.items.forEach((item, j) => {
            if (!taskListManifest.tasks[i].sections[j].dependencies) {
              itemWithNoDependanciesFound = true;
              expect(item.href).toBeTruthy();
            }
          });
        });
        expect(itemWithNoDependanciesFound).toBeTruthy();
      });

      it('should not add href to item if the item has dependencies', () => {
        const taskList = generateTaskList({ orderId, taskListManifest });
        let itemWithDependanciesFound;
        taskList.forEach((task, i) => {
          task.items.forEach((item, j) => {
            if (taskListManifest.tasks[i].sections[j].dependencies) {
              itemWithDependanciesFound = true;
              expect(item.href).toBeFalsy();
            }
          });
        });
        expect(itemWithDependanciesFound).toBeTruthy();
      });
    });

    describe('href with sectionData', () => {
      it('should add href to item if the item has no dependencies', () => {
        const taskList = generateTaskList({ orderId, taskListManifest, sectionsData });
        let itemWithNoDependanciesFound;
        taskList.forEach((task, i) => {
          task.items.forEach((item, j) => {
            if (!taskListManifest.tasks[i].sections[j].dependencies) {
              itemWithNoDependanciesFound = true;
              expect(item.href).toBeTruthy();
            }
          });
        });
        expect(itemWithNoDependanciesFound).toBeTruthy();
      });

      it('should add href to item if all dependencies are complete', () => {
        const taskList = generateTaskList({ orderId, taskListManifest, sectionsData });
        expect(taskList[1].items[0].href).toBeTruthy();
      });

      it('should not add href to item if one or more dependencies are incomplete', () => {
        const taskList = generateTaskList({ orderId, taskListManifest, sectionsData });
        expect(taskList[1].items[1].href).toBeFalsy();
      });

      it('should not add href to item if all statusDependencies are complete but countDependencies is 0', () => {
        const sectionDataWithCount = [
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
            status: 'complete',
            count: 0,
          },
        ];
        const taskList = generateTaskList({
          orderId, taskListManifest, sectionsData: sectionDataWithCount,
        });
        expect(taskList[2].items[0].href).toBeFalsy();
      });

      it('should not add href to item if all statusDependencies are complete and zeroCountDependencies is 1', () => {
        const sectionDataWithCount = [
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
            status: 'complete',
            count: 1,
          },
        ];
        const taskList = generateTaskList({
          orderId, taskListManifest, sectionsData: sectionDataWithCount,
        });
        expect(taskList[4].items[0].href).toBeFalsy();
      });

      it('should add href to item if all statusDependencies are complete and zeroCountDependencies is 0', () => {
        const sectionDataWithCount = [
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
            status: 'complete',
            count: 0,
          },
        ];
        const taskList = generateTaskList({
          orderId, taskListManifest, sectionsData: sectionDataWithCount,
        });
        expect(taskList[4].items[0].href).toBeTruthy();
      });

      it('should add href to item if all statusDependencies are complete and countDependencies is > 0', () => {
        const sectionDataWithCount = [
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
            status: 'complete',
            count: 1,
          },
        ];
        const taskList = generateTaskList({
          orderId, taskListManifest, sectionsData: sectionDataWithCount,
        });
        expect(taskList[2].items[0].href).toBeTruthy();
      });
    });

    describe('when a task has mutliple dependencies', () => {
      it('should add href to item if one of the dependencies is met', () => {
        const sectionDataWithCount = [
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
            status: 'complete',
            count: 1,
          },
          {
            id: 'task3item1',
            status: 'complete',
            count: 1,
          },
        ];
        const taskList = generateTaskList({
          orderId, taskListManifest, sectionsData: sectionDataWithCount,
        });
        expect(taskList[3].items[0].href).toBeTruthy();
      });

      it('should not add href to item if none of the dependencies are met', () => {
        const sectionDataWithCount = [
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
            status: 'complete',
            count: 1,
          },
          {
            id: 'task3item1',
            status: 'complete',
          },
        ];
        const taskList = generateTaskList({
          orderId, taskListManifest, sectionsData: sectionDataWithCount,
        });
        expect(taskList[3].items[0].href).toBeFalsy();
      });
    });
  });
});
