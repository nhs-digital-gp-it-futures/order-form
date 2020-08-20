import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';

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
  orderId, serviceRecipientsData = [], selectedRecipientIdsData = [], selectStatus,
}) => {
  const toggledStatus = selectStatus === 'select' ? 'deselect' : 'select';
  return {
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    serviceRecipientsTable: generateServiceRecipientsTable({
      selectStatus,
      serviceRecipientsTable: manifest.serviceRecipientsTable,
      serviceRecipientsData,
      selectedRecipientIdsData,
    }),
    selectDeselectButtonAction: `${baseUrl}/organisation/${orderId}/service-recipients`,
    selectStatus: toggledStatus,
    selectDeselectButtonText: manifest.selectDeselectButtonText[toggledStatus]
      || manifest.selectDeselectButtonText.select,
  };
};
