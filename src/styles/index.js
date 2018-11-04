import { css } from "glamor";

const COLORS = {
  blueGreen: "#7EDAD4",
  mintCream: "#F9FFF9",
  salmonPink: "#FF9393",
  teal: "#588188",
  yellow: "#FFEC94",
};

export const theme = {
  main: {
    borderRadius: "4px",
    boxShadow: (color = COLORS.salmonPink) => `1px 1px 1px 1px ${color}`,
    colors: COLORS,
  },
};

export function setGlobal() {
  css.global(".jtk-endpoint.jtk-endpoint-anchor", {
    zIndex: 20001,
  });
}
