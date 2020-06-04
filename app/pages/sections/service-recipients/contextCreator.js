import manifest from './manifest.json';
import { baseUrl } from '../../../config';

export const getContext = ({ orderId, serviceRecipientsData = [] }) => {
  const tableData = serviceRecipientsData.map(data => ({
    organisationName: {
      id: data.odsCode,
      name: data.odsCode,
      value: data.name,
      text: data.name,
      checked: false,
    },
    odsCode: data.odsCode,
  }));
  return {
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    tableData,
  };
};
