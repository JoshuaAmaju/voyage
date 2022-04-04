import { styled, Button as MUIButton } from "@material-ui/core";

const Button = styled(MUIButton)((t) => ({
  backgroundColor: "#f9184c",
  borderRadius: t.theme.shape.borderRadius,
  "&:hover": {
    backgroundColor: "#f9184c",
  },
}));

export default Button;
