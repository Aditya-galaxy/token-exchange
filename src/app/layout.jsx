import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import "./globals.css";
import TokenContext from "@/Helper/Context";
import App from "@/components/App/App";
import { Toaster } from "sonner";

export const metadata = {
  title: "Token Exchange",
  description: "A simple demo cryptocurrency exchange app",
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
            <TokenContext><App>{children}</App></TokenContext>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
