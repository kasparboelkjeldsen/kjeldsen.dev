import { decryptSeg } from '../../utils/seg-crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = body?.token

  if (!token) {
    return { segment: null }
  }

  const segment = await decryptSeg(token)
  return { segment }
})
