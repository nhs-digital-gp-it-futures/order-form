import manifest from './manifest.json';
import {
  backLinkHref, deleteButtonLink, editRecipientsLink, getContext,
} from './contextCreator';
import { baseUrl } from '../../../../../config';

describe('additional-services contextCreator', () => {
  const orderId = 'order-id';
  const mockcatalogueItemExists = { catalogueItemId: 'some-id' };
  const odsCode = '03F';
  describe('backLinkHref', () => {
    const additionalServicesUrl = `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`;
    const mockSelectedPriceOnDemandType = { type: 'flat', provisioningType: 'OnDemand' };
    const mockSelectedPricePatientType = { type: 'flat', provisioningType: 'Patient' };
    const onDemandPriceUrl = `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/flat/ondemand`;
    const dateUrl = `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients/date`;
    const somefakeUrl = 'https://some.url.co.uk/order-id';
    const onselectServiceUrl = `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service`;
    it.each`
    senderUrl                               |  expectedUrl                                                | selectedPrice                   | catalogueItemExists
    ${`${somefakeUrl}/items/894`}           | ${additionalServicesUrl}                                    | ${mockSelectedPricePatientType} | ${''}
    ${''}                                   | ${additionalServicesUrl}                                    | ${mockSelectedPricePatientType} | ${''}
    ${`${somefakeUrl}/date`}                | ${`${somefakeUrl}/date`}                                    | ${mockSelectedPricePatientType} | ${''}
    ${`${somefakeUrl}/additional-services`} | ${`${somefakeUrl}/additional-services`}                     | ${mockSelectedPricePatientType} | ${''}
    ${`${somefakeUrl}/recipients`}          | ${`${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`} | ${mockSelectedPricePatientType} | ${''}
    ${`${somefakeUrl}/neworderitem`}        | ${onDemandPriceUrl}                                         | ${mockSelectedPriceOnDemandType}| ${''}
    ${`${somefakeUrl}/neworderitem`}        | ${dateUrl}                                                  | ${mockSelectedPricePatientType} | ${''}
    ${onselectServiceUrl}                   | ${onselectServiceUrl}                                       | ${mockSelectedPriceOnDemandType}| ${mockcatalogueItemExists}  
    `('backlinkHref should return expected url', ({
      senderUrl, expectedUrl, selectedPrice, catalogueItemExists,
    }) => {
      const req = {
        headers: {
          referer: senderUrl,
        },
      };
      const actual = backLinkHref({
        req, selectedPrice, orderId, catalogueItemExists, odsCode,
      });
      expect(actual).toEqual(expectedUrl);
    });
  });

  describe('deleteButtonLink', () => {
    it('should return expected link', () => {
      const catalogueItemId = 'order-item-id-92';
      const solutionName = 'Medi-Sort';
      const actual = deleteButtonLink({
        orderId, catalogueItemId, solutionName, odsCode,
      });
      expect(actual)
        .toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/delete/${catalogueItemId}/confirmation/${solutionName}`);
    });
  });

  describe('editRecipientsLink', () => {
    it('should return expected link', () => {
      const actual = editRecipientsLink(orderId, odsCode);
      expect(actual)
        .toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`);
    });
  });

  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the insetAdvice', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.insetAdvice).toEqual(manifest.insetAdvice);
    });

    it('should return the orderDescriptionHeading', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.orderDescriptionHeading).toEqual(manifest.orderDescriptionHeading);
    });

    it('should return the orderDescription provided', () => {
      const context = getContext({ orderId: 'order-1', orderDescription: 'Some order description' });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the noOrderItemsText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.noOrderItemsText).toEqual(manifest.noOrderItemsText);
    });

    it('should return the addedOrderItemsTable colummInfo and columnClass', () => {
      const context = getContext({ orderId: 'order-1', orderItems: [] });
      expect(context.addedOrderItemsTable.columnInfo)
        .toEqual(manifest.addedOrderItemsTable.columnInfo);
      expect(context.addedOrderItemsTable.columnClass)
        .toEqual(manifest.addedOrderItemsTable.columnClass);
    });

    it('should return the addedOrderItemsTable without items if no order items are provided', () => {
      const context = getContext({ orderId: 'order-1', orderItems: [] });
      expect(context.addedOrderItemsTable.items).toEqual([]);
    });

    it('should return the addedOrderItemsTable with items when order items are provided', () => {
      const expectedContext = {
        addedOrderItemsTable: {
          ...manifest.addedOrderItemsTable,
          items: [
            [
              {
                data: 'Additional Service One',
                href: '/order/organisation/03F/order/order-1/additional-services/orderItem1',
                dataTestId: 'orderItem1-catalogueItemName',
              },
              {
                data: 'per patient per month',
                dataTestId: 'orderItem1-unitoforder',
              },
              {
                expandableSection: {
                  dataTestId: 'orderItem1-serviceRecipients',
                  title: 'Service recipients (ODS code)',
                  innerComponent: 'Recipient One (recipient-1)',
                },
              },
            ],
            [
              {
                data: 'Additional Service Two',
                href: '/order/organisation/03F/order/order-1/additional-services/orderItem2',
                dataTestId: 'orderItem2-catalogueItemName',
              },
              {
                data: 'per appointment',
                dataTestId: 'orderItem2-unitoforder',
              },
              {
                expandableSection: {
                  dataTestId: 'orderItem2-serviceRecipients',
                  title: 'Service recipients (ODS code)',
                  innerComponent: 'Recipient Two (recipient-2)<br><br>Recipient Four (recipient-4)<br><br>Recipient Five (recipient-5)',
                },
              },
            ],
          ],
        },
      };

      const mockOrderItems = [
        {
          catalogueItemId: 'orderItem1',
          catalogueItemName: 'Additional Service One',
          itemUnit: {
            name: 'patient',
            description: 'per patient',
          },
          timeUnit: {
            name: 'month',
            description: 'per month',
          },
          serviceRecipients: [{
            name: 'Recipient One',
            odsCode: 'recipient-1',
          }],
        },
        {
          catalogueItemId: 'orderItem2',
          catalogueItemName: 'Additional Service Two',
          provisioningType: 'OnDemand',
          serviceRecipients: [{
            name: 'Recipient Two',
            odsCode: 'recipient-2',
          },
          {
            name: 'Recipient Four',
            odsCode: 'recipient-4',
          },
          {
            name: 'Recipient Five',
            odsCode: 'recipient-5',
          }],
          itemUnit: {
            name: 'appointment',
            description: 'per appointment',
          },
          timeUnit: {
            name: 'month',
            description: 'per month',
          },
        },
      ];
      const context = getContext({ orderId: 'order-1', orderItems: mockOrderItems, odsCode });
      expect(context.addedOrderItemsTable).toEqual(expectedContext.addedOrderItemsTable);
    });

    it('should return the addedOrderItemsTable with items when orderitem in onDemand type', () => {
      const expectedContext = {
        addedOrderItemsTable: {
          ...manifest.addedOrderItemsTable,
          items: [
            [
              {
                data: 'Solution One',
                href: '/order/organisation/03F/order/order-1/additional-services/orderItem1',
                dataTestId: 'orderItem1-catalogueItemName',
              },
              {
                data: 'per active user',
                dataTestId: 'orderItem1-unitoforder',
              },
              {
                expandableSection: {
                  dataTestId: 'orderItem1-serviceRecipients',
                  title: 'Service recipients (ODS code)',
                  innerComponent: 'Recipient One (recipient-1)<br><br>Recipient Two (recipient-2)',
                },
              },
            ],
          ],
        },
      };

      const mockOrderItems = [{
        catalogueItemName: 'Solution One',
        catalogueItemId: 'orderItem1',
        provisioningType: 'OnDemand',
        serviceRecipients: [{
          name: 'Recipient One',
          odsCode: 'recipient-1',
        },
        {
          name: 'Recipient Two',
          odsCode: 'recipient-2',
        }],
        itemUnit: {
          name: 'activeUser',
          description: 'per active user',
        },
        timeUnit: {
          name: 'year',
          description: 'per year',
        },
      }];
      const context = getContext({ orderId: 'order-1', orderItems: mockOrderItems, odsCode });
      expect(context.addedOrderItemsTable).toEqual(expectedContext.addedOrderItemsTable);
    });

    it('should return the addOrderItemButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.addOrderItemButtonText).toEqual(manifest.addOrderItemButtonText);
    });

    it('should return the addOrderItemButtonHref', () => {
      const context = getContext({ orderId: 'order-1', odsCode });
      expect(context.addOrderItemButtonHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/order-1/additional-services/select/additional-service`);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
