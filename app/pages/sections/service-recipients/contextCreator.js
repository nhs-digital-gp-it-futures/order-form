import manifest from './manifest.json';
import { baseUrl } from '../../../config';

const formatTableData = (serviceRecipientsData, selectedRecipientsData) => serviceRecipientsData
  .map(data => ({
    organisationName: {
      id: `${data.odsCode}-id`,
      name: `${data.odsCode}-name`,
      value: data.odsCode,
      text: data.name,
      checked: !!selectedRecipientsData
        .find(checkedRecipient => checkedRecipient.odsCode === data.odsCode),
    },
    odsCode: data.odsCode,
  }));

export const getContext = ({
  orderId, serviceRecipientsData = [], selectedServiceRecipientsData = [],
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
  tableData: formatTableData(serviceRecipientsData, selectedServiceRecipientsData),
});
