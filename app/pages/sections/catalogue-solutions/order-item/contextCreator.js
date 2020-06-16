import manifest from './manifest.json';

export const getContext = ({ solutionName, serviceRecipientName, odsCode }) => ({
  ...manifest,
  title: `${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`,
  deleteButtonHref: '#',
});
