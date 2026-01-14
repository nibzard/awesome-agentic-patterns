/**
 * remark-asset-paths
 *
 * Remark plugin to transform relative image paths to absolute paths in markdown.
 * This ensures images work correctly on both localhost and production deployments.
 *
 * Per CLAUDE.md: "Use absolute paths starting with / in all asset references"
 *
 * Transforms:
 * - `image.png` → `/image.png`
 * - `./image.png` → `/image.png`
 * - `patterns/image.png` → `/patterns/image.png`
 * - `/image.png` → `/image.png` (unchanged)
 *
 * Also handles src attributes in HTML <img> tags.
 */

import { visit } from "unist-util-visit";
import type { Root, Html, Image } from "mdast";

type RootNode = Root;

interface Options {
  /**
   * Base path to prepend to relative paths.
   * Defaults to "/" for root-relative paths.
   */
  basePath?: string;
}

/**
 * Remark plugin to transform relative image paths to absolute paths
 */
export function remarkAssetPaths(options: Options = {}) {
  const { basePath = "" } = options;

  return (tree: RootNode) => {
    visit(tree, (node) => {
      // Handle markdown images: ![alt](path)
      if (node.type === "image") {
        const img = node as Image;
        if (img.url && !isAbsoluteUrl(img.url)) {
          img.url = normalizePath(img.url, basePath);
        }
      }

      // Handle HTML <img> tags in markdown
      if (node.type === "html") {
        const html = node as Html;
        html.value = transformHtmlImages(html.value, basePath);
      }
    });
  };
}

/**
 * Check if a URL is absolute (starts with /, http://, https://, etc.)
 */
function isAbsoluteUrl(url: string): boolean {
  return (
    url.startsWith("/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("#")
  );
}

/**
 * Normalize a path to be absolute (start with /)
 * Removes leading ./ or ../ and ensures path starts with /
 */
function normalizePath(path: string, basePath: string): string {
  // Remove leading ./ or ../
  let normalized = path.replace(/^(\.\.?\/)+/, "");

  // If path doesn't start with /, prepend base path
  if (!normalized.startsWith("/")) {
    normalized = `${basePath}/${normalized}`;
  }

  // Remove duplicate slashes
  normalized = normalized.replace(/\/+/g, "/");

  return normalized;
}

/**
 * Transform src attributes in HTML <img> tags
 */
function transformHtmlImages(html: string, basePath: string): string {
  return html.replace(
    /<img([^>]*\s)src=(["'])([^"']+)\2([^>]*)>/gi,
    (match, before, quote, src, after) => {
      if (!isAbsoluteUrl(src)) {
        const normalizedSrc = normalizePath(src, basePath);
        return `<img${before}src=${quote}${normalizedSrc}${quote}${after}>`;
      }
      return match;
    }
  );
}

export default remarkAssetPaths;
