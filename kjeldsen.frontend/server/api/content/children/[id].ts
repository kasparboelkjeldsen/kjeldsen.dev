import { DeliveryClient } from '@/server/delivery-api';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { id } = event.context.params!;

  const api = new DeliveryClient({
    BASE: config.public.cmsHost,
  });

  try {
    const response = await api.content.getContent20({
      fetch: `children:${id}`,
      apiKey: config.deliveryKey,
      expand: 'properties[$all]',
    });

    return response;
  } catch (e) {
    console.error(`Failed to fetch children for id "${id}"`, e);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch children',
    });
  }
});
