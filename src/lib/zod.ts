import { z } from "zod";



// Zod probes `new Function` when a schema is created to decide whether to JIT compile parsers, which the strict
// CSP reports as a violation. Importing `z` from here guarantees the probe is disabled before any schema exists.
z.config({ jitless: true });

export { z };
