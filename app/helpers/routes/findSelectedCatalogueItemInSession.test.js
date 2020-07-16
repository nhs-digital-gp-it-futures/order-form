import { findSelectedCatalogueItemInSession } from './findSelectedCatalogueItemInSession';

const req = {};
const fakeSessionManager = {};

describe('findSelectedCatalogueItemInSession', () => {
  it('should return the single selected item when found in session', () => {
    const expectedItem = { additionalServiceId: '1' };
    const otherItem = { additionalServiceId: '2' };

    fakeSessionManager.getFromSession = () => [expectedItem, otherItem];

    const foundItem = findSelectedCatalogueItemInSession({
      req,
      sessionManager: fakeSessionManager,
      selectedItemId: expectedItem.additionalServiceId,
      catalogueItemsKey: 'additionalServices',
    });

    expect(foundItem).toEqual(expectedItem);
  });

  it('should throw an error when selected id not found in session', () => {
    const expectedItem = { additionalServiceId: '1' };
    const otherItem = { additionalServiceId: '2' };

    fakeSessionManager.getFromSession = () => [otherItem];

    expect(() => findSelectedCatalogueItemInSession({
      req,
      sessionManager: fakeSessionManager,
      selectedItemId: expectedItem.additionalServiceId,
      catalogueItemsKey: 'additionalServices',
    })).toThrow(Error);
  });
});
