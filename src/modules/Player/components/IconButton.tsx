import { styled } from "@material-ui/core";

const IconButton = styled("button")({
  all: "unset",
  // height: 35,
  // width: 35,
  color: "inherit",
  borderRadius: "100%",
  alignItems: "center",
  fontFamily: "inherit",
  display: "inline-flex",
  justifyContent: "center",
  // backgroundColor: "white",
  // boxShadow: `0 2px 10px ${blackA.blackA7}`,
  // "&:hover": { backgroundColor: violet.violet3 },
  // "&:focus": { boxShadow: `0 0 0 2px black` },
  "&:disabled": { filter: "contrast(0.3)" },
});

export default IconButton;
