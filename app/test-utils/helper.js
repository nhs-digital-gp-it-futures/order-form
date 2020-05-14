export const extractInnerText = async (element) => {
  const elementInnerText = await element.innerText;
  return elementInnerText.trim();
};
