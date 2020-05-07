import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { getContext } from './contextCreator';

describe('getContext', () => {
  it('should return the contents of the manifest', () => {
    const context = getContext({});
    expect(context.backlinkText).toEqual(manifest.backlinkText);
    expect(context.description).toEqual(manifest.description);
    expect(context.newOrderButtonText).toEqual(manifest.newOrderButtonText);
    expect(context.proxyLinkText).toEqual(manifest.proxyLinkText);
    expect(context.unsubmittedOrdersTableTitle).toEqual(manifest.unsubmittedOrdersTableTitle);
    expect(context.submittedOrdersTableTitle).toEqual(manifest.submittedOrdersTableTitle);
    expect(context.columnInfo).toEqual(manifest.columnInfo);
    expect(context.columnClass).toEqual(manifest.columnClass);
  });

  it('should construct title', () => {
    const context = getContext({ orgId: 'Org1' });
    expect(context.title).toEqual('Org1 orders');
  });

  it('should construct newOrderButtonHref', () => {
    const context = getContext({});
    expect(context.newOrderButtonHref).toEqual(`${baseUrl}/organisation/neworder`);
  });

  it('should construct proxyLinkHref', () => {
    const context = getContext({ orgId: 'Org1' });
    expect(context.proxyLinkHref).toEqual('#');
  });
});
