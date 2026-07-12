"use client";

import { useEffect } from "react";

function addValue(target: Record<string, unknown>, key: string, value: string) {
  if (!value) return;
  const current = target[key];
  if (current === undefined) target[key] = value;
  else if (Array.isArray(current)) current.push(value);
  else target[key] = [current, value];
}

function fallbackKey(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, index: number) {
  const hint = element.getAttribute("placeholder") || element.getAttribute("aria-label") || element.id;
  const cleaned = hint?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return cleaned || `${element.tagName.toLowerCase()}_${index + 1}`;
}

function collectFormData(form: HTMLFormElement) {
  const data: Record<string, unknown> = {};
  const controls = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"));

  controls.forEach((element, index) => {
    if (element.disabled) return;
    if (element instanceof HTMLInputElement) {
      const type = element.type.toLowerCase();
      if (["submit", "button", "reset", "image", "search"].includes(type)) return;
      if (["checkbox", "radio"].includes(type) && !element.checked) return;
      if (type === "file") {
        const files = Array.from(element.files || []).map((file) => file.name).join(", ");
        addValue(data, element.name || fallbackKey(element, index), files);
        return;
      }
    }
    addValue(data, element.name || fallbackKey(element, index), element.value.trim());
  });

  return data;
}

function shouldCapture(form: HTMLFormElement) {
  if (form.dataset.noCapture !== undefined) return false;
  if (form.dataset.capture !== undefined) return true;
  if (form.matches(".search-form, .price-range, .cart-list-form")) return false;

  const onlySearch = Boolean(form.querySelector('input[type="search"]')) &&
    !form.querySelector('input[type="email"], input[type="tel"], textarea, select');
  if (onlySearch) return false;

  if (form.matches(".contact-form, .comment-form, .checkout-form")) return true;

  const action = (form.getAttribute("action") || "").trim();
  const hasContactField = Boolean(form.querySelector('input[type="email"], input[type="tel"], textarea, select'));
  return (action === "#" || action === "") && hasContactField;
}

export default function FormCapture({ slug }: { slug: string }) {
  useEffect(() => {
    const listener = async (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || !shouldCapture(form)) return;

      event.preventDefault();
      const data = collectFormData(form);
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageSlug: slug, data, ...data }),
      });

      window.alert(response.ok
        ? "Thank you. Your information has been received."
        : "Unable to submit. Please try again.");
      if (response.ok) form.reset();
    };

    document.addEventListener("submit", listener);
    return () => document.removeEventListener("submit", listener);
  }, [slug]);

  return null;
}
