import { buildForwardHandler } from './_forward'

// Forwards analytics batch (links, events, timings) to Umbraco extension controller.
export default buildForwardHandler('collect')
