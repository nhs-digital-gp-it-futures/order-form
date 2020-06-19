import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

const generateItems = ({ orderId, catalogueSolutions }) => {
  const items = catalogueSolutions.map((solution) => {
    const columns = [];
    columns.push(({
      data: solution.solutionName,
      href: `${baseUrl}/organisation/${orderId}/catalogue-solutions/${solution.orderItemId}`,
      dataTestId: `${solution.orderItemId}-solutionName`,
    }));
    columns.push(({
      data: `${solution.serviceRecipient.name} (${solution.serviceRecipient.odsCode})`,
      dataTestId: `${solution.orderItemId}-serviceRecipient`,
    }));
    return columns;
  });
  return items;
};

const generateAddedSolutionTable = ({ orderId, addedSolutionTable, catalogueSolutions }) => ({
  ...addedSolutionTable,
  items: generateItems({ orderId, catalogueSolutions }),
});

export const getContext = ({ orderId, orderDescription, catalogueSolutions = [] }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addedSolutionTable: generateAddedSolutionTable({
    orderId, addedSolutionTable: manifest.addedSolutionTable, catalogueSolutions,
  }),
  addSolutionButtonHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
