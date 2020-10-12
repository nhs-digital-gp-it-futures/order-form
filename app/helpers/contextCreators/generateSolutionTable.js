export const generateSolutionTable = ({
  solutionTable, practiceSize, deliveryDate, errorMap, recipients,
}) => {
  const items = recipients.map(recipient => [
    {
      ...solutionTable.cellInfo.recipient,
      data: recipient.name ? `${recipient.name} (${recipient.odsCode})` : undefined,
      dataTestId: recipient.name ? `${recipient.name}-${recipient.odsCode}-recipient` : undefined,
    },
    {
      ...solutionTable.cellInfo.practiceSize,
      question: {
        ...solutionTable.cellInfo.practiceSize.question,
        data: practiceSize !== undefined ? practiceSize : undefined,
        dataTestId: recipient.name ? `${recipient.name}-${recipient.odsCode}-practiceSize` : undefined,
        error: errorMap && errorMap.practiceSize
          ? { message: errorMap.practiceSize.errorMessages.join(', ') }
          : undefined,
      },
    },
    {
      ...solutionTable.cellInfo.plannedDeliveryDate,
      question: {
        ...solutionTable.cellInfo.plannedDeliveryDate.question,
        data: deliveryDate !== undefined ? deliveryDate : undefined,
        dataTestId: recipient.name ? `${recipient.name}-${recipient.odsCode}-deliveryDate` : undefined,
        error: errorMap && errorMap.plannedDeliveryDate
          ? { message: errorMap.plannedDeliveryDate.errorMessages.join(', ') }
          : undefined,
      },
    },
  ]);

  return ({
    ...solutionTable,
    items,
  });
};
