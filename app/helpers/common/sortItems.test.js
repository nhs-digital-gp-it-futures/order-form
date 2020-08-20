import { sortItems } from './sortItems';

describe('sortItems', () => {
  const toSort1 = {
    sortBy: 'A1',
    notSortBy: 'field',
  };

  const toSort2 = {
    sortBy: 'a2',
    notSortBy: 'field',
  };

  const toSort3 = {
    sortBy: 'B1',
    notSortBy: 'field',
  };

  it('should return a list of 1 item sorted by correct key', () => {
    const toSortArray = [toSort1];

    const sortedItems = sortItems(toSortArray, 'sortBy');

    expect(sortedItems).toEqual(toSortArray);
  });

  it('should return a list of 3 items sorted by correct key', () => {
    const sortedArray = [toSort1, toSort2, toSort3];

    const toSortArray = [toSort2, toSort3, toSort1];

    const sortedItems = sortItems(toSortArray, 'sortBy');

    expect(sortedItems).toEqual(sortedArray);
  });
});
