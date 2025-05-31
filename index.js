export default {
  async fetch(request, env, ctx) {
    const assetFetcher = env.__STATIC_CONTENT__; // Note the double underscore

    if (!assetFetcher) {
      let availableKeys = "N/A";
      try {
        availableKeys = Object.keys(env).join(', ');
      } catch (envError) {
        availableKeys = "Error reading env keys";
      }
      return new Response(
        "Static asset binding '__STATIC_CONTENT__' (double underscore) was not found in the Worker environment. " +
        "Available top-level env keys: [" + availableKeys + "]",
        { status: 500 }
      );
    }

    try {
      // Check if the fetch method exists on the assetFetcher
      if (typeof assetFetcher.fetch !== 'function') {
        return new Response(
          "The binding '__STATIC_CONTENT__' was found, but its '.fetch()' method is not a function. " +
          "Type of '__STATIC_CONTENT__': " + typeof assetFetcher,
          { status: 500 }
        );
      }
      return await assetFetcher.fetch(request);
    } catch (e) {
      let pathname = "N/A";
      try {
        pathname = new URL(request.url).pathname;
      } catch (urlError) {
        // Ignore if request.url is invalid
      }

      let errorDetails = `Error name: ${e.name}, Error message: ${e.message}`;

      return new Response(
        `Sorry, the page ${pathname} was not found or an error occurred while fetching with '__STATIC_CONTENT__'.\n${errorDetails}`,
        { status: (e.name === 'NotFoundError' || (e.message && e.message.toLowerCase().includes("not found"))) ? 404 : 500 }
      );
    }
  },
};