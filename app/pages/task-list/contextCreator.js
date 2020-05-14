import neworderPageManifest from './neworder/manifest.json';
import existingorderPageManifest from './existingorder/manifest.json';
import taskListManifest from './taskListManifest.json';
import commonManifest from './commonManifest.json';
import { generateTaskList } from './helpers/generateTaskList';
import { baseUrl } from '../../config';

export const getNewOrderContext = ({ orderId }) => ({
  ...commonManifest,
  ...neworderPageManifest,
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
  taskList: generateTaskList({ orderId, taskListManifest }),
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
  submitOrderButton: {
    text: commonManifest.submitOrderButton.text,
    altText: commonManifest.submitOrderButton.disabledAltText,
    href: '#',
    disabled: true,
  },
});

export const getExistingOrderContext = ({ orderId, orderDescription, sectionsData }) => ({
  ...commonManifest,
  ...existingorderPageManifest,
  backLinkHref: `${baseUrl}/organisation`,
  orderId,
  title: `${existingorderPageManifest.title} ${orderId}`,
  orderDescription,
  taskList: generateTaskList({ orderId, taskListManifest, sectionsData }),
  deleteOrderButton: {
    text: commonManifest.deleteOrderButton.text,
    href: '#',
  },
  previewOrderButton: {
    text: commonManifest.previewOrderButton.text,
    href: '#',
  },
  submitOrderButton: {
    text: commonManifest.submitOrderButton.text,
    altText: commonManifest.submitOrderButton.disabledAltText,
    href: '#',
    disabled: true,
  },
});

export const getContext = ({ orderId, orderDescription, sectionsData }) => {
  if (orderId === 'neworder') {
    return getNewOrderContext({ orderId });
  }
  return getExistingOrderContext({ orderId, orderDescription, sectionsData });
};
