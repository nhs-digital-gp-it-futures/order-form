import manifest from './manifest.json';
import { baseUrl } from '../../../config';

const getCheckedStatus = ({ selectStatus, data, selectedRecipientIdsData = [] }) => {
  if (selectStatus === 'select') return true;
  if (selectStatus === 'deselect') return false;
  return !!selectedRecipientIdsData
    .find(checkedRecipient => checkedRecipient.odsCode === data.odsCode);
};

const formatTableData = ({
  selectStatus, serviceRecipientsData, selectedRecipientIdsData,
}) => serviceRecipientsData
  .map(data => ({
    organisationName: {
      id: data.odsCode,
      name: data.odsCode,
      value: data.name,
      text: data.name,
      checked: getCheckedStatus({ selectStatus, data, selectedRecipientIdsData }),
    },
    odsCode: data.odsCode,
  }));

export const getContext = ({
  orderId, serviceRecipientsData = [], selectedRecipientIdsData = [], selectStatus,
}) => {
  const toggledStatus = selectStatus === 'select' ? 'deselect' : 'select';
  return {
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    tableData: formatTableData({
      selectStatus, serviceRecipientsData, selectedRecipientIdsData,
    }),
    selectDeselectButtonAction: `${baseUrl}/organisation/${orderId}/service-recipients`,
    selectStatus: toggledStatus,
    selectDeselectButtonText: manifest.selectDeselectButtonText[toggledStatus]
      || manifest.selectDeselectButtonText.select,
  };
};
