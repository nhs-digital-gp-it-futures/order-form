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
});
