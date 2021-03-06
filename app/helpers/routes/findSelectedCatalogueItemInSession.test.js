import { findSelectedCatalogueItemInSession } from './findSelectedCatalogueItemInSession';

const req = {};
const fakeSessionManager = {};

describe('findSelectedCatalogueItemInSession', () => {
  it('should return the single selected additional service item when found in session', () => {
    const expectedItem = { catalogueItemId: '1' };
    const otherItem = { catalogueItemId: '2' };

    fakeSessionManager.getFromSession = () => [expectedItem, otherItem];

    const foundItem = findSelectedCatalogueItemInSession({
      req,
      sessionManager: fakeSessionManager,
      selectedItemId: expectedItem.catalogueItemId,
      catalogueItemsKey: 'additionalServices',
    });

    expect(foundItem).toEqual(expectedItem);
  });

  it('should return the single selected catalogue solution item when found in session', () => {
    const expectedItem = { catalogueItemId: '1' };
    const otherItem = { catalogueItemId: '2' };

    fakeSessionManager.getFromSession = () => [expectedItem, otherItem];

    const foundItem = findSelectedCatalogueItemInSession({
      req,
      sessionManager: fakeSessionManager,
      selectedItemId: expectedItem.catalogueItemId,
      catalogueItemsKey: 'solutions',
    });

    expect(foundItem).toEqual(expectedItem);
  });

  it('should throw an error when selected id not found in session', () => {
    const expectedItem = { catalogueItemId: '1' };
    const otherItem = { catalogueItemId: '2' };

    fakeSessionManager.getFromSession = () => [otherItem];

    expect(() => findSelectedCatalogueItemInSession({
      req,
      sessionManager: fakeSessionManager,
      selectedItemId: expectedItem.catalogueItemId,
      catalogueItemsKey: 'additionalServices',
    })).toThrow(Error);
  });
});
