import { describe, expect, it } from "vitest";
import { pageItems } from "@/lib/pagination";
import { buildUsersSearchParams, parseUsersQuery } from "@/lib/users-query";

describe("parseUsersQuery", () => {
  it("uses safe defaults for an empty address", () => {
    expect(parseUsersQuery(new URLSearchParams(""))).toEqual({
      q: undefined,
      skill: undefined,
      level: undefined,
      category: undefined,
      availability: undefined,
      sort: "relevant",
      page: 1,
      pageSize: 9,
    });
  });

  it("ignores invalid values instead of crashing", () => {
    const query = parseUsersQuery(
      new URLSearchParams("level=godlike&sort=random&page=-4&pageSize=9999&category=Cars"),
    );
    expect(query.level).toBeUndefined();
    expect(query.sort).toBe("relevant");
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(50);
    expect(query.category).toBeUndefined();
  });

  it("trims the search text", () => {
    expect(parseUsersQuery(new URLSearchParams("q=%20%20react%20")).q).toBe("react");
    expect(parseUsersQuery(new URLSearchParams("q=%20%20")).q).toBeUndefined();
  });
});

describe("buildUsersSearchParams", () => {
  it("leaves out defaults so the address stays short", () => {
    expect(buildUsersSearchParams({ sort: "relevant", page: 1 }).toString()).toBe("");
  });

  it("writes every active filter", () => {
    const search = buildUsersSearchParams({
      q: "react native",
      skill: "react",
      level: "expert",
      category: "Development",
      availability: "evenings",
      sort: "recent",
      page: 3,
    }).toString();
    expect(search).toBe(
      "q=react+native&skill=react&level=expert&category=Development&availability=evenings&sort=recent&page=3",
    );
  });

  it("round-trips through parseUsersQuery", () => {
    const original = parseUsersQuery(new URLSearchParams("q=ui%2Fux&level=advanced&sort=experienced&page=2"));
    const again = parseUsersQuery(buildUsersSearchParams(original));
    expect(again).toEqual(original);
  });
});

describe("pageItems", () => {
  it("shows every page when there are few", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(2, 4)).toEqual([1, 2, 3, 4]);
    expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses the middle when there are many", () => {
    expect(pageItems(1, 20)).toEqual([1, 2, "ellipsis", 20]);
    expect(pageItems(10, 20)).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
    expect(pageItems(20, 20)).toEqual([1, "ellipsis", 19, 20]);
    expect(pageItems(3, 20)).toEqual([1, 2, 3, 4, "ellipsis", 20]);
  });
});
