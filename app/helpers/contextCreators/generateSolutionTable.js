export const generateSolutionTable = ({
  solutionTable, quantity, deliveryDate, errorMap, recipients, errorMessages,
}) => {
  const items = recipients.map((recipient, index) => {
    const i = deliveryDate.length === 1 ? 0 : index;
    return [
      {
        ...solutionTable.cellInfo.recipient,
        data: recipient.name ? `${recipient.name} (${recipient.odsCode})` : undefined,
        dataTestId: recipient.name ? `${recipient.name}-${recipient.odsCode}-recipient` : undefined,
      },
      {
        ...solutionTable.cellInfo.quantity,
        question: {
          ...solutionTable.cellInfo.quantity.question,
          data: quantity !== undefined ? quantity[i] : undefined,
          dataTestId: recipient.name ? `${recipient.name}-${recipient.odsCode}-quantity` : undefined,
          error: errorMap && errorMap.quantity
            ? { message: errorMap.quantity.errorMessages.join(', ') }
            : undefined,
        },
      },
      {
        ...solutionTable.cellInfo.deliveryDate,
        question: {
          ...solutionTable.cellInfo.deliveryDate.question,
          data: deliveryDate !== undefined ? { day: deliveryDate[i]['deliveryDate-day'], month: deliveryDate[i]['deliveryDate-month'], year: deliveryDate[i]['deliveryDate-year'] } : undefined,
          dataTestId: recipient.name ? `${recipient.name}-${recipient.odsCode}-deliveryDate` : undefined,
          error: errorMap && errorMap.deliveryDate
            ? { message: errorMap.deliveryDate.errorMessages.join(', ') }
            : undefined,
        },
      },
    ];
  });

  return ({
    ...solutionTable,
    items,
    errorMessages,
  });
};
