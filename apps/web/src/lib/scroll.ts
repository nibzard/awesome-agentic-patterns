// ABOUTME: Centers a child element inside its own scroll container without moving the page.
// ABOUTME: Element.scrollIntoView also scrolls every scrollable ancestor, the window included.

interface ScrollContainer {
  clientHeight: number;
  scrollTop: number;
  getBoundingClientRect(): { top: number };
}

interface ScrollChild {
  getBoundingClientRect(): { top: number; height: number };
}

export function centerInContainer(container: ScrollContainer, child: ScrollChild): void {
  const containerTop = container.getBoundingClientRect().top;
  const { top, height } = child.getBoundingClientRect();
  const offset = top - containerTop + container.scrollTop;
  container.scrollTop = Math.max(0, offset - container.clientHeight / 2 + height / 2);
}
