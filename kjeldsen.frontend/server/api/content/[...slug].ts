import { DeliveryClient } from '@/server/delivery-api';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  
  const config = useRuntimeConfig();
  const { slug } = event.context.params!;

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
  });

  if(slug.startsWith('/.')) {
    return null;
  }

  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: '/' + slug, // Assuming slug is the path here
    });

    if (!response) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found',
      });
    }

    return response;
  } catch (e) {
    console.error(`Failed to fetch content for slug "${slug}"`, e);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch content',
    });
  }
});
