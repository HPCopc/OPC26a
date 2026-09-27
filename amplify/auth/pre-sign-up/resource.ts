import { defineFunction } from "@aws-amplify/backend";

export const preSignUp = defineFunction({
  name: "pre-sign-up",
  entry: "./handler.ts",
  // Cognito waits at most 5 seconds for this trigger; the handler falls back
  // to the built-in blocklist well before that (see LOOKUP_TIMEOUT_MS).
  timeoutSeconds: 5,
});