// import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { addParamsToManifest } from '../../../../../../helpers/contextCreators/addParamsToManifest';
import { generateErrorMap } from '../../../../../../helpers/contextCreators/generateErrorMap';
import { generateErrorSummary } from '../../../../../../helpers/contextCreators/generateErrorSummary';

const getCheckedStatus = ({ selectStatus, serviceRecipient, selectedRecipientIdsData = [] }) => {
  if (selectStatus === 'select') return true;
  if (selectStatus === 'deselect') return false;
  return !!selectedRecipientIdsData
    .find((checkedRecipient) => checkedRecipient === serviceRecipient.odsCode);
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
  solutionPrices,
  errorMap,
  manifest,
  orderType,
  odsCode,
}) => {
  const toggledStatus = selectStatus === 'select' ? 'deselect' : 'select';
  const errorMessages = errorMap && errorMap.selectSolutionRecipients.errorMessages;
  const orderIdUrl = `${baseUrl}/organisation/${odsCode}/order/${orderId}`;
  return {
    ...addParamsToManifest(manifest, { itemName, orderId }),
    backLinkHref: ((solutionPrices || {}).prices || {}).length === 1 ? `${orderIdUrl}/${orderType}/select/solution` : `${orderIdUrl}/${orderType}/select/solution/price`,
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
    selectDeselectButtonAction: `${orderIdUrl}/catalogue-solutions/select/solution/price/recipients`,
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
  solutionPrices,
  validationErrors,
  manifest,
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
    solutionPrices,
    manifest,
    errorMap,
  });

  const errorSummary = generateErrorSummary({ errorMap });

  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
