const isOneOff = orderItem => orderItem.catalogueItemType === 'Associated Service'
    && orderItem.provisioningType === 'Declarative';

export const transformOrderItems = (orderItems = []) => {
  const oneOffCostItems = orderItems.filter(o => isOneOff(o));
  const recurringCostItems = orderItems.filter(o => !isOneOff(o));

  return { oneOffCostItems, recurringCostItems };
};
