export const generateSolutionTable = ({
  solutionTable, practiceSize, deliveryDate, errorMap, recipients, errorMessages,
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
        ...solutionTable.cellInfo.practiceSize,
        question: {
          ...solutionTable.cellInfo.practiceSize.question,
          data: practiceSize !== undefined ? practiceSize[i] : undefined,
          dataTestId: recipient.name ? `${recipient.name}-${recipient.odsCode}-practiceSize` : undefined,
          error: errorMap && errorMap.practiceSize
            ? { message: errorMap.practiceSize.errorMessages.join(', ') }
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
