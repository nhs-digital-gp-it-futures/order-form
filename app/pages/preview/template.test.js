import { componentTester } from '../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/preview/template.njk',
  },
};

describe('preview page', () => {
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

  it('should render the preview page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Order summary for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="preview-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the preview page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="preview-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the order description', componentTester(setup, (harness) => {
    const context = {
      orderDescriptionHeading: manifest.orderDescriptionHeading,
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

  it('should render the order summary created date', componentTester(setup, (harness) => {
    const context = {
      dateSummaryCreatedLabel: manifest.dateSummaryCreatedLabel,
      dateSummaryCreated: '19 June 2020',
    };

    harness.request(context, ($) => {
      const dateSummaryCreated = $('[data-test-id="date-summary-created"]');

      expect(dateSummaryCreated.length).toEqual(1);
      expect(dateSummaryCreated.text().trim()).toContain(`${context.dateSummaryCreatedLabel} ${context.dateSummaryCreated}`);
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
      commencementDateLabel: manifest.commencementDateLabel,
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
      oneOffCostHeading: manifest.oneOffCostHeading,
      oneOffCostDescription: manifest.oneOffCostDescription,
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
  });

  describe('One off cost totals table', () => {
    const context = {
      oneOffCostTotalsTable: {
        columnInfo: [
          { data: '', width: '50%' }, { data: '', width: '25%' }, { data: '', width: '25%' },
        ],
        items: [
          [
            { data: '', dataTestId: 'blank-cell' },
            { data: 'Total one off cost (indicative)', dataTestId: 'total-cost-label' },
            { data: '1981.02', dataTestId: 'total-cost-value' },
          ],
        ],
      },
    };

    it('should render the table headings with no headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="one-off-cost-totals-table"]');
        const column1 = table.find('[data-test-id="column-heading-0"]');
        const column2 = table.find('th[data-test-id="column-heading-1"]');
        const column3 = table.find('th[data-test-id="column-heading-2"]');

        expect(table.length).toEqual(1);
        expect(column1.text().trim()).toEqual('');
        expect(column2.text().trim()).toEqual('');
        expect(column3.text().trim()).toEqual('');
      });
    }));

    it('should render the one off cost totals table', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="one-off-cost-totals-table"]');
        const row1 = table.find('[data-test-id="table-row-0"]');
        const blankCell = row1.find('div[data-test-id="blank-cell"]');
        const totalCostLabelCell = row1.find('div[data-test-id="total-cost-label"]');
        const totalCostValueCell = row1.find('div[data-test-id="total-cost-value"]');

        expect(table.length).toEqual(1);
        expect(blankCell.text().trim()).toEqual('');
        expect(totalCostLabelCell.text().trim()).toEqual('Total one off cost (indicative)');
        expect(totalCostValueCell.text().trim()).toEqual('1981.02');
      });
    }));
  });

  it('should render the recurring cost heading and description', componentTester(setup, (harness) => {
    const context = {
      recurringCostHeading: manifest.recurringCostHeading,
      recurringCostDescription: manifest.recurringCostDescription,
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
          { data: 'Price unit of order (£)' },
          { data: 'Quantity/period' },
          { data: 'Planned delivery date' },
          { data: 'Item cost per year(£)' },
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
        expect(table.find('[data-test-id="column-heading-3"]').text().trim()).toEqual('Price unit of order (£)');
        expect(table.find('[data-test-id="column-heading-4"]').text().trim()).toEqual('Quantity/period');
        expect(table.find('[data-test-id="column-heading-5"]').text().trim()).toEqual('Planned delivery date');
        expect(table.find('[data-test-id="column-heading-6"]').text().trim()).toEqual('Item cost per year(£)');
      });
    }));
  });
});
