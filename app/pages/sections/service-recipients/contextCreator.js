import manifest from './manifest.json';
import { baseUrl } from '../../../config';

const formatTableData = (serviceRecipientsData, selectedRecipientsData) => serviceRecipientsData
  .map(data => ({
    organisationName: {
      id: data.odsCode,
      name: data.odsCode,
      value: data.name,
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
