import { buttonContract } from "@nagi-labs/nagi-ui/test";

import { buttonDefinition } from "../src/components/nagi/button/button.definition";

buttonContract({
  definition: buttonDefinition,
  url: "/button-contract",
  name: "Deep Sea save",
  nativeDisabledName: "Deep Sea native disabled",
  focusableDisabled: {
    name: "Deep Sea focusable disabled",
    statusName: "Deep Sea disabled activations",
  },
  activation: {
    name: "Deep Sea activate",
    statusName: "Deep Sea button activations",
    attribute: { name: "data-contract-owner", value: "deep-sea" },
  },
  submission: {
    defaultName: "Deep Sea form action",
    name: "Deep Sea submit",
    resetName: "Deep Sea reset",
    inputName: "Deep Sea form value",
    initialInputValue: "initial",
    statusName: "Deep Sea submission result",
    initialStatus: "none",
    expected: "submitted",
  },
  style: {
    name: "Deep Sea styled action",
    axes: {
      "--button-tone": "danger",
      "--button-appearance": "outlined",
      "--button-shape": "rounded",
      "--button-size": "small",
    },
    compiledAxes: [
      "--_button-tone-color",
      "--_button-background",
      "--_button-radius",
      "--_button-min-block-size",
    ],
  },
});
