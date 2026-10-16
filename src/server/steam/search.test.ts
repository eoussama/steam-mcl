import { describe, expect, it } from "vitest";

import { extractSearchAppIds } from "./search";



describe("extractSearchAppIds", () => {
  it("extracts unique app ids and skips package rows", () => {
    const html = `
      <a href="/app/306130/" data-ds-appid="306130" data-ds-itemkey="App_306130"></a>
      <a href="/app/489830/" data-ds-appid="489830"></a>
      <a href="/sub/900883/" data-ds-appid="22330,900883" data-ds-packageid="900883"></a>
      <a href="/app/489830/" data-ds-appid="489830"></a>
    `;

    expect(extractSearchAppIds(html)).toEqual([306130, 489830]);
  });

  it("handles empty results", () => {
    expect(extractSearchAppIds("\n<!-- List Items -->\n<!-- End List Items -->\n")).toEqual([]);
  });
});
