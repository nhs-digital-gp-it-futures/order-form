import manifest from './manifest.json';

export const getContext = ({ solutionName, serviceRecipientName, odsCode }) => ({
  ...manifest,
  title: `${solutionName} info for ${serviceRecipientName} (${odsCode})`,
  deleteButtonHref: '#',
});
