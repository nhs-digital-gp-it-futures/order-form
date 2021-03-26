export const validateSolutionRecipientsForm = ({ data }) => {
  if (data.length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectSolutionRecipients',
      id: 'SelectSolutionRecipientsRequired',
    },
  ];
  return { success: false, errors };
};
