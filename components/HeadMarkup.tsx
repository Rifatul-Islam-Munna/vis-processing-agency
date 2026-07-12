"use client";

import { useEffect } from "react";

export default function HeadMarkup({ html }: { html?: string }) {
  useEffect(() => {
    if (!html?.trim()) return;
    const template = document.createElement("template");
    template.innerHTML = html;
    const nodes = Array.from(template.content.childNodes);
    for (const node of nodes) {
      if (node instanceof Element) node.setAttribute("data-vis-cms-head", "true");
      document.head.appendChild(node);
    }
    return () => {
      for (const node of nodes) node.parentNode?.removeChild(node);
    };
  }, [html]);

  return null;
}
