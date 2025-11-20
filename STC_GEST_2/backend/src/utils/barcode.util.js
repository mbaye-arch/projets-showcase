import JsBarcode from 'jsbarcode';
import { JSDOM } from 'jsdom';

export function generateBarcodeSvg(value, options = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousSvgElement = globalThis.SVGElement;

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.SVGElement = dom.window.SVGElement;

  try {
    const render = (displayValue) => {
      const svgNode = dom.window.document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      JsBarcode(svgNode, value, {
        format: 'CODE128',
        displayValue,
        font: 'monospace',
        fontSize: 14,
        margin: 8,
        lineColor: '#111111',
        background: '#ffffff',
        xmlDocument: dom.window.document,
        ...options
      });

      return svgNode.outerHTML;
    };

    const preferredDisplayValue = options.displayValue ?? false;

    try {
      return render(preferredDisplayValue);
    } catch (error) {
      const message = String(error?.message || '');
      const canFallback =
        preferredDisplayValue &&
        (message.includes('getContext') || message.includes('setting \'font\''));

      if (!canFallback) {
        throw error;
      }

      return render(false);
    }
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }

    if (previousDocument === undefined) {
      delete globalThis.document;
    } else {
      globalThis.document = previousDocument;
    }

    if (previousSvgElement === undefined) {
      delete globalThis.SVGElement;
    } else {
      globalThis.SVGElement = previousSvgElement;
    }
  }
}
