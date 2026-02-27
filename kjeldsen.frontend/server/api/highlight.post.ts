import { highlightCode, parseCodeFence } from '~~/server/utils/shiki'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ markdown: string }>(event)
  
  if (!body?.markdown) {
    throw createError({ statusCode: 400, message: 'Missing markdown in request body' })
  }
  
  const { code, lang } = parseCodeFence(body.markdown)
  const result = await highlightCode(code, lang || 'text')
  
  return {
    html: result.html,
    language: result.language,
  }
})
