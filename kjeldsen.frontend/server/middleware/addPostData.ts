export default defineEventHandler(async (event) => {
  if(event.node.req.method == "POST" && event.node.req.headers['uchb-header']) {
    const body = await readBody(event);
    event.context.body = body;
    event.context.blockPreview = true;
  }
});