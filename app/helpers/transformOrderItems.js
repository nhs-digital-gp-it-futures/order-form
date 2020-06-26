const isOneOff = orderItem => orderItem.catalogueItemType === 'Associated Service'
    && orderItem.provisioningType === 'Declarative';

export const transformOrderItems = (orderItems) => {
  const oneOffCosts = orderItems.filter(o => isOneOff(o));
  const recurringCosts = orderItems.filter(o => !isOneOff(o));

  return { oneOffCosts, recurringCosts };
};
