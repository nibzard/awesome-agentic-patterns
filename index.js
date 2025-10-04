export default {
  async fetch(request, env, ctx) {
    try {
      return await env.__STATIC_CONTENT__.fetch(request);
    } catch (e) {
      return new Response(`Error: ${e.message}`, { status: 500 });
    }
  },
};