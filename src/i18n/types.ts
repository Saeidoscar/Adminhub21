import { t } from "./index"

export type { Lang } from "./index"

/** Union of both dictionaries: pages receive one `tr` object that must type-check in either language. */
export type Tr = typeof t["en"] & typeof t["fa"]
