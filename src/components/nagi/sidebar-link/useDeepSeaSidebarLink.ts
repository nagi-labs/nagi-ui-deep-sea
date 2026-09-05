// @deep-sea-source sidebar-link/useDeepSeaSidebarLink.ts@1
import { reactive } from "vue";

import { linkInteractionProps, mergeElementProps } from "@nagi-labs/nagi-ui";

interface DeepSeaSidebarLinkProps {
  readonly href: string;
  readonly current: boolean;
  readonly navigate?: () => void | Promise<unknown>;
  readonly target?: string;
  readonly rel?: string;
  readonly download?: string;
}

/** Connects the owned SidebarLink's complete native anchor binding. */
export function useDeepSeaSidebarLink(
  props: DeepSeaSidebarLinkProps,
  attrs: Readonly<Record<string, unknown>>,
) {
  const interaction = linkInteractionProps(props);

  return reactive({
    get anchorProps() {
      return mergeElementProps(
        attrs,
        {
          href: props.href,
          target: props.target,
          rel: props.rel,
          download: props.download,
          "aria-current": props.current ? "page" : undefined,
        },
        interaction,
      );
    },
  });
}
