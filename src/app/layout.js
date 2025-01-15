import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import "./globals.css";
import TokenContext from "@/Helper/Context";

export const metadata = {
  title: "Token Exchange",
  description: "A simple cryptocurrency exchange app",
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TokenContext>{children}</TokenContext>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
