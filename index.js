export default {
  async fetch(request, env, ctx) {
    // Try to serve the static asset from the __STATIC_CONTENT binding.
    // This name is visible in your Worker's settings in the Cloudflare dashboard.
    try {
      // Use the actual binding name for your static assets
      return await env.__STATIC_CONTENT.fetch(request);
    } catch (e) {
      // If the asset is not found, or there was an error, handle it.
      let pathname = new URL(request.url).pathname;
      // You could return a custom 404 page here if you add one to your static assets
      return new Response(`Sorry, the page ${pathname} was not found.\n${e.message}`, { status: 404 });
    }
  },
};