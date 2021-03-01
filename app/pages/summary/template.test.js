import { componentTester } from '../../test-utils/componentTester';
import incompleteManifest from './incomplete/manifest.json';
import completeManifest from './complete/manifest.json';

const setup = {
  template: {
    path: 'pages/summary/template.njk',
  },
};

describe('summary page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the summary page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Order summary for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="summary-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the summary page description', componentTester(setup, (harness) => {
    const context = {
      description: incompleteManifest.description,
    };

    harness.request(context, ($) => {
      const description = $('[data-test-id="summary-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the order description', componentTester(setup, (harness) => {
    const context = {
      orderDescriptionHeading: incompleteManifest.orderDescriptionHeading,
      orderDescription: 'some-order-description',
    };

    harness.request(context, ($) => {
      const orderDescriptionHeading = $('h3[data-test-id="order-description-heading"]');
      const orderDescription = $('h4[data-test-id="order-description"]');

      expect(orderDescriptionHeading.length).toEqual(1);
      expect(orderDescriptionHeading.text().trim()).toContain(context.orderDescriptionHeading);
      expect(orderDescription.length).toEqual(1);
      expect(orderDescription.text().trim()).toContain(context.orderDescription);
    });
  }));

  it('should render the order summary button at the top of the page', componentTester(setup, (harness) => {
    const withOrderSummaryButtonTextContext = {
      orderSummaryButtonText: 'some order summary button text',
      orderSummaryButtonHref: '/some-order-summary-link',
    };

    harness.request(withOrderSummaryButtonTextContext, ($) => {
      const orderSummaryButton = $('[data-test-id="summary-page-orderSummaryButton-top"]');
      expect(orderSummaryButton.length).toEqual(1);
      expect(orderSummaryButton.text().trim()).toEqual(
        withOrderSummaryButtonTextContext.orderSummaryButtonText,
      );
      expect(orderSummaryButton.find('a').attr('href')).toEqual(
        withOrderSummaryButtonTextContext.orderSummaryButtonHref,
      );
    });
  }));

  it('should render the order summary button info text at the top of the page', componentTester(setup, (harness) => {
    const context = {
      orderSummaryButtonText: 'some-order-summary-button-text',
      orderSummaryButtonInfoText: 'some-order-summary-info-text',
    };

    harness.request(context, ($) => {
      const orderSummaryButtonInfoText = $('[data-test-id="summary-page-orderSummaryButtonInfo-top"]');

      expect(orderSummaryButtonInfoText.length).toEqual(1);
      expect(orderSummaryButtonInfoText.text()
        .trim()).toContain(context.orderSummaryButtonInfoText);
    });
  }));

  it('should render the order summary button at the bottom of the page', componentTester(setup, (harness) => {
    const withOrderSummaryButtonTextContext = {
      orderSummaryButtonText: 'some order summary button text',
      orderSummaryButtonHref: '/some-order-summary-link',
    };

    harness.request(withOrderSummaryButtonTextContext, ($) => {
      const orderSummaryButton = $('[data-test-id="summary-page-orderSummaryButton-bottom"]');
      expect(orderSummaryButton.length).toEqual(1);
      expect(orderSummaryButton.text().trim()).toEqual(
        withOrderSummaryButtonTextContext.orderSummaryButtonText,
      );
      expect(orderSummaryButton.find('a').attr('href')).toEqual(
        withOrderSummaryButtonTextContext.orderSummaryButtonHref,
      );
    });
  }));

  it('should render the order summary button info text at the bottom of the page', componentTester(setup, (harness) => {
    const context = {
      orderSummaryButtonText: 'some-order-summary-button-text',
      orderSummaryButtonInfoText: 'some-order-summary-info-text',
    };

    harness.request(context, ($) => {
      const orderSummaryButtonInfoText = $('[data-test-id="summary-page-orderSummaryButtonInfo-bottom"]');

      expect(orderSummaryButtonInfoText.length).toEqual(1);
      expect(orderSummaryButtonInfoText.text()
        .trim()).toContain(context.orderSummaryButtonInfoText);
    });
  }));

  it('should render the order summary created date', componentTester(setup, (harness) => {
    const context = {
      dateSummaryCreatedLabel: incompleteManifest.dateSummaryCreatedLabel,
      dateSummaryCreated: '19 June 2020',
    };

    harness.request(context, ($) => {
      const dateSummaryCreated = $('[data-test-id="date-summary-created"]');

      expect(dateSummaryCreated.length).toEqual(1);
      expect(dateSummaryCreated.text().trim()).toContain(`${context.dateSummaryCreatedLabel} ${context.dateSummaryCreated}`);
    });
  }));

  it('should render the order completed date', componentTester(setup, (harness) => {
    const context = {
      dateCompletedLabel: completeManifest.dateCompletedLabel,
      dateCompleted: '19 June 2020',
    };

    harness.request(context, ($) => {
      const dateCompleted = $('[data-test-id="date-completed"]');

      expect(dateCompleted.length).toEqual(1);
      expect(dateCompleted.text().trim()).toContain(`${context.dateCompletedLabel} ${context.dateCompleted}`);
    });
  }));

  describe('Call-off Ordering Party and Supplier table', () => {
    const context = {
      callOffAndSupplierTable: {
        columnInfo: [
          { data: 'Call-off Ordering Party' },
          { data: 'Supplier' },
        ],
        items: [
          [
            {
              multiLine: {
                data: [
                  'CallOffFirstName CallOffLastName',
                  'Call off org Name',
                  'A01',
                  '',
                  'Calloff First Line',
                  'Calloff Second Line',
                  'Calloff Town',
                  'CO12 1AA',
                ],
                dataTestId: 'call-off-party',
              },
            },
            {
              multiLine: {
                data: [
                  'SuppFirstName SuppLastName',
                  'Supplier Name',
                  '',
                  'Supplier First Line',
                  'Supplier Second Line',
                  'Supplier Town',
                  'SU12 1AA',
                ],
                dataTestId: 'supplier',
              },
            },
          ],
        ],
      },
    };

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="calloff-and-supplier"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Call-off Ordering Party');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('Supplier');
      });
    }));

    it('should render the call-off party and supplier details', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="calloff-and-supplier"]');
        const calloffAndSupplierDetails = table.find('[data-test-id="table-row-0"]');
        const callOffPartyDetails = calloffAndSupplierDetails.find('div[data-test-id="call-off-party"]');
        const supplierDetails = calloffAndSupplierDetails.find('div[data-test-id="supplier"]');

        expect(calloffAndSupplierDetails.length).toEqual(1);

        expect(callOffPartyDetails.length).toEqual(1);
        expect(callOffPartyDetails.find(':nth-child(1)').text().trim()).toEqual('CallOffFirstName CallOffLastName');
        expect(callOffPartyDetails.find(':nth-child(2)').text().trim()).toEqual('Call off org Name');
        expect(callOffPartyDetails.find(':nth-child(3)').text().trim()).toEqual('A01');
        expect(callOffPartyDetails.find(':nth-child(4)').text().trim()).toEqual('');
        expect(callOffPartyDetails.find(':nth-child(5)').text().trim()).toEqual('Calloff First Line');
        expect(callOffPartyDetails.find(':nth-child(6)').text().trim()).toEqual('Calloff Second Line');
        expect(callOffPartyDetails.find(':nth-child(7)').text().trim()).toEqual('Calloff Town');
        expect(callOffPartyDetails.find(':nth-child(8)').text().trim()).toEqual('CO12 1AA');

        expect(supplierDetails.length).toEqual(1);
        expect(supplierDetails.find(':nth-child(1)').text().trim()).toEqual('SuppFirstName SuppLastName');
        expect(supplierDetails.find(':nth-child(2)').text().trim()).toEqual('Supplier Name');
        expect(supplierDetails.find(':nth-child(3)').text().trim()).toEqual('');
        expect(supplierDetails.find(':nth-child(4)').text().trim()).toEqual('Supplier First Line');
        expect(supplierDetails.find(':nth-child(5)').text().trim()).toEqual('Supplier Second Line');
        expect(supplierDetails.find(':nth-child(6)').text().trim()).toEqual('Supplier Town');
        expect(supplierDetails.find(':nth-child(7)').text().trim()).toEqual('SU12 1AA');
      });
    }));
  });

  it('should render the commencement date', componentTester(setup, (harness) => {
    const context = {
      commencementDateLabel: incompleteManifest.commencementDateLabel,
      commencementDate: '19 June 2020',
    };

    harness.request(context, ($) => {
      const commencementDate = $('[data-test-id="commencement-date"]');

      expect(commencementDate.length).toEqual(1);
      expect(commencementDate.text().trim()).toContain(`${context.commencementDateLabel} ${context.commencementDate}`);
    });
  }));

  it('should render the one off cost heading and description', componentTester(setup, (harness) => {
    const context = {
      oneOffCostHeading: incompleteManifest.oneOffCostHeading,
      oneOffCostDescription: incompleteManifest.oneOffCostDescription,
    };

    harness.request(context, ($) => {
      const oneOffCostHeading = $('h3[data-test-id="one-off-cost-heading"]');
      const oneOffCostDescription = $('h4[data-test-id="one-off-cost-description"]');

      expect(oneOffCostHeading.length).toEqual(1);
      expect(oneOffCostHeading.text().trim()).toContain(context.oneOffCostHeading);
      expect(oneOffCostDescription.length).toEqual(1);
      expect(oneOffCostDescription.text().trim()).toContain(context.oneOffCostDescription);
    });
  }));

  describe('One off cost table', () => {
    const context = {
      oneOffCostTable: {
        columnInfo: [
          { data: 'Recipient name (ODS code)' },
          { data: 'Item ID' },
          { data: 'Item name' },
          { data: 'Price unit of order (£)' },
          { data: 'Quantity' },
          { data: 'Item cost (£)' },
        ],
        items: [
          [
            { data: 'Some Recipient Name', dataTestId: 'recipient-name' },
            { data: 'item-1', dataTestId: 'item-id' },
            { data: 'Some item name', dataTestId: 'item-name' },
            { data: '585.00 per Day', dataTestId: 'price-unit' },
            { data: '70', dataTestId: 'quantity' },
            { data: '40,850.00', dataTestId: 'item-cost' },
          ],
        ],
      },
    };

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="one-off-cost-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Recipient name (ODS code)');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('Item ID');
        expect(table.find('[data-test-id="column-heading-2"]').text().trim()).toEqual('Item name');
        expect(table.find('[data-test-id="column-heading-3"]').text().trim()).toEqual('Price unit of order (£)');
        expect(table.find('[data-test-id="column-heading-4"]').text().trim()).toEqual('Quantity');
        expect(table.find('[data-test-id="column-heading-5"]').text().trim()).toEqual('Item cost (£)');
      });
    }));

    it('should render the one off cost details', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="one-off-cost-table"]');
        const oneOffCost1Row = table.find('[data-test-id="table-row-0"]');
        const recipientNameDetails = oneOffCost1Row.find('div[data-test-id="recipient-name"]');
        const itemId = oneOffCost1Row.find('div[data-test-id="item-id"]');
        const itemName = oneOffCost1Row.find('div[data-test-id="item-name"]');
        const priceUnit = oneOffCost1Row.find('div[data-test-id="price-unit"]');
        const quantity = oneOffCost1Row.find('div[data-test-id="quantity"]');
        const itemCost = oneOffCost1Row.find('div[data-test-id="item-cost"]');

        expect(oneOffCost1Row.length).toEqual(1);

        expect(recipientNameDetails.length).toEqual(1);
        expect(recipientNameDetails.text().trim()).toEqual('Some Recipient Name');

        expect(itemId.length).toEqual(1);
        expect(itemId.text().trim()).toEqual('item-1');

        expect(itemName.length).toEqual(1);
        expect(itemName.text().trim()).toEqual('Some item name');

        expect(priceUnit.length).toEqual(1);
        expect(priceUnit.text().trim()).toEqual('585.00 per Day');

        expect(quantity.length).toEqual(1);
        expect(quantity.text().trim()).toEqual('70');

        expect(itemCost.length).toEqual(1);
        expect(itemCost.text().trim()).toEqual('40,850.00');
      });
    }));
  });

  describe('One off cost totals table', () => {
    const context = {
      oneOffCostTotalsTable: {
        columnInfo: [
          { data: '', width: '75%' }, { data: '', width: '25%' },
        ],
        items: [
          [
            { data: 'Total one off cost (indicative)', dataTestId: 'total-cost-label' },
            { data: '1981.02', dataTestId: 'total-cost-value' },
          ],
        ],
      },
    };

    it('should render the table with no headings and widths provided', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="one-off-cost-totals-table"]');

        expect(table.length).toEqual(1);
        expect(table.find('th[data-test-id="column-heading-0"]').text().trim()).toEqual('');
        expect(table.find('th[data-test-id="column-heading-1"]').text().trim()).toEqual('');

        expect(table.find('[data-test-id="column-heading-0"]').attr('style')).toEqual('width:75%');
        expect(table.find('[data-test-id="column-heading-1"]').attr('style')).toEqual('width:25%');
      });
    }));

    it('should render the one off cost totals table', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="one-off-cost-totals-table"]');
        const row1 = table.find('[data-test-id="table-row-0"]');
        const totalCostLabelCell = row1.find('div[data-test-id="total-cost-label"]');
        const totalCostValueCell = row1.find('div[data-test-id="total-cost-value"]');

        expect(table.length).toEqual(1);
        expect(totalCostLabelCell.text().trim()).toEqual('Total one off cost (indicative)');
        expect(totalCostValueCell.text().trim()).toEqual('1981.02');
      });
    }));
  });

  it('should render the recurring cost heading and description', componentTester(setup, (harness) => {
    const context = {
      recurringCostHeading: incompleteManifest.recurringCostHeading,
      recurringCostDescription: incompleteManifest.recurringCostDescription,
    };

    harness.request(context, ($) => {
      const recurringCostHeading = $('h3[data-test-id="recurring-cost-heading"]');
      const recurringCostDescription = $('h4[data-test-id="recurring-cost-description"]');

      expect(recurringCostHeading.length).toEqual(1);
      expect(recurringCostHeading.text().trim()).toContain(context.recurringCostHeading);
      expect(recurringCostDescription.length).toEqual(1);
      expect(recurringCostDescription.text().trim()).toContain(context.recurringCostDescription);
    });
  }));

  describe('Recurring cost table', () => {
    const context = {
      recurringCostTable: {
        columnInfo: [
          { data: 'Recipient name (ODS code)' },
          { data: 'Item ID' },
          { data: 'Item name' },
          { data: 'Service Instance ID' },
          { data: 'Price unit of order (£)' },
          { data: 'Quantity/period' },
          { data: 'Planned delivery date' },
          { data: 'Item cost per year(£)' },
        ],
        items: [
          [
            { data: 'Some Recipient Name', dataTestId: 'recipient-name' },
            { data: 'item-1', dataTestId: 'item-id' },
            { data: 'Some item name', dataTestId: 'item-name' },
            { data: 'service-instance-1', dataTestId: 'service-instance-id' },
            { data: '£1.26 per Patient per Year', dataTestId: 'price-unit' },
            { data: '500 per month', dataTestId: 'quantity' },
            { data: '24 February 2020', dataTestId: 'planned-date' },
            { data: '5000', dataTestId: 'item-cost' },
          ],
        ],
      },
    };

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="recurring-cost-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Recipient name (ODS code)');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('Item ID');
        expect(table.find('[data-test-id="column-heading-2"]').text().trim()).toEqual('Item name');
        expect(table.find('[data-test-id="column-heading-3"]').text().trim()).toEqual('Service Instance ID');
        expect(table.find('[data-test-id="column-heading-4"]').text().trim()).toEqual('Price unit of order (£)');
        expect(table.find('[data-test-id="column-heading-5"]').text().trim()).toEqual('Quantity/period');
        expect(table.find('[data-test-id="column-heading-6"]').text().trim()).toEqual('Planned delivery date');
        expect(table.find('[data-test-id="column-heading-7"]').text().trim()).toEqual('Item cost per year(£)');
      });
    }));

    it('should render the recurring cost details', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="recurring-cost-table"]');
        const recurringCost1Row = table.find('[data-test-id="table-row-0"]');
        const recipientNameDetails = recurringCost1Row.find('div[data-test-id="recipient-name"]');
        const itemId = recurringCost1Row.find('div[data-test-id="item-id"]');
        const itemName = recurringCost1Row.find('div[data-test-id="item-name"]');
        const serviceInstanceId = recurringCost1Row.find('div[data-test-id="service-instance-id"]');
        const priceUnit = recurringCost1Row.find('div[data-test-id="price-unit"]');
        const quantity = recurringCost1Row.find('div[data-test-id="quantity"]');
        const plannedDate = recurringCost1Row.find('div[data-test-id="planned-date"]');
        const itemCost = recurringCost1Row.find('div[data-test-id="item-cost"]');

        expect(recurringCost1Row.length).toEqual(1);

        expect(recipientNameDetails.length).toEqual(1);
        expect(recipientNameDetails.text().trim()).toEqual('Some Recipient Name');

        expect(itemId.length).toEqual(1);
        expect(itemId.text().trim()).toEqual('item-1');

        expect(itemName.length).toEqual(1);
        expect(itemName.text().trim()).toEqual('Some item name');

        expect(serviceInstanceId.length).toEqual(1);
        expect(serviceInstanceId.text().trim()).toEqual('service-instance-1');

        expect(priceUnit.length).toEqual(1);
        expect(priceUnit.text().trim()).toEqual('£1.26 per Patient per Year');

        expect(quantity.length).toEqual(1);
        expect(quantity.text().trim()).toEqual('500 per month');

        expect(plannedDate.length).toEqual(1);
        expect(plannedDate.text().trim()).toEqual('24 February 2020');

        expect(itemCost.length).toEqual(1);
        expect(itemCost.text().trim()).toEqual('5000');
      });
    }));
  });

  describe('Recurring cost totals table', () => {
    const context = {
      recurringCostTotalsTable: {
        columnInfo: [
          { data: '', width: '75%' }, { data: '', width: '25%' },
        ],
        items: [
          [
            { data: 'Total cost for one year (indicative)', dataTestId: 'total-year-cost-label' },
            { data: '1981.02', dataTestId: 'total-year-cost-value' },
          ],
          [
            { data: 'Total monthly cost (indicative)', dataTestId: 'total-monthly-cost-label' },
            { data: '191.69', dataTestId: 'total-monthly-cost-value' },
          ],
          [
            { data: 'Total cost of ownership (indicative)', dataTestId: 'total-ownership-cost-label' },
            { data: '2345.43', dataTestId: 'total-ownership-cost-value' },
          ],
          [
            { data: 'Total cost of ownership blurb', dataTestId: 'total-ownership-terms' },
            { data: '', dataTestId: 'blank-cell' },
          ],
        ],
      },
    };

    it('should render the table with no headings and widths provided', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="recurring-cost-totals-table"]');

        expect(table.length).toEqual(1);
        expect(table.find('th[data-test-id="column-heading-0"]').text().trim()).toEqual('');
        expect(table.find('th[data-test-id="column-heading-1"]').text().trim()).toEqual('');

        expect(table.find('[data-test-id="column-heading-0"]').attr('style')).toEqual('width:75%');
        expect(table.find('[data-test-id="column-heading-1"]').attr('style')).toEqual('width:25%');
      });
    }));

    it('should render the recurring cost totals table', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="recurring-cost-totals-table"]');

        const row1 = table.find('[data-test-id="table-row-0"]');
        const totalYearCostLabelCell = row1.find('div[data-test-id="total-year-cost-label"]');
        const totalYearCostValueCell = row1.find('div[data-test-id="total-year-cost-value"]');

        const row2 = table.find('[data-test-id="table-row-1"]');
        const totalMonthlyCostLabelCell = row2.find('div[data-test-id="total-monthly-cost-label"]');
        const totalMonthlyCostValueCell = row2.find('div[data-test-id="total-monthly-cost-value"]');

        const row3 = table.find('[data-test-id="table-row-2"]');
        const totalOwnershipCostLabelCell = row3.find('div[data-test-id="total-ownership-cost-label"]');
        const totalOwnershipCostValueCell = row3.find('div[data-test-id="total-ownership-cost-value"]');

        const row4 = table.find('[data-test-id="table-row-3"]');
        const totalOwnershipTermsLabelCell = row4.find('div[data-test-id="total-ownership-terms"]');
        const row4BlankCell = row4.find('div[data-test-id="blank-cell"]');

        expect(table.length).toEqual(1);

        expect(totalYearCostLabelCell.text().trim()).toEqual('Total cost for one year (indicative)');
        expect(totalYearCostValueCell.text().trim()).toEqual('1981.02');

        expect(totalMonthlyCostLabelCell.text().trim()).toEqual('Total monthly cost (indicative)');
        expect(totalMonthlyCostValueCell.text().trim()).toEqual('191.69');

        expect(totalOwnershipCostLabelCell.text().trim()).toEqual('Total cost of ownership (indicative)');
        expect(totalOwnershipCostValueCell.text().trim()).toEqual('2345.43');

        expect(totalOwnershipTermsLabelCell.text().trim()).toEqual('Total cost of ownership blurb');
        expect(row4BlankCell.text().trim()).toEqual('');
      });
    }));
  });
});
