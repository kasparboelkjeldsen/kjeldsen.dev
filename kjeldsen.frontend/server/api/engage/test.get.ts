export default defineEventHandler(async (event) => {
  return {
    ok: true,
    message: 'Engage API endpoint is reachable',
    env: {
      hasCmsHost: !!process.env.CMSHOST,
      hasDeliveryKey: !!process.env.DELIVERY_KEY,
      cmsHost: process.env.CMSHOST ? `${process.env.CMSHOST.substring(0, 20)}...` : 'not set',
    },
    timestamp: new Date().toISOString(),
  }
})
