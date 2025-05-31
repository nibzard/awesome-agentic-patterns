export default {
  async fetch(request, env, ctx) {
    // This worker doesn't need to do much as we're primarily serving static assets.
    // You could add custom logic here if needed (e.g., custom headers, redirects)
    // For now, let it pass through to allow Cloudflare to serve static assets.
    // If no static asset matches, it will result in a 404 by default.
    return new Response("Request handled by Worker. Static asset should be served if path matches.", { status: 200 });
  },
};