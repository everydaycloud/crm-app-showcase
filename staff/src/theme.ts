import { backdropClasses } from "@mui/material/Backdrop";
import { common } from "@mui/material/colors";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import type { Components } from "@mui/material/styles";
import {
  alpha,
  createTheme as createMUITheme,
  Palette,
} from "@mui/material/styles";
import "src/index.css";

export const neutral = {
  20: "#11192705",
  50: "#1119270F",
  100: "#11192719",
  150: "#11192728",
  200: "#11192733",
  300: "#1119274C",
  400: "#11192766",
  500: "#11192780",
  600: "#11192799",
  700: "#111927B3",
  800: "#111927CC",
  900: "#111927E6",
  1000: "#111927",
};

//Brand colours
export const darkTeal = {
  main: "#061E21",
  contrastText: "#061E2105",
};

export const sky = {
  main: "#8FD2DB",
  contrastText: "#8FD2DB05",
};

export const white = {
  main: "#FFFFFF",
  contrastText: "#FFFFFF05",
};

//Secondary colours
export const sea = {
  main: "#29B488",
  contrastText: "#FFFFFF",
};

export const greige = {
  main: "#E5E3D9",
  contrastText: "#E5E3D905",
};

export const rain = {
  main: "#ADC2C7",
  contrastText: "#ADC2C705",
};

export const blueSmoke = {
  main: "#879DA3",
  contrastText: "#879DA305",
};

export const darkGreyBlue = {
  main: "#244D5A",
  contrastText: "#FFFFFF",
};

export const fadedRed = {
  main: "#DC3545",
  contrastText: "#DC354505",
};

export const papayaOrange = {
  main: "#F05E23",
  contrastText: "#F05E2305",
};

export const irishGreen = {
  main: "#00893E",
  contrastText: "#00893E05",
};

declare module "@mui/material/styles" {
  export interface NeutralColors {
    20: string;
    50: string;
    100: string;
    150: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    1000: string;
  }

  interface Palette {
    brand: {
      main: string;
      contrastText: string;
    };
    neutral: NeutralColors;
  }

  interface PaletteOptions {
    brand?: {
      main: string;
      contrastText: string;
    };
    neutral?: NeutralColors;
  }
  interface TypeBackground {
    paper: string;
    default: string;
  }
  interface TypographyVariants {
    body3: React.CSSProperties;
    body4: React.CSSProperties;
    landingH1: React.CSSProperties;
    landingH2: React.CSSProperties;
    landingH3: React.CSSProperties;
    landingH4: React.CSSProperties;
    landingH5: React.CSSProperties;
    landingH6: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    body4?: React.CSSProperties;
    landingH1?: React.CSSProperties;
    landingH2?: React.CSSProperties;
    landingH3?: React.CSSProperties;
    landingH4?: React.CSSProperties;
    landingH5?: React.CSSProperties;
    landingH6?: React.CSSProperties;
  }
}

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    onboarding: true;
  }
}
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    body3: true;
    body4: true;
    landingH1: true;
    landingH2: true;
    landingH3: true;
    landingH4: true;
    landingH5: true;
    landingH6: true;
  }
}
declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    landing: true;
    onboarding: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    accent: true;
  }
}

const baseTheme = createMUITheme();

export const createTheme = (mode: "dark" | "light") => {
  const palette = createPalette(mode);
  const components = createComponents(mode, palette);
  const direction = "ltr";
  const breakpoints = {
    ...baseTheme.breakpoints,
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1440,
    },
  };
  const typography = {
    fontFamily: "Biennale, Helvetica Now, sans-serif",
    body1: {
      fontSize: "1em",
      fontWeight: 400,
      lineHeight: "1.5em",
      letterSpacing: "0em",
    },
    body2: {
      fontSize: "0.875em",
      fontWeight: 400,
      lineHeight: "1.375em",
      letterSpacing: "0em",
    },
    body3: {
      fontSize: "0.75em",
      fontWeight: 400,
      lineHeight: "1.25em",
      letterHeight: "0em",
    },
    body4: {
      fontSize: "0.625em",
      fontWeight: 400,
      lineHeight: "1.125em",
      letterHeight: "0em",
    },
    h1Large: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontSize: "2.125em",
      fontWeight: 500,
      lineHeight: "2.5em",
      letterSpacing: "-0.031em",
    },
    h1: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontSize: "1.5em",
      fontWeight: 500,
      lineHeight: "1.875em",
      letterSpacing: "-0.031em",
    },
    h2: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontSize: "1.25em",
      fontWeight: 500,
      lineHeight: "1.625em",
      letterSpacing: "-0.031rem",
    },
    h3: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontSize: "1.125em",
      fontWeight: 500,
      lineHeight: "1.5em",
      letterSpacing: "-0.016rem",
    },
    h4: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontSize: "1em",
      fontWeight: 500,
      lineHeight: "1.375em",
      letterSpacing: "-0.016em",
    },
    h5: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontSize: "0.875em",
      fontWeight: 500,
      lineHeight: "1.25em",
      letterSpacing: "0em",
    },
    h6: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontSize: "0.75em",
      fontWeight: 500,
      lineHeight: "1.125em",
      letterSpacing: "0em",
    },
    landingH1: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontWeight: 500,
      fontSize: "12.5rem",
      lineHeight: 1,
      letterSpacing: "-0.5rem",
      [breakpoints.down("sm")]: {
        fontSize: "4.626rem",
        letterSpacing: "-0.2rem",
      },
    },
    landingH2: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontWeight: 900,
      fontSize: "9.25rem",
      lineHeight: 0.89,
      letterSpacing: "-0.125rem",
      [breakpoints.down("md")]: {
        fontSize: "6.9rem",
        lineHeight: 1,
        letterSpacing: "-0.031rem",
      },
      [breakpoints.down("sm")]: {
        fontSize: "4.625rem",
        lineHeight: 1,
        letterSpacing: "-0.031rem",
      },
      [breakpoints.down(400)]: {
        fontSize: "3.8rem",
        lineHeight: 1,
        letterSpacing: "-0.031rem",
      },
    },
    landingH3: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontWeight: 500,
      fontSize: "6.25rem",
      lineHeight: 1,
      letterSpacing: "-0.313rem",
      [breakpoints.down("md")]: {
        fontSize: "2.625rem",
        lineHeight: 1.1,
        letterSpacing: "-0.125rem",
      },
    },
    landingH4: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontWeight: 500,
      fontSize: "2.375rem",
      lineHeight: 1.4,
      [breakpoints.down("sm")]: {
        fontSize: "1.625rem",
      },
    },
    landingH5: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontWeight: 500,
      fontSize: "1.625rem",
      lineHeight: 1.23,
      [breakpoints.down("md")]: {
        fontSize: "1.375rem",
        lineHeight: 1.27,
      },
    },
    landingH6: {
      fontFamily: "Biennale, Helvetica Now, sans-serif",
      fontWeight: 700,
      fontSize: "1.125rem",
      lineHeight: 1.2,
    },
  };

  return createMUITheme({
    palette,
    components,
    direction,
    shadows: Array.from({ length: 25 }, () => "none") as any,
    shape: { borderRadius: 8 },
    typography,
  });
};

export const createPalette = (mode: "dark" | "light"): any => {
  return {
    action: {
      active: mode === "light" ? neutral[500] : common.white,
      disabled:
        mode === "light"
          ? alpha(neutral[1000], 0.38)
          : alpha(neutral[100], 0.38),
      disabledBackground:
        mode === "light"
          ? alpha(neutral[1000], 0.12)
          : alpha(neutral[100], 0.12),
      focus:
        mode === "light"
          ? alpha(neutral[1000], 0.16)
          : alpha(neutral[100], 0.16),
      hover: alpha(sky.main, 0.08),
      selected:
        mode === "light"
          ? alpha(neutral[1000], 0.12)
          : alpha(neutral[100], 0.12),
    },
    background: {
      default: mode === "light" ? alpha(blueSmoke.main, 0.06) : darkTeal.main,
      paper: mode === "light" ? common.white : darkTeal.main,
    },
    brand: darkTeal,
    divider:
      mode === "light" ? alpha(darkTeal.main, 0.16) : alpha(common.white, 0.16),
    error: fadedRed,
    info: sea,
    neutral,
    primary: sky,
    mode,
    success: irishGreen,
    text: {
      primary: mode === "light" ? darkTeal.main : common.white,
      secondary:
        mode === "light" ? alpha(darkTeal.main, 0.8) : alpha(common.white, 0.8),
      disabled:
        mode === "light"
          ? alpha(neutral[1000], 0.38)
          : alpha(common.white, 0.48),
    },
    warning: papayaOrange,
  };
};

export const createComponents = (
  mode: "dark" | "light",
  palette: Palette,
): Components => {
  return {
    MuiAlert: {
      styleOverrides: {
        icon: {
          color:
            mode === "light"
              ? window.location.pathname === "/"
                ? `${palette.brand.main} !important`
                : ""
              : window.location.pathname === "/"
                ? `${common.white} !important`
                : "",
        },
        root: {
          color: mode === "light" ? palette.brand.main : common.white,
          borderColor: mode === "light" ? palette.brand.main : common.white,
          "&.MuiAlert-colorInfo": {
            backgroundColor:
              window.location.pathname === "/"
                ? "transparent"
                : mode === "light"
                  ? alpha(palette.brand.main, 0.06)
                  : alpha(common.white, 0.06),
          },
          "&.MuiAlert-colorSuccess": {
            color: irishGreen.main,
            backgroundColor:
              mode === "light"
                ? alpha(irishGreen.main, 0.06)
                : alpha(irishGreen.main, 0.16),
          },
          "&.MuiAlert-colorWarning": {
            color: papayaOrange.main,
            backgroundColor:
              mode === "light"
                ? alpha(papayaOrange.main, 0.06)
                : alpha(papayaOrange.main, 0.16),
          },
          "&.MuiAlert-colorError": {
            color: fadedRed.main,
            backgroundColor:
              mode === "light"
                ? alpha(fadedRed.main, 0.06)
                : alpha(fadedRed.main, 0.16),
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          [`&.${outlinedInputClasses.focused}`]: {
            [`& .${outlinedInputClasses.notchedOutline}`]: {
              borderWidth: "1px",
              borderColor:
                mode === "light" ? palette.brand.main : palette.primary.main,
              backgroundColor:
                mode === "light"
                  ? alpha(palette.brand.main, 0.06)
                  : alpha(palette.primary.main, 0.06),
            },
          },
        },
        option: {
          backgroundColor:
            mode === "light" ? white.main : alpha(common.white, 0.02),
          "&:hover": {
            backgroundColor:
              mode === "light"
                ? alpha(palette.primary.main, 0.16)
                : alpha(common.white, 0.06),
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          [`&:not(.${backdropClasses.invisible})`]: {
            backgroundColor:
              mode === "light" ? alpha(neutral[1000], 0.75) : neutral[800],
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderWidth: "1px",
          borderRadius: "8px",
          fontSize: "16px",
          padding: "10px 18px",
          gap: "6px",
          variants: [
            {
              props: { variant: "contained" },
              style: {
                backgroundColor: palette.primary.main,
                color: palette.brand.main,
                "&:hover": {
                  backgroundColor: alpha(palette.primary.main, 0.8),
                },
                "&:active": {
                  backgroundColor: alpha(palette.primary.main, 0.6),
                },
                "&.MuiButton-loading": {
                  backgroundColor:
                    mode === "light"
                      ? alpha(palette.brand.main, 0.2)
                      : alpha(common.white, 0.16),
                  color: "transparent",
                },
              },
            },
            {
              props: { variant: "outlined" },
              style: {
                backgroundColor: "transparent",
                borderColor:
                  mode === "light" ? palette.brand.main : common.white,
                color: mode === "light" ? palette.brand.main : common.white,
                "&:hover": {
                  backgroundColor: alpha(
                    mode === "light" ? palette.brand.main : common.white,
                    0.06,
                  ),
                },
              },
            },
            {
              props: { variant: "outlined", color: "secondary" },
              style: {
                backgroundColor: "transparent",
                borderColor: alpha(
                  mode === "light" ? palette.brand.main : common.white,
                  0.16,
                ),
                "&:hover": {
                  backgroundColor: alpha(
                    mode === "light" ? palette.brand.main : common.white,
                    0.06,
                  ),
                },
              },
            },
          ],
          color: palette.brand.main,
          ["&.Mui-disabled"]: {
            color:
              mode === "light"
                ? alpha(palette.brand.main, 0.2)
                : alpha(palette.brand.main, 0.6),
            backgroundColor: alpha(palette.primary.main, 0.2),
          },
        },
        startIcon: {
          margin: 0,
        },
      },
    },
    MuiCard: {
      variants: [
        {
          props: { variant: "landing" },
          style: {
            borderRadius: "12px",
          },
        },
        {
          props: { variant: "onboarding" },
          style: {
            backgroundColor:
              mode === "light" ? common.white : palette.brand.main,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: alpha(
              mode === "light" ? palette.brand.main : alpha(common.white, 0.16),
              0.16,
            ),
          },
        },
      ],
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "20px",
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: {
          variant: "landingH6",
        },
      },
      styleOverrides: {
        root: {
          padding: "32px 24px 16px",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 0,
          "&.Mui-checked": {
            color: mode === "light" ? palette.brand.main : palette.primary.main,
          },
          "&.Mui-checked:hover": {
            backgroundColor: "transparent",
          },
          "&MuiCheckbox-root": {
            strokeWidth: "1px",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: mode === "light" ? neutral[200] : neutral[700],
          fontWeight: 500,
          fontSize: "1rem",
          lineHeight: 1.4,
          padding: "18px 24px",
          borderRadius: "100px",
          icon: {
            color: palette.action.active,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          height: "1px",
          borderRadius: "2px",
          fontSize: "14px",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color:
            mode === "light"
              ? alpha(palette.brand.main, 0.6)
              : alpha(common.white, 0.6),
          "&.Mui-focused": {
            color: mode === "light" ? palette.brand.main : palette.primary.main,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        sizeSmall: {
          padding: 4,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: mode === "light" ? palette.brand.main : white.main,
          textDecorationColor:
            mode === "light" ? palette.brand.main : white.main,
          "&:hover": {
            color: alpha(
              mode === "light" ? palette.brand.main : white.main,
              0.8,
            ),
            textDecorationColor: alpha(
              mode === "light" ? palette.brand.main : white.main,
              0.8,
            ),
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor:
            mode === "light" ? common.white : alpha(common.white, 0.02),
          borderColor: palette.primary.main,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          "& .MuiMenu-paper": {
            borderColor:
              mode === "light" ? palette.primary.main : palette.primary.main,
            marginTop: "5px",
            border: "1px solid",
            borderRadius: "6px",
            backgroundColor:
              mode === "light" ? common.white : palette.brand.main,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor:
              mode === "light"
                ? alpha(palette.primary.main, 0.16)
                : alpha(common.white, 0.06),
          },
          "&.Mui-selected": {
            backgroundColor:
              mode === "light"
                ? alpha(palette.primary.main, 0.16)
                : alpha(common.white, 0.06),
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          backgroundColor:
            mode === "light" ? "transparent" : alpha(common.white, 0.02),
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: palette.primary.main,
          },
          "& .MuiOutlinedInput-input": {
            padding: "14px 12px",
          },
          [`&.${outlinedInputClasses.focused}`]: {
            [`& .${outlinedInputClasses.notchedOutline}`]: {
              borderWidth: "1px",
              borderColor: palette.primary.main,
              backgroundColor: alpha(palette.primary.main, 0.06),
            },
          },
        },
        notchedOutline: {
          borderColor:
            mode === "light"
              ? alpha(palette.brand.main, 0.16)
              : alpha(common.white, 0.2),
        },
        input: {
          fontSize: "1rem",
          fontWeight: 400,
          lineHeight: "20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          "&.MuiDialog-paper": {
            backgroundColor:
              mode === "light" ? common.white : alpha(common.white, 0.02),
          },
          "&.MuiPopover-paper": {
            borderRadius: "4px",
            borderColor: palette.primary.main,
          },
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        elevation: 16,
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          borderWidth: "1px",
          padding: 0,
          "&.Mui-checked": {
            color: mode === "light" ? palette.brand.main : palette.primary.main,
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background?.paper,
          borderRadius: "6px",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: mode === "light" ? palette.brand.main : white.main,
          height: "40px",
          borderColor: alpha(
            mode === "light" ? palette.brand.main : common.white,
            0.16,
          ),
          fontWeight: 400,
          textTransform: "none",
          backgroundColor: alpha(common.white, 0.02),
          ":hover": {
            backgroundColor:
              mode === "light" ? common.white : alpha(common.white, 0.02),
            border: "1px solid",
            borderColor: palette.primary.main,
          },
          "&.Mui-selected": {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.16),
          },
          "&.Mui-selected:hover": {
            boxShadow: "0px 0px 4px 0px rgba(143, 210, 219, 0.8)",
            backgroundColor: alpha(palette.primary.main, 0.16),
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor:
            mode === "light" ? common.white : alpha(common.white, 0.02),
          boxShadow: "none",
          borderBottom: `1px solid ${
            mode === "light"
              ? alpha(palette.brand.main, 0.16)
              : alpha(common.white, 0.16)
          }`,
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: "body3" },
          style: {
            fontSize: "0.75rem",
            fontWeight: 400,
            lineHeight: 1.5,
            display: "block",
          },
        },
        {
          props: { variant: "body4" },
          style: {
            fontSize: "0.625em",
            fontWeight: 400,
            lineHeight: "1.125em",
            letterHeight: "0em",
          },
        },
      ],
    },
  };
};
