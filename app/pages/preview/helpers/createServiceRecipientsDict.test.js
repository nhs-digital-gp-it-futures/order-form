import { createServiceRecipientsDict } from './createServiceRecipientsDict';

const plovdivSoftware = {
  name: 'Plovdiv Software',
  odsCode: 'A100001',
};

const sofiaSoftware = {
  name: 'Sofia Software',
  odsCode: 'A100002',
};

const singleRecipient = [plovdivSoftware];
const multipleRecipients = [plovdivSoftware, sofiaSoftware];

describe('createServiceRecipientsDict', () => {
  it.each`
    key                               | serviceRecipients     | expected
    ${'single service recipient'}     | ${singleRecipient}    | ${{ A100001: plovdivSoftware }}
    ${'multiple service recipients'}  | ${multipleRecipients} | ${{ A100001: plovdivSoftware, A100002: sofiaSoftware }}}
    ${'no service recipients'}        | ${[]}                 | ${{}}
    ${'undefined service recipients'} | ${undefined}          | ${{}}
  `('getServiceRecipients $key returns expected output', ({ serviceRecipients, expected }) => {
  expect(createServiceRecipientsDict(serviceRecipients)).toEqual(expected);
});
});
