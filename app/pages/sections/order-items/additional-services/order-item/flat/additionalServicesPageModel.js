// eslint-disable-next-line import/no-extraneous-dependencies
import { Selector } from 'testcafe';

export default class AdditionalServicePageModel {
  constructor() {
    this.deleteButton = Selector('[data-test-id="delete-button"] a');
    this.goBackLink = Selector('[data-test-id="go-back-link"] a');
    this.expandableSection = Selector('[data-test-id="view-section-input-id-practice"]');
    this.orderUnit = Selector('div[data-test-id="unit-of-order"]');

    this.pageTitle = Selector('h1[data-test-id="order-item-page-title"]');
    this.pageName = Selector('div[data-test-id="order-item-page"]');
    this.errorSummary = this.pageName.find('[data-test-id="error-summary"]');
    this.priceField = this.pageName.find('[data-test-id="question-price"]');
    this.priceInput = this.pageName.find('[data-test-id="question-price"] input');
    this.textFieldError = this.pageName.find('[data-test-id="text-field-input-error"]');
    this.saveButton = this.pageName.find('[data-test-id="save-button"] button');

    this.solutionTable = Selector('div[data-test-id="solution-table"]');
    this.deliveryDateColumnHeading = this.solutionTable.find('[data-test-id="column-heading-2-data"]');
    this.quantityColumnHeading = this.solutionTable.find('[data-test-id="column-heading-1-data"]');
    this.recipientColumnHeading = this.solutionTable.find('[data-test-id="column-heading-0-data"]');

    this.table = Selector('div[data-test-id="solution-table"]');
    this.dateColumnHeading = this.table.find('[data-test-id="column-heading-2"]');
    this.practiceSizeColumnHeading = this.table.find('[data-test-id="column-heading-1"]');
    this.solutionNameColumnHeading = this.table.find('[data-test-id="column-heading-0"]');
    this.solutionTableError = this.table.find('[data-test-id="solution-table-error"]');

    this.row = this.table.find('[data-test-id="table-row-0"]');
    this.dateInput = this.row.find('[data-test-id="question-deliveryDate"] input');
    this.dayInput = this.dateInput.nth(0);
    this.monthInput = this.dateInput.nth(1);
    this.yearInput = this.dateInput.nth(2);
    this.dateExpandableSection = this.row.find('[data-test-id="view-section-input-id-date"]');
    this.practiceExpandableSection = this.row.find('[data-test-id="view-section-input-id-practice"]');
    this.quantityField = this.row.find('[data-test-id="question-quantity"]');
    this.quantityInput = this.row.find('[data-test-id="question-quantity"] input');

    this.getItemAttribute = (el, attr) => el.getAttribute(attr);
    this.getDayInputAttribute = (attr) => this.getItemAttribute(this.dayInput, attr);
    this.getMonthInputAttribute = (attr) => this.getItemAttribute(this.monthInput, attr);
    this.getYearInputAttribute = (attr) => this.getItemAttribute(this.yearInput, attr);
    this.solutionName = (testId) => this.row.find(`div[data-test-id="${testId}-recipient"]`);
  }
}
