import manifest from './manifest.json';
import { baseUrl } from '../../../config';

const getCheckedStatus = ({ selectStatus, data, selectedRecipientsData = [] }) => {
  if (selectStatus === 'select') return true;
  if (selectStatus === 'deselect') return false;
  return !!selectedRecipientsData
    .find(checkedRecipient => checkedRecipient.odsCode === data.odsCode);
};

const formatTableData = ({
  selectStatus, serviceRecipientsData, selectedRecipientsData,
}) => serviceRecipientsData
  .map(data => ({
    organisationName: {
      id: data.odsCode,
      name: data.odsCode,
      value: data.name,
      text: data.name,
      checked: getCheckedStatus({ selectStatus, data, selectedRecipientsData }),
    },
    odsCode: data.odsCode,
  }));

export const getContext = ({
  orderId, serviceRecipientsData = [], selectedRecipientsData = [], selectStatus,
}) => {
  const toggledStatus = selectStatus === 'select' ? 'deselect' : 'select';
  return {
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    tableData: formatTableData({
      selectStatus, serviceRecipientsData, selectedRecipientsData,
    }),
    selectDeselectButtonAction: `${baseUrl}/organisation/${orderId}/service-recipients`,
    selectStatus: toggledStatus,
    selectDeselectButtonText: manifest.selectDeselectButtonText[toggledStatus]
      || manifest.selectDeselectButtonText.select,
  };
};
