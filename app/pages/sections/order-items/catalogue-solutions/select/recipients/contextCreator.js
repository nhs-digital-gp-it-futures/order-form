import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { addParamsToManifest } from '../../../../../../helpers/contextCreators/addParamsToManifest';
import { generateErrorMap } from '../../../../../../helpers/contextCreators/generateErrorMap';
import { generateErrorSummary } from '../../../../../../helpers/contextCreators/generateErrorSummary';

const getCheckedStatus = ({ selectStatus, serviceRecipient, selectedRecipientIdsData = [] }) => {
  if (selectStatus === 'select') return true;
  if (selectStatus === 'deselect') return false;
  return !!selectedRecipientIdsData
    .find(checkedRecipient => checkedRecipient.odsCode === serviceRecipient.odsCode);
};

const generateItems = ({
  selectStatus,
  serviceRecipientsData,
  selectedRecipientIdsData,
  serviceRecipientsTable,
}) => {
  const items = serviceRecipientsData.map((serviceRecipient) => {
    const columns = [];
    columns.push(({
      ...serviceRecipientsTable.cellInfo.organisation,
      question: {
        ...serviceRecipientsTable.cellInfo.organisation.question,
        checked: getCheckedStatus({ selectStatus, serviceRecipient, selectedRecipientIdsData }),
        id: `${serviceRecipient.odsCode}-organisationName`,
        name: serviceRecipient.odsCode,
        value: serviceRecipient.name,
        text: serviceRecipient.name,
      },
      dataTestId: `${serviceRecipient.odsCode}-organisationName`,
    }));
    columns.push(({
      ...serviceRecipientsTable.cellInfo.odsCode,
      data: serviceRecipient.odsCode,
      dataTestId: `${serviceRecipient.odsCode}-odsCode`,
    }));
    return columns;
  });
  return items;
};

const generateServiceRecipientsTable = ({
  selectStatus,
  serviceRecipientsTable,
  serviceRecipientsData,
  selectedRecipientIdsData,
}) => ({
  ...serviceRecipientsTable,
  items: generateItems({
    selectStatus,
    serviceRecipientsData,
    selectedRecipientIdsData,
    serviceRecipientsTable,
  }),
});

export const getContext = ({
  orderId,
  itemName,
  serviceRecipientsData = [],
  selectedRecipientIdsData = [],
  selectStatus,
  errorMap,
}) => {
  const toggledStatus = selectStatus === 'select' ? 'deselect' : 'select';
  const errorMessages = errorMap && errorMap.selectSolutionRecipients.errorMessages.join(', ');
  return {
    ...addParamsToManifest(manifest, { itemName, orderId }),
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    question: {
      selectSolutionRecipients: {
        id: manifest.question.selectSolutionRecipients.id,
        recipientsTable: generateServiceRecipientsTable({
          selectStatus,
          serviceRecipientsTable: manifest.question.selectSolutionRecipients.recipientsTable,
          serviceRecipientsData,
          selectedRecipientIdsData,
        }),
        errorMessages,
      },
    },
    selectDeselectButtonAction: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients`,
    selectStatus: toggledStatus,
    selectDeselectButtonText: manifest.selectDeselectButtonText[toggledStatus]
      || manifest.selectDeselectButtonText.select,
  };
};

export const getErrorContext = ({
  orderId,
  itemName,
  serviceRecipientsData = [],
  selectedRecipientIdsData = [],
  selectStatus,
  validationErrors,
}) => {
  const errorMap = generateErrorMap({
    validationErrors,
    errorMessagesFromManifest: manifest.errorMessages,
  });

  const contextWithErrors = getContext({
    orderId,
    itemName,
    serviceRecipientsData,
    selectedRecipientIdsData,
    selectStatus,
    errorMap,
  });

  const errorSummary = generateErrorSummary({ errorMap });

  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
