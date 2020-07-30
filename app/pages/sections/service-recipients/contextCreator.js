import manifest from './manifest.json';
import { baseUrl } from '../../../config';

const getCheckedStatus = ({ selectStatus, data, selectedRecipientIdsData = [] }) => {
  if (selectStatus === 'select') return true;
  if (selectStatus === 'deselect') return false;
  return !!selectedRecipientIdsData
    .find(checkedRecipient => checkedRecipient.odsCode === data.odsCode);
};

const generateItems = ({
  selectStatus,
  serviceRecipientsData,
  selectedRecipientIdsData,
}) => {
  const items = serviceRecipientsData.map((serviceRecipient) => {
    const columns = [];
    columns.push(({
      question: {
        dataTestId: `${serviceRecipient.name}-organisationName`,
        checked: getCheckedStatus({ selectStatus, serviceRecipient, selectedRecipientIdsData }),
        type: 'checkbox',
        id: `${serviceRecipient.name}-organisationName`,
        name: serviceRecipient.odsCode,
        value: serviceRecipient.name,
        text: serviceRecipient.name,
      },
      classes: 'nhsuk-u-font-size-12',
    }));
    columns.push(({
      data: serviceRecipient.odsCode,
      dataTestId: `${serviceRecipient.odsCode}-odsCode`,
    }));
    return columns;
  });
  return items;
};

const generateAddedOrderItemsTable = ({
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
    serviceRecipientsTable: generateAddedOrderItemsTable({
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
