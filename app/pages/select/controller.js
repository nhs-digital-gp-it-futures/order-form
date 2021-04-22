export const getSelectContext = async ({ organisation }) => {
  const context = {
    primaryName: organisation.primary.name,
    proxyLinkHref: '#',
  };

  return context;
};
