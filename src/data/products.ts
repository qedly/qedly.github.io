import type { Status } from "../config/site";

/** The QEDly products and their status (spec 042 FR-005). Only Workspace and Cloud take a waitlist. */
export const PRODUCTS: { name: string; job: string; status: Status; waitlist?: "workspace" | "cloud" }[] = [
  { name: "QEDly Code", job: "Coding in your cloud, asked for in Slack, checked before it becomes a pull request.", status: "now" },
  { name: "QEDly Checks", job: "Your CI on the exact commit, where the agent holds no keys.", status: "now" },
  { name: "QEDly Workspace", job: "People and any agent in one place, with the working shown.", status: "next", waitlist: "workspace" },
  { name: "QEDly Passport", job: "A record every piece of work carries: who asked, what ran, what passed.", status: "next" },
  { name: "QEDly Outcomes", job: "Whether it worked, tied to the bet that asked for it.", status: "later" },
  { name: "QEDly Cloud", job: "All of it, run for you.", status: "later", waitlist: "cloud" },
];
