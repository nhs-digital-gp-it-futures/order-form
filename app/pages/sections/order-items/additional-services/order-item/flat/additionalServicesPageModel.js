// eslint-disable-next-line import/no-extraneous-dependencies
import { Selector } from 'testcafe';

export default class AdditionalServicePageModel {
  constructor() {
    this.table = Selector('div[data-test-id="solution-table"]');

    this.solutionNameColumnHeading = this.table.find('[data-test-id="column-heading-0"]');
    this.practiceSizeColumnHeading = this.table.find('[data-test-id="column-heading-1"]');
    this.dateColumnHeading = this.table.find('[data-test-id="column-heading-2"]');

    this.row = this.table.find('[data-test-id="table-row-0"]');
    this.solutionName = this.row.find('div[data-test-id="Recipient 2-recipient-2-recipient"]');
    this.quantityInput = this.row.find('[data-test-id="question-quantity"] input');
    this.practiceExpandableSection = this.row.find('[data-test-id="view-section-input-id-practice"]');
    this.dateInput = this.row.find('[data-test-id="question-deliveryDate"] input');
    this.dayInput = this.dateInput.nth(0);
    this.monthInput = this.dateInput.nth(1);
    this.yearInput = this.dateInput.nth(2);
    this.dateExpandableSection = this.row.find('[data-test-id="view-section-input-id-date"]');

    this.getItemAttribute = (el, attr) => el.getAttribute(attr);
    this.getDayInputAttribute = (attr) => this.getItemAttribute(this.dayInput, attr);
    this.getMonthInputAttribute = (attr) => this.getItemAttribute(this.monthInput, attr);
    this.getYearInputAttribute = (attr) => this.getItemAttribute(this.yearInput, attr);
  }
}
