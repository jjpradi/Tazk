import { minHeight } from '@mui/system';
import {
  Fonts,
  FooterType,
  HeaderType,
  LayoutDirection,
  LayoutType,
  MenuStyle,
  NavStyle,
  RouteTransition,
  ThemeMode,
  ThemeStyle,
  ThemeStyleRadius,
} from 'shared/constants/AppEnums';

export const textLight = {
  primary: 'rgb(17, 24, 39)',
  secondary: 'rgb(107, 114, 128)',
  disabled: 'rgb(149, 156, 169)',
};

export const textDark = {
  primary: 'rgb(255,255,255)',
  secondary: 'rgb(229, 231, 235)',
  disabled: 'rgb(156, 163, 175)',
};

export const backgroundDark = {
  paper: '#2B3137',
  default: '#1F2527',
};

export const backgroundLight = {
  paper: '#FFFFFF',
  default: '#F4F7FE',
};

const cardRadius = ThemeStyleRadius.STANDARD;
export const defaultTheme = {
  theme: {
    spacing: 4,
    cardRadius: cardRadius,
    direction: LayoutDirection.LTR, //ltr, rtl
    palette: {
      mode: ThemeMode.LIGHT,
      background: {
        paper: '#FFFFFF',
        default: '#F4F7FE',
      },
      primary: {
        main: '#0A8FDC',
        contrastText: '#fff',
      },
      secondary: {
        main: '#F04F47',
      },
      success: {
        main: '#11C15B',
        light: '#D9F5E5',
      },
      warning: {
        main: '#FF5252',
        light: '#FFECDC',
      },
      error: {
        main: '#d32f2f',
        light: '#FDECEA',
      },
      info: {
        main: '#0288d1',
        light: '#E1F5FE',
      },
      text: textLight,
      gray: {
        50: '#fafafa',
        100: '#F5F6FA',
        200: '#edf2f7',
        300: '#E0E0E0',
        400: '#c5c6cb',
        500: '#A8A8A8',
        600: '#666666',
        700: '#4a5568',
        800: '#201e21',
        900: '#1a202c',
        A100: '#d5d5d5',
        A200: '#aaaaaa',
        A400: '#303030',
        A700: '#616161',
      },
    },
    status: {
      danger: 'orange',
    },
    divider: 'rgba(224, 224, 224, 1)',
    typography: {
      fontFamily: ['Poppins', 'sans-serif'].join(','),
      fontSize: 14,
      fontWeight: 400,
      h1: {
        fontSize: 22,
        fontWeight: 600,
      },
      h2: {
        fontSize: 20,
        fontWeight: 500,
      },
      h3: {
        fontSize: 18,
        fontWeight: 500,
      },
      h4: {
        fontSize: 16,
        fontWeight: 500,
      },
      h5: {
        fontSize: 14,
        fontWeight: 500,
      },
      h6: {
        fontSize: 13,
        fontWeight: 600,
        color: 'rgba(0, 0, 0, 0.7)',
      },
      subtitle1: {
        fontSize: 14,
      },
      subtitle2: {
        fontSize: 16,
      },
      body1: {
        fontSize: 14,
      },
      body2: {
        fontSize: 12,
      },
    },
    components: {
      MuiTextField: {
        defaultProps: {
          size: 'small',
          variant: 'filled',
          onKeyDown: (e) => {
            const invalidKeys = ['e', 'E', '+', '-'];
            const inputType = e?.target?.type;
            if (inputType === 'number' && invalidKeys.includes(e.key)) {
              e.preventDefault();
            }
          }
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: 'small',
        },
      },
      // MuiAutocomplete: {
      //   styleOverrides: {
      //     root: {
      //       '& .MuiFilledInput-root': {
      //         height: '46px', //  Autocomplete input height
      //         paddingTop : '10px !important', // Autocomplete + icon
      //       },
      //     },
      //   },
      // },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '& .MuiFilledInput-root': {
              minHeight: '46px !important', // Autocomplete input height
              paddingTop: '10px !important', // Autocomplete + icon
            },
            '&.MuiAutocomplete-multiple .MuiFilledInput-root': {
              height: 'auto', // Auto height when multiple items are selected
              paddingTop: '10px !important', // Padding for autocomplete + icon (same as single select)
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: cardRadius,
          },
        },
      },
      MuiCardLg: {
        styleOverrides: {
          root: {
            // apply theme's border-radius instead of component's default
            borderRadius:
              cardRadius === ThemeStyleRadius.STANDARD
                ? ThemeStyleRadius.STANDARD
                : ThemeStyleRadius.MODERN + 20,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0px 10px 10px 4px rgba(0, 0, 0, 0.04)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          elevation1: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          },
          elevation3: {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'capitalize',
            fontWeight: 500,
            padding: '6px 16px',
            transition: 'all 0.2s ease',
          },
        },
        defaultProps: {
          size: 'small',
          disableElevation: true,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            borderRadius: '6px 6px 0 0',
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            // borderRadius: cardRadius / 2,
          },
        },
        defaultProps: {
          size: 'small',
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: 9,
            borderRadius: 8,
            transition: 'background-color 0.2s ease',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            fontWeight: Fonts.REGULAR,
          },
        },
      },
      /* MuiInputLabel moved to below with full overrides */
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
          },
        },
        defaultProps: {
          size: 'small',
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
          },
        },
      },
      MuiDatePicker:{
        defaultProps: {
          inputFormat: 'DD/MM/yyyy'
        },
      },
      MuiDateTimePicker:{
        defaultProps: {
          inputFormat: 'DD/MM/yyyy'
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: 12,
            fontFamily: 'Poppins, sans-serif',
            padding: '8px 16px',
            borderBottom: '1px solid rgb(224,224,224)',
            color: 'rgb(17,24,39)',
          },
          head: {
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(0,0,0,0.7)',
            padding: '10px 16px',
            backgroundColor: '#f5f5f5',
            lineHeight: '1.5rem',
          },
          body: {
            fontSize: 12,
            fontWeight: 400,
            color: 'rgba(0,0,0,0.7)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            height: 38,
            transition: 'background-color 0.2s ease',
            '&:hover': { backgroundColor: '#EDF4FA' },
          },
          footer: { minHeight: 55 },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: {
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(0,0,0,0.7)',
            '&:hover': { color: 'rgba(0,0,0,0.87)' },
            '&.Mui-active': { color: '#0A8FDC' },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          displayedRows: { fontSize: 12, color: 'rgba(0,0,0,0.7)' },
          selectLabel: { fontSize: 12, color: 'rgba(0,0,0,0.7)' },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontSize: 13,
            fontWeight: 500,
            textTransform: 'capitalize',
            '&.Mui-selected': { fontWeight: 600 },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: { padding: 3, fontSize: 12 },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: 44,
            '&.Mui-expanded': { minHeight: 44 },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: '#e0e0e0', borderRadius: 4 },
          bar: { borderRadius: 4 },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'Poppins, sans-serif',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            backgroundColor: 'white',
            padding: '20px 24px',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 24px',
            borderTop: '1px solid rgba(224, 224, 224, 1)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 13,
            fontFamily: 'Poppins, sans-serif',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            fontSize: 14,
            fontFamily: 'Poppins, sans-serif',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: 13,
            fontFamily: 'Poppins, sans-serif',
          },
          asterisk: {
            color: 'red',
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: '#0A8FDC',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          cell: {
            fontSize: 12,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 400,
            color: 'rgba(0,0,0,0.7)',
          },
        },
      },
    },
  },
};
export const DarkSidebar = {
  sidebarBgColor: '#313541',
  sidebarTextColor: '#fff',
  sidebarHeaderColor: '#313541',
  sidebarMenuSelectedBgColor: '#F4F7FE',
  sidebarMenuSelectedTextColor: 'rgba(0, 0, 0, 0.87)',
  mode: ThemeMode.DARK,
};
export const LightSidebar = {
  sidebarBgColor: '#fff',
  sidebarTextColor: 'rgba(0, 0, 0, 0.60)',
  sidebarHeaderColor: '#fff',
  sidebarMenuSelectedBgColor: '#F4F7FE',
  sidebarMenuSelectedTextColor: 'rgba(0, 0, 0, 0.87)',
  mode: ThemeMode.LIGHT,
};
const defaultConfig = {
  sidebar: {
    borderColor: '#757575',
    menuStyle: MenuStyle.DEFAULT,
    colorSet: LightSidebar,
  },
  themeStyle: ThemeStyle.STANDARD,
  themeMode: ThemeMode.LIGHT,
  navStyle: NavStyle.HEADER_USER_MINI,
  layoutType: LayoutType.FULL_WIDTH,
  footerType: FooterType.FLUID,
  headerType: HeaderType.FIXED,
  rtAnim: RouteTransition.NONE,
  footer: false,
  locale: {
    languageId: 'english',
    locale: 'en',
    name: 'English',
    icon: 'us',
  },
  rtlLocale: ['ar'],
};
export default defaultConfig;
