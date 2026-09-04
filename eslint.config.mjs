import nagiCss from "@nagi-labs/eslint-plugin-nagi-css";
import typescriptParser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

import nagiUiPreset from "@nagi-labs/nagi-ui/nagi-css-preset";

export default [
  ...vue.configs["flat/recommended"],
  {
    files: ["src/App.vue", "src/components/**/*.vue", "src/views/**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        extraFileExtensions: [".vue"],
        parser: typescriptParser,
        sourceType: "module",
      },
    },
    rules: {
      "vue/html-closing-bracket-newline": "off",
      "vue/html-indent": "off",
      "vue/html-self-closing": "off",
      "vue/max-attributes-per-line": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/component-name-in-template-casing": [
        "error",
        "kebab-case",
        {
          registeredComponentsOnly: false,
          ignores: [
            "motion.article",
            "motion.aside",
            "motion.button",
            "motion.div",
            "motion.li",
            "motion.ol",
            "motion.section",
            "motion.span",
            "motion.strong",
            "AnimatePresence",
            "VisArea",
            "VisAxis",
            "VisLine",
            "VisXYContainer",
          ],
        },
      ],
      "vue/multi-word-component-names": "off",
    },
  },
  ...nagiCss.configs.recommended(
    {
      ...nagiUiPreset,
      componentClasses: {
        ...nagiUiPreset.componentClasses,
        VisArea: "unovis-area",
        VisAxis: "unovis-axis",
        VisLine: "unovis-line",
        VisXYContainer: "unovis-xy-container",
      },
      intrinsicComponents: {
        "motion.article": "article",
        "motion.aside": "aside",
        "motion.button": "button",
        "motion.div": "div",
        "motion.li": "li",
        "motion.ol": "ol",
        "motion.section": "section",
        "motion.span": "span",
        "motion.strong": "strong",
      },
      libraryBoundaryPrefixes: ["unovis-"],
      surfaceRootPrefixes: ["deep-sea-"],
      transparentComponents: ["AnimatePresence", "RouterLink", "router-link"],
      declarationMode: "plain",
      emitPolicy: "when-styled",
      tokens: {
        sources: [{ file: "src/theme/deep-sea.css", layer: "semantic" }],
        exposedPrefixes: ["--_button-", "--dialog-"],
      },
    },
    {
      files: ["src/App.vue", "src/components/*.vue", "src/views/**/*.vue"],
      severity: { "*": "error" },
    },
  ),
  ...nagiCss.configs.recommended(
    {
      ...nagiUiPreset,
      componentClasses: {},
      componentSlots: {},
      intrinsicComponents: {
        "motion.article": "article",
        "motion.aside": "aside",
        "motion.button": "button",
        "motion.div": "div",
        "motion.li": "li",
        "motion.ol": "ol",
        "motion.section": "section",
        "motion.span": "span",
        "motion.strong": "strong",
      },
      surfaceRootPrefixes: ["n-"],
      transparentComponents: ["AnimatePresence"],
      declarationMode: "plain",
      emitPolicy: "when-styled",
      tokens: {
        sources: [{ file: "src/theme/deep-sea.css", layer: "semantic" }],
        exposedPrefixes: ["--_button-", "--dialog-"],
      },
    },
    {
      files: ["src/components/nagi/**/*.vue"],
      severity: { "*": "error" },
    },
  ),
  {
    files: ["src/components/nagi/**/*.vue"],
    rules: {
      // These components declare TypeScript-optional native pass-through props.
      // Their intentional default is undefined; repeating `prop: undefined` in
      // every withDefaults object would add no runtime or type guarantee.
      "vue/require-default-prop": "off",
      "nagi-css/unverifiable-dynamic-class": "warn",
    },
  },
  { ignores: ["dist/**", "node_modules/**", "test-results/**"] },
];
