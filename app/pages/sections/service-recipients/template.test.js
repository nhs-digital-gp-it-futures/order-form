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
  tableData: [{
    organisationName: {
      id: 'ods1-id',
      name: 'ods1-name',
      value: 'ods1',
      text: 'orgName1',
      checked: false,
    },
    odsCode: 'ods1',
  }, {
    organisationName: {
      id: 'ods2-id',
      name: 'ods2-name',
      value: 'ods2',
      text: 'orgName2',
      checked: false,
    },
    odsCode: 'ods2',
  }],
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
    it('should render the organisation heading', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const heading = $('[data-test-id="organisation-heading"]');
        expect(heading.length).toEqual(1);
        expect(heading.text().trim()).toEqual(context.organisationHeading);
      });
    }));

    it('should render a checkbox for each organisation name', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const checkbox1 = $('[data-test-id="organisation-name-checkbox-ods1"]');
        expect(checkbox1.length).toEqual(1);
        expect(checkbox1.text().trim()).toEqual(context.tableData[0].organisationName.text);

        const checkboxInput1 = checkbox1.find('input');
        expect(checkboxInput1.attr('id')).toEqual(context.tableData[0].organisationName.id);
        expect(checkboxInput1.attr('name')).toEqual(context.tableData[0].organisationName.name);
        expect(checkboxInput1.attr('type')).toEqual('checkbox');
        expect(checkboxInput1.attr('checked')).toEqual(undefined);
        expect(checkboxInput1.attr('value')).toEqual(context.tableData[0].organisationName.value);

        const checkbox2 = $('[data-test-id="organisation-name-checkbox-ods2"]');
        expect(checkbox2.length).toEqual(1);
        expect(checkbox2.text().trim()).toEqual(context.tableData[1].organisationName.text);

        const checkboxInput2 = checkbox2.find('input');
        expect(checkboxInput2.attr('id')).toEqual(context.tableData[1].organisationName.id);
        expect(checkboxInput2.attr('name')).toEqual(context.tableData[1].organisationName.name);
        expect(checkboxInput2.attr('type')).toEqual('checkbox');
        expect(checkboxInput2.attr('checked')).toEqual(undefined);
        expect(checkboxInput2.attr('value')).toEqual(context.tableData[1].organisationName.value);
      });
    }));

    it('should render the ods code heading', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const odsCode1 = $('[data-test-id="ods-code-ods1"]');
        expect(odsCode1.length).toEqual(1);
        expect(odsCode1.text().trim()).toEqual(context.tableData[0].odsCode);

        const odsCode2 = $('[data-test-id="ods-code-ods2"]');
        expect(odsCode2.length).toEqual(1);
        expect(odsCode2.text().trim()).toEqual(context.tableData[1].odsCode);
      });
    }));

    it('should render the data for each ods code', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const heading = $('[data-test-id="ods-code-heading"]');
        expect(heading.length).toEqual(1);
        expect(heading.text().trim()).toEqual(context.odsCodeHeading);
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
