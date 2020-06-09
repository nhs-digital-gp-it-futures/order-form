import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';

export const getSolutionPricePageContext = async ({
  orderId, accessToken, solutionId,
}) => {
  const solutionPricingEndpoint = getEndpoint({ endpointLocator: 'getSolutionPricing', options: { solutionId } });
  const solutionPricingData = await getData({
    endpoint: solutionPricingEndpoint,
    accessToken,
    logger,
  });
  // const solutionPricingData = {
  //   id: '<ID>',
  //   name: 'name',
  //   prices: [
  //     {
  //       type: 'flat',
  //       currencyCode: 'GBP', // ISO Currency Code
  //       itemUnit: {
  //         name: 'patient',
  //         description: 'per patient',
  //       },
  //       timeUnit: {
  //         name: 'year',
  //         description: 'per year',
  //       },
  //       price: 1.64,
  //     },
  //     {
  //       type: 'flat',
  //       currencyCode: 'GBP', // ISO Currency Code
  //       itemUnit: {
  //         name: 'licence',
  //         description: 'per licence',
  //       },
  //       timeUnit: {
  //         name: 'month',
  //         description: 'per month',
  //       },
  //       price: 525.052,
  //     },
  //     {
  //       type: 'tiered',
  //       currencyCode: 'GBP', // ISO Currency Code
  //       itemUnit: {
  //         name: 'consultation',
  //         description: 'per consultation',
  //         tierName: 'consultations',
  //       },
  //       timeUnit: {
  //         name: 'month',
  //         description: 'per month',
  //       },
  //       tieringPeriod: 3,
  //       tiers: [
  //         {
  //           start: 1,
  //           end: 5,
  //           price: 700.0,
  //         },
  //         {
  //           start: 6,
  //           end: 10,
  //           price: 600.0,
  //         },
  //         {
  //           start: 11,
  //           end: 15,
  //           price: 500.0,
  //         },
  //         {
  //           start: 16,
  //           price: 400.0,
  //         },
  //       ],
  //     },
  //   ],
  // };
  logger.info(`Solution pricing for solution with id: ${solutionId} found in BAPI.`);

  return getContext({
    orderId,
    solutionPricingData,
  });
};
