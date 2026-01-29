export type StatusType = "draft" | "published";

export const statusOptions: { id: StatusType; name: string }[] = [
  { id: "draft", name: "Draft" },
  { id: "published", name: "Published" },
];
