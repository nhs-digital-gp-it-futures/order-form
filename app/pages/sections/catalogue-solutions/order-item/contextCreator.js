import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { logger } from '../../../../logger';

export const addData = ((selectedPrice) => {
  manifest.questions.estimationPeriod.options.forEach((option, i) => {
    manifest.questions.estimationPeriod.options[i]
      .checked = option.text.toLowerCase() === selectedPrice
        .timeUnit.description.toLowerCase()
        ? true : undefined;
  });

  manifest.addPriceTable.data = [
    [
      {
        question: {
          type: 'input',
          id: 'price-input-id',
          data: selectedPrice.price,
        },
        classes: 'nhsuk-input--width-10',
        expandableSection: {
          dataTestId: 'view-section-input-id',
          title: 'What price should I enter?',
          innerComponent: 'You can change the list price if you’ve agreed a different rate with the supplier.',
        },
      },
      {
        data: selectedPrice.itemUnit.description,
        dataTestId: 'order-unit-id',
      },
    ],
  ];
});

export const getContext = ({
  orderId, solutionName, serviceRecipientName, odsCode, selectedPrice,
}) => {
  addData(selectedPrice);

  return ({
    ...manifest,
    title: `${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`,
    deleteButtonHref: '#',
    backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/recipient`,
  });
};
