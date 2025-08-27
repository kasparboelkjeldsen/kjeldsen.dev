export default defineEventHandler(async (event) => {
  if(event.node.req.method == "POST" && event.node.req.headers['kuhb-header']) {
    const body = await readBody(event);
    event.context.body = body;
    event.context.blockPreview = true;
  }
  else if(event.node.req.method == "GET") {
     setHeader(event, 'Cache-Control', 'public, max-age=86400')
  }
});