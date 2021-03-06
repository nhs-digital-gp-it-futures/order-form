import neworderPageManifest from './neworder/manifest.json';
import existingorderPageManifest from './existingorder/manifest.json';
import taskListManifest from './taskListManifest.json';
import commonManifest from './commonManifest.json';
import { generateTaskList } from './helpers/generateTaskList';
import { baseUrl } from '../../config';

export const getNewOrderContext = ({ orderId, odsCode }) => ({
  ...commonManifest,
  ...neworderPageManifest,
  backLinkHref: `${baseUrl}/organisation/${odsCode}`,
  orderId,
  taskList: generateTaskList({ orderId, taskListManifest, odsCode }),
  deleteOrderButton: {
    text: commonManifest.deleteOrderButton.text,
    altText: commonManifest.deleteOrderButton.disabledAltText,
    href: '#',
    disabled: true,
  },
  previewOrderButton: {
    text: commonManifest.previewOrderButton.text,
    altText: commonManifest.previewOrderButton.disabledAltText,
    href: '#',
    disabled: true,
  },
  completeOrderButton: {
    text: commonManifest.completeOrderButton.text,
    altText: commonManifest.completeOrderButton.disabledAltText,
    href: '#',
    disabled: true,
  },
});

export const getExistingOrderContext = ({
  orderId, orderDescription, sectionsData, enableSubmitButton = false, odsCode,
}) => ({
  ...commonManifest,
  ...existingorderPageManifest,
  backLinkHref: `${baseUrl}/organisation/${odsCode}`,
  orderId,
  title: `${existingorderPageManifest.title} ${orderId}`,
  orderDescription,
  taskList: generateTaskList({
    orderId, taskListManifest, sectionsData, odsCode,
  }),
  deleteOrderButton: {
    text: commonManifest.deleteOrderButton.text,
    href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/delete-order`,
  },
  previewOrderButton: {
    text: commonManifest.previewOrderButton.text,
    href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/summary`,
  },
  completeOrderButton: {
    text: commonManifest.completeOrderButton.text,
    altText: commonManifest.completeOrderButton.disabledAltText,
    href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/complete-order`,
    disabled: !enableSubmitButton,
  },
});

export const getContext = ({
  orderId, orderDescription, sectionsData, enableSubmitButton, odsCode,
}) => {
  if (orderId === 'neworder') {
    return getNewOrderContext({ orderId, odsCode });
  }
  return getExistingOrderContext({
    orderId, orderDescription, sectionsData, enableSubmitButton, odsCode,
  });
};
