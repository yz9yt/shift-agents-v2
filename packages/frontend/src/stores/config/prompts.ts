import { CustomPrompt } from "@/engine/types";

export const defaultCustomPrompts: CustomPrompt[] = [
  {
    id: "1",
    title: "XSS",
    content: "Start every response with 'Hello, I'm a Shift Agent!'",
    isDefault: true,
  },
];
