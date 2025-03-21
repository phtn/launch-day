// import { createEnv } from "@t3-oss/env-nextjs";
// import { z } from "zod";

// export const env = createEnv({
//   server: {
//     CONVEX_DEPLOYMENT: z.string(),
//   },
//   client: {
//     NEXT_PUBLIC_CONVEX_URL: z.string().url(),
//     NEXT_PUBLIC_REOWN_ID: z.string(),
//   },

//   shared: {
//     NODE_ENV: z.enum(["development", "test", "production"]),
//   },

//   runtimeEnv: {
//     CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
//     NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
//     //
//     NEXT_PUBLIC_REOWN_ID: process.env.REOWN_PROJECT_ID,
//   },

//   skipValidation: !!process.env.SKIP_ENV_VALIDATION,

//   emptyStringAsUndefined: true,
// });
