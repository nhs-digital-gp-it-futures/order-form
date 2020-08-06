import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/service-recipients/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'Service Recipients for order-id',
  backLinkHref: '/organisation/order-1',
  csrfToken: 'mockCsrfToken',
  selectDeselectButtonAction: '/organisation/order-1/service-recipients',
  selectStatus: 'select',
  selectDeselectButtonText: 'Select all',
};

describe('service-recipients page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="service-recipients-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="service-recipients-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the supplier page inset advice', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const insetAdvice = $('[data-test-id="service-recipients-page-insetAdvice"]');
      expect(insetAdvice.length).toEqual(1);
      expect(insetAdvice.text().trim()).toContain(context.insetAdvice);
    });
  }));

  describe('selectDeselect button', () => {
    it('should render the select-deselect button', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const button = $('[data-test-id="select-deselect-button"] button');
        expect(button.length).toEqual(1);
        expect(button.text().trim()).toEqual('Select all');
      });
    }));

    it('should render hidden input with selectStatus', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const formElement = $('input[name=selectStatus]');
        expect(formElement.length).toEqual(1);
        expect(formElement.attr('type')).toEqual('hidden');
        expect(formElement.attr('value')).toEqual(context.selectStatus);
      });
    }));
  });

  describe('table', () => {
    it('should render the table headings', componentTester(setup, (harness) => {
      const tableContext = {
        serviceRecipientsTable: {
          columnInfo: [
            {
              data: 'Organisation',
            },
            {
              data: 'ODS Code',
            },
          ],
        },
      };

      harness.request(tableContext, ($) => {
        const table = $('div[data-test-id="recipients-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Organisation');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('ODS Code');
      });
    }));

    it('should render the data', componentTester(setup, (harness) => {
      const tableContext = {
        serviceRecipientsTable: {
          items: [[{
            question: {
              dataTestId: 'recipient-name-organisationName',
              checked: true,
              type: 'checkbox',
              id: 'recipient-name-organisationName',
              name: 'ods-code',
              value: 'recipient-name',
              text: 'Recipient name',
            },
            dataTestId: 'recipient-name-organisationName',
            classes: 'nhsuk-u-font-size-12',
          }, {
            data: 'ODS',
            dataTestId: 'ods-code-odsCode',
            classes: 'nhsuk-u-margin-top-2',
          }]],
        },
      };

      harness.request(tableContext, ($) => {
        const table = $('div[data-test-id="recipients-table"]');
        const row = table.find('[data-test-id="table-row-0"]');
        const organisationInput = row.find('[data-test-id="recipient-name-organisationName"] input');
        const organisationLabel = row.find('[data-test-id="recipient-name-organisationName"] label');
        const odsCode = row.find('div[data-test-id="ods-code-odsCode"]');

        expect(row.length).toEqual(1);
        expect(organisationInput.length).toEqual(1);
        expect(organisationInput.val()).toEqual('recipient-name');
        expect(organisationLabel[0].attribs.for).toEqual('recipient-name-organisationName');
        expect(organisationLabel[0].children[0].data.trim()).toEqual('Recipient name');
        expect(odsCode.length).toEqual(1);
        expect(odsCode.text().trim()).toEqual('ODS');
      });
    }));
  });

  it('should render hidden input with csrf token', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const formElement = $('input[name=_csrf]');
      expect(formElement.length).toEqual(1);
      expect(formElement.attr('type')).toEqual('hidden');
      expect(formElement.attr('value')).toEqual(context.csrfToken);
    });
  }));

  it('should render the continue button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="continue-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.continueButtonText);
    });
  }));
});
