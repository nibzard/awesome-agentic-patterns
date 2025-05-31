export default {
  async fetch(request, env, ctx) {
    // Try to serve the static asset from the ASSETS binding.
    // env.ASSETS is automatically populated by Cloudflare when [site] is configured.
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      // If the asset is not found, or there was an error, handle it.
      let pathname = new URL(request.url).pathname;
      // You could return a custom 404 page here if you add one to your static assets
      return new Response(`Sorry, the page ${pathname} was not found.\n${e.message}`, { status: 404 });
    }
  },
};