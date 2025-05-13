import gluestackPlugin from "@gluestack-ui/nativewind-utils/tailwind-plugin";

//@ts-expect-error : nativewind/preset is not a module
import * as nativewind from "nativewind/preset";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "app/**/*.{tsx,jsx,ts,js}",
    "components/**/*.{tsx,jsx,ts,js}",
    "pages/**/*.{tsx,jsx,ts,js}",
  ],
  presets: [nativewind],
  important: "html",

  safelist: [
    // Your custom theme patterns
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
    },
    // Standard Tailwind CSS colors
    {
      pattern:
        /(bg|border|text|stroke|fill)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    // White and Black utilities
    {
      pattern: /(bg|border|text|stroke|fill)-(white|black|transparent|current)/,
    },
    // Opacity modifiers
    {
      pattern:
        /(bg|border|text|stroke|fill)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\/(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)/,
    },
    // Common utilities
    {
      pattern:
        /(flex|grid|block|hidden|inline|inline-block|inline-flex|table|table-cell|table-row)/,
    },
    // Spacing utilities
    {
      pattern:
        /(p|m|px|py|pt|pr|pb|pl|mx|my|mt|mr|mb|ml|space-x|space-y)-(0|px|0.5|1|1.5|2|2.5|3|3.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)/,
    },
    // Width and Height utilities
    {
      pattern:
        /(w|h)-(0|px|0.5|1|1.5|2|2.5|3|3.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|1\/2|1\/3|2\/3|1\/4|2\/4|3\/4|1\/5|2\/5|3\/5|4\/5|1\/6|2\/6|3\/6|4\/6|5\/6|1\/12|2\/12|3\/12|4\/12|5\/12|6\/12|7\/12|8\/12|9\/12|10\/12|11\/12|full|screen|min|max|fit)/,
    },
    // Max width utilities
    {
      pattern:
        /max-w-(0|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|min|max|fit|prose|screen-sm|screen-md|screen-lg|screen-xl|screen-2xl)/,
    },
    // Font utilities
    {
      pattern:
        /(font|text)-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
    },
    // Text size utilities
    {
      pattern: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
    },
    // Text alignment
    {
      pattern: /text-(left|center|right|justify|start|end)/,
    },
    // Flex utilities
    {
      pattern:
        /flex-(row|row-reverse|col|col-reverse|wrap|wrap-reverse|nowrap|1|auto|initial|none)/,
    },
    // Justify and align utilities
    {
      pattern:
        /(justify|items|content|align)-(normal|start|end|center|between|around|evenly|stretch|baseline)/,
    },
    // Border radius utilities
    {
      pattern:
        /rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?(-t|-r|-b|-l|-tl|-tr|-br|-bl)?/,
    },
    // Border width utilities
    {
      pattern: /border(-0|-2|-4|-8)?(-t|-r|-b|-l)?/,
    },
    // Shadow utilities
    {
      pattern: /shadow(-sm|-md|-lg|-xl|-2xl|-inner|-none)?/,
    },
    // Position utilities
    {
      pattern: /(static|fixed|absolute|relative|sticky)/,
    },
    // Top, Right, Bottom, Left utilities
    {
      pattern:
        /(top|right|bottom|left|inset|inset-x|inset-y)-(0|px|0.5|1|1.5|2|2.5|3|3.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|1\/2|1\/3|2\/3|1\/4|2\/4|3\/4|full|-px|-0.5|-1|-1.5|-2|-2.5|-3|-3.5|-4|-5|-6|-7|-8|-9|-10|-11|-12|-14|-16|-20|-24|-28|-32|-36|-40|-44|-48|-52|-56|-60|-64|-72|-80|-96)/,
    },
    // Z-index utilities
    {
      pattern: /z-(0|10|20|30|40|50|auto)/,
    },
    // Opacity utilities
    {
      pattern: /opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)/,
    },
    // Overflow utilities
    {
      pattern:
        /overflow-(auto|hidden|clip|visible|scroll|x-auto|y-auto|x-hidden|y-hidden|x-clip|y-clip|x-visible|y-visible|x-scroll|y-scroll)/,
    },
    // Display utilities
    {
      pattern:
        /(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item|hidden)/,
    },
    // Visibility utilities
    {
      pattern: /(visible|invisible|collapse)/,
    },
    // Cursor utilities
    {
      pattern:
        /cursor-(auto|default|pointer|wait|text|move|help|not-allowed|none|context-menu|progress|cell|crosshair|vertical-text|alias|copy|no-drop|grab|grabbing|all-scroll|col-resize|row-resize|n-resize|e-resize|s-resize|w-resize|ne-resize|nw-resize|se-resize|sw-resize|ew-resize|ns-resize|nesw-resize|nwse-resize|zoom-in|zoom-out)/,
    },
    // Transition utilities
    {
      pattern: /transition(-none|-all|-colors|-opacity|-shadow|-transform)?/,
    },
    // Duration utilities
    {
      pattern: /duration-(75|100|150|200|300|500|700|1000)/,
    },
    // Ease utilities
    {
      pattern: /ease-(linear|in|out|in-out)/,
    },
    // Transform utilities
    {
      pattern:
        /(scale|rotate|translate-x|translate-y|skew-x|skew-y)-(0|50|75|90|95|100|105|110|125|150|180)/,
    },
    // Aspect ratio utilities
    {
      pattern:
        /aspect-(auto|square|video|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16)/,
    },
    // Gap utilities
    {
      pattern:
        /(gap|gap-x|gap-y)-(0|px|0.5|1|1.5|2|2.5|3|3.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)/,
    },
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          0: "rgb(var(--color-primary-0)/<alpha-value>)",
          50: "rgb(var(--color-primary-50)/<alpha-value>)",
          100: "rgb(var(--color-primary-100)/<alpha-value>)",
          200: "rgb(var(--color-primary-200)/<alpha-value>)",
          300: "rgb(var(--color-primary-300)/<alpha-value>)",
          400: "rgb(var(--color-primary-400)/<alpha-value>)",
          500: "rgb(var(--color-primary-500)/<alpha-value>)",
          600: "rgb(var(--color-primary-600)/<alpha-value>)",
          700: "rgb(var(--color-primary-700)/<alpha-value>)",
          800: "rgb(var(--color-primary-800)/<alpha-value>)",
          900: "rgb(var(--color-primary-900)/<alpha-value>)",
          950: "rgb(var(--color-primary-950)/<alpha-value>)",
        },
        secondary: {
          0: "rgb(var(--color-secondary-0)/<alpha-value>)",
          50: "rgb(var(--color-secondary-50)/<alpha-value>)",
          100: "rgb(var(--color-secondary-100)/<alpha-value>)",
          200: "rgb(var(--color-secondary-200)/<alpha-value>)",
          300: "rgb(var(--color-secondary-300)/<alpha-value>)",
          400: "rgb(var(--color-secondary-400)/<alpha-value>)",
          500: "rgb(var(--color-secondary-500)/<alpha-value>)",
          600: "rgb(var(--color-secondary-600)/<alpha-value>)",
          700: "rgb(var(--color-secondary-700)/<alpha-value>)",
          800: "rgb(var(--color-secondary-800)/<alpha-value>)",
          900: "rgb(var(--color-secondary-900)/<alpha-value>)",
          950: "rgb(var(--color-secondary-950)/<alpha-value>)",
        },
        tertiary: {
          50: "rgb(var(--color-tertiary-50)/<alpha-value>)",
          100: "rgb(var(--color-tertiary-100)/<alpha-value>)",
          200: "rgb(var(--color-tertiary-200)/<alpha-value>)",
          300: "rgb(var(--color-tertiary-300)/<alpha-value>)",
          400: "rgb(var(--color-tertiary-400)/<alpha-value>)",
          500: "rgb(var(--color-tertiary-500)/<alpha-value>)",
          600: "rgb(var(--color-tertiary-600)/<alpha-value>)",
          700: "rgb(var(--color-tertiary-700)/<alpha-value>)",
          800: "rgb(var(--color-tertiary-800)/<alpha-value>)",
          900: "rgb(var(--color-tertiary-900)/<alpha-value>)",
          950: "rgb(var(--color-tertiary-950)/<alpha-value>)",
        },
        error: {
          0: "rgb(var(--color-error-0)/<alpha-value>)",
          50: "rgb(var(--color-error-50)/<alpha-value>)",
          100: "rgb(var(--color-error-100)/<alpha-value>)",
          200: "rgb(var(--color-error-200)/<alpha-value>)",
          300: "rgb(var(--color-error-300)/<alpha-value>)",
          400: "rgb(var(--color-error-400)/<alpha-value>)",
          500: "rgb(var(--color-error-500)/<alpha-value>)",
          600: "rgb(var(--color-error-600)/<alpha-value>)",
          700: "rgb(var(--color-error-700)/<alpha-value>)",
          800: "rgb(var(--color-error-800)/<alpha-value>)",
          900: "rgb(var(--color-error-900)/<alpha-value>)",
          950: "rgb(var(--color-error-950)/<alpha-value>)",
        },
        success: {
          0: "rgb(var(--color-success-0)/<alpha-value>)",
          50: "rgb(var(--color-success-50)/<alpha-value>)",
          100: "rgb(var(--color-success-100)/<alpha-value>)",
          200: "rgb(var(--color-success-200)/<alpha-value>)",
          300: "rgb(var(--color-success-300)/<alpha-value>)",
          400: "rgb(var(--color-success-400)/<alpha-value>)",
          500: "rgb(var(--color-success-500)/<alpha-value>)",
          600: "rgb(var(--color-success-600)/<alpha-value>)",
          700: "rgb(var(--color-success-700)/<alpha-value>)",
          800: "rgb(var(--color-success-800)/<alpha-value>)",
          900: "rgb(var(--color-success-900)/<alpha-value>)",
          950: "rgb(var(--color-success-950)/<alpha-value>)",
        },
        warning: {
          0: "rgb(var(--color-warning-0)/<alpha-value>)",
          50: "rgb(var(--color-warning-50)/<alpha-value>)",
          100: "rgb(var(--color-warning-100)/<alpha-value>)",
          200: "rgb(var(--color-warning-200)/<alpha-value>)",
          300: "rgb(var(--color-warning-300)/<alpha-value>)",
          400: "rgb(var(--color-warning-400)/<alpha-value>)",
          500: "rgb(var(--color-warning-500)/<alpha-value>)",
          600: "rgb(var(--color-warning-600)/<alpha-value>)",
          700: "rgb(var(--color-warning-700)/<alpha-value>)",
          800: "rgb(var(--color-warning-800)/<alpha-value>)",
          900: "rgb(var(--color-warning-900)/<alpha-value>)",
          950: "rgb(var(--color-warning-950)/<alpha-value>)",
        },
        info: {
          0: "rgb(var(--color-info-0)/<alpha-value>)",
          50: "rgb(var(--color-info-50)/<alpha-value>)",
          100: "rgb(var(--color-info-100)/<alpha-value>)",
          200: "rgb(var(--color-info-200)/<alpha-value>)",
          300: "rgb(var(--color-info-300)/<alpha-value>)",
          400: "rgb(var(--color-info-400)/<alpha-value>)",
          500: "rgb(var(--color-info-500)/<alpha-value>)",
          600: "rgb(var(--color-info-600)/<alpha-value>)",
          700: "rgb(var(--color-info-700)/<alpha-value>)",
          800: "rgb(var(--color-info-800)/<alpha-value>)",
          900: "rgb(var(--color-info-900)/<alpha-value>)",
          950: "rgb(var(--color-info-950)/<alpha-value>)",
        },
        typography: {
          0: "rgb(var(--color-typography-0)/<alpha-value>)",
          50: "rgb(var(--color-typography-50)/<alpha-value>)",
          100: "rgb(var(--color-typography-100)/<alpha-value>)",
          200: "rgb(var(--color-typography-200)/<alpha-value>)",
          300: "rgb(var(--color-typography-300)/<alpha-value>)",
          400: "rgb(var(--color-typography-400)/<alpha-value>)",
          500: "rgb(var(--color-typography-500)/<alpha-value>)",
          600: "rgb(var(--color-typography-600)/<alpha-value>)",
          700: "rgb(var(--color-typography-700)/<alpha-value>)",
          800: "rgb(var(--color-typography-800)/<alpha-value>)",
          900: "rgb(var(--color-typography-900)/<alpha-value>)",
          950: "rgb(var(--color-typography-950)/<alpha-value>)",
          white: "#FFFFFF",
          gray: "#D4D4D4",
          black: "#181718",
        },
        outline: {
          0: "rgb(var(--color-outline-0)/<alpha-value>)",
          50: "rgb(var(--color-outline-50)/<alpha-value>)",
          100: "rgb(var(--color-outline-100)/<alpha-value>)",
          200: "rgb(var(--color-outline-200)/<alpha-value>)",
          300: "rgb(var(--color-outline-300)/<alpha-value>)",
          400: "rgb(var(--color-outline-400)/<alpha-value>)",
          500: "rgb(var(--color-outline-500)/<alpha-value>)",
          600: "rgb(var(--color-outline-600)/<alpha-value>)",
          700: "rgb(var(--color-outline-700)/<alpha-value>)",
          800: "rgb(var(--color-outline-800)/<alpha-value>)",
          900: "rgb(var(--color-outline-900)/<alpha-value>)",
          950: "rgb(var(--color-outline-950)/<alpha-value>)",
        },
        background: {
          0: "rgb(var(--color-background-0)/<alpha-value>)",
          50: "rgb(var(--color-background-50)/<alpha-value>)",
          100: "rgb(var(--color-background-100)/<alpha-value>)",
          200: "rgb(var(--color-background-200)/<alpha-value>)",
          300: "rgb(var(--color-background-300)/<alpha-value>)",
          400: "rgb(var(--color-background-400)/<alpha-value>)",
          500: "rgb(var(--color-background-500)/<alpha-value>)",
          600: "rgb(var(--color-background-600)/<alpha-value>)",
          700: "rgb(var(--color-background-700)/<alpha-value>)",
          800: "rgb(var(--color-background-800)/<alpha-value>)",
          900: "rgb(var(--color-background-900)/<alpha-value>)",
          950: "rgb(var(--color-background-950)/<alpha-value>)",
          error: "rgb(var(--color-background-error)/<alpha-value>)",
          warning: "rgb(var(--color-background-warning)/<alpha-value>)",
          muted: "rgb(var(--color-background-muted)/<alpha-value>)",
          success: "rgb(var(--color-background-success)/<alpha-value>)",
          info: "rgb(var(--color-background-info)/<alpha-value>)",
          light: "#FBFBFB",
          dark: "#181719",
        },
        indicator: {
          primary: "rgb(var(--color-indicator-primary)/<alpha-value>)",
          info: "rgb(var(--color-indicator-info)/<alpha-value>)",
          error: "rgb(var(--color-indicator-error)/<alpha-value>)",
        },
      },
      fontFamily: {
        heading: undefined,
        body: undefined,
        mono: undefined,
        roboto: ["Roboto", "sans-serif"],
      },
      fontWeight: {
        extrablack: "950",
      },
      fontSize: {
        "2xs": "10px",
      },
      boxShadow: {
        "hard-1": "-2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
        "hard-2": "0px 3px 10px 0px rgba(38, 38, 38, 0.20)",
        "hard-3": "2px 2px 8px 0px rgba(38, 38, 38, 0.20)",
        "hard-4": "0px -3px 10px 0px rgba(38, 38, 38, 0.20)",
        "hard-5": "0px 2px 10px 0px rgba(38, 38, 38, 0.10)",
        "soft-1": "0px 0px 10px rgba(38, 38, 38, 0.1)",
        "soft-2": "0px 0px 20px rgba(38, 38, 38, 0.2)",
        "soft-3": "0px 0px 30px rgba(38, 38, 38, 0.1)",
        "soft-4": "0px 0px 40px rgba(38, 38, 38, 0.1)",
      },
    },
  },

  plugins: [gluestackPlugin],
};
