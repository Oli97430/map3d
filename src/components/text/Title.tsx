import { css } from "@emotion/react";
import { TITLE_COLOR } from "@/theme/color";

export function Title({ children }: { children?: React.ReactNode }) {
  return (
    <h1
      css={css({
        margin: 0,
        color: TITLE_COLOR,
        fontSize: "1.75rem",
        fontWeight: 700,
        letterSpacing: "-0.025em",
        lineHeight: 1.2,
      })}
    >
      {children}
    </h1>
  );
}
