export function slideDown(node: HTMLElement) {
  const height = node.scrollHeight;
  return {
    duration: 250,
    css: (t: number) => {
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      return `overflow: hidden; height: ${eased * height}px; opacity: ${eased};`;
    }
  };
}
