export default {
  async fetch(request, env, ctx) {
    return await env.__STATIC_CONTENT__.fetch(request);
  },
};