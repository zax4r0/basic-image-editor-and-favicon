import { Header } from "../components/Header";
import ImageEditor from "../components/ImageEditor";
import { ThemeProvider } from "@/components/theme-provider";

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex flex-col items-center justify-center p-6 sm:p-24">
          <ImageEditor />
        </main>
      </div>
    </ThemeProvider>
  );
}
