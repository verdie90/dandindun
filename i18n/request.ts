import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  
  // Ensure locale is valid
  if (!locale) {
    throw new Error('No locale found');
  }
  
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale
  };
});
