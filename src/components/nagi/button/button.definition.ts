// @deep-sea-source button/button.definition.ts@2
import { defineComponentDefinition } from "@nagi-labs/nagi-ui/definition";
import {
  buttonContract,
  nativeButtonImplementation,
} from "@nagi-labs/nagi-ui/contracts/button";

/**
 * Deep Sea owns the Button source and theme, but intentionally keeps the
 * platform-first Button implementation. The shared Contract runner proves
 * that the owned copy remains substitutable for the package Blueprint.
 */
export const buttonDefinition = defineComponentDefinition({
  name: "Button",
  version: "3.0",
  status: "draft",
  contract: buttonContract,
  implementation: nativeButtonImplementation,
});
