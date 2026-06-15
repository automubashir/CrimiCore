import localFont from 'next/font/local'

export const ibmPlexSans = localFont(
    {
        src: '../assets/fonts/IBMPlexSans-VariableFont_wdth,wght.ttf',
        variable: "--font-ibm-plex",
        weight: "100 900",
        display: "swap",
    }
)