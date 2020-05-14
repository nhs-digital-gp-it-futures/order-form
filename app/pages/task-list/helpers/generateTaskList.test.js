import { generateTaskList } from './generateTaskList';
import { baseUrl } from '../../../config';

describe('generateTaskList', () => {
  it('should return a taskList of 1 task and 1 item', () => {
    const expectedTaskList = [
      {
        taskName: 'some task name',
        items: [
          {
            description: 'some item description',
          },
        ],
      },
    ];

    const taskListManifest = {
      tasks: [
        {
          name: 'some task name',
          sections: [
            {
              id: 'some-section',
              title: 'some item description',
            },
          ],
        },
      ],
    };

    const taskList = generateTaskList({ orderId: 'neworder', taskListManifest });

    expect(taskList).toEqual(expectedTaskList);
  });

  it('should return a href for the section if enabled', () => {
    const expectedTaskList = [
      {
        taskName: 'some task name',
        items: [
          {
            description: 'some item description',
            href: `${baseUrl}/organisation/neworder/some-section`,
          },
        ],
      },
    ];

    const taskListManifest = {
      tasks: [
        {
          name: 'some task name',
          sections: [
            {
              id: 'some-section',
              title: 'some item description',
              enabled: true,
            },
          ],
        },
      ],
    };

    const taskList = generateTaskList({ orderId: 'neworder', taskListManifest });

    expect(taskList).toEqual(expectedTaskList);
  });

  describe('when sectionsData is provided', () => {
    it('should set the item as "complete" if "status: complete" is passed in for that section', () => {
      const expectedTaskList = [
        {
          taskName: 'some task name',
          items: [
            {
              description: 'some item description',
              href: `${baseUrl}/organisation/neworder/some-section`,
              complete: true,
            },
            {
              description: 'some other item description',
              complete: false,
            },
          ],
        },
      ];

      const taskListManifest = {
        tasks: [
          {
            name: 'some task name',
            sections: [
              {
                id: 'some-section',
                title: 'some item description',
                enabled: true,
              },
              {
                id: 'some-other-section',
                title: 'some other item description',
              },
            ],
          },
        ],
      };

      const sectionsData = [
        {
          id: 'some-section',
          status: 'complete',
        },
        {
          id: 'some-other-section',
          status: 'incomplete',
        },
      ];

      const taskList = generateTaskList({ orderId: 'neworder', taskListManifest, sectionsData });

      expect(taskList).toEqual(expectedTaskList);
    });
  });
});
