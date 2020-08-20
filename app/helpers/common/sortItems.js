export const sortItems = (items, propToSort) => (
  items.sort((itemA, itemB) => {
    const itemAPropValue = itemA[propToSort].toLowerCase();
    const itemBPropValue = itemB[propToSort].toLowerCase();

    if (itemAPropValue < itemBPropValue) return -1;
    if (itemAPropValue > itemBPropValue) return 1;
    return 0;
  })
);
