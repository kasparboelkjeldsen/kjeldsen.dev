import { DeliveryClient } from '@/server/delivery-api';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { slug } = event.context.params!;

  // Disallow any path segment with a dot
  if (slug.includes('.')) {
    return null;
  }

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
  });

  try {
    const response = await api.content.getContentItemByPath20({
      apiKey: config.deliveryKey,
      path: '/' + slug,
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
