import { EnglishTeacher } from "@/components/EnglishTeacher";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/30 to-secondary/20">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Mobile header with hamburger menu */}
          <header className="lg:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-3 flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="font-semibold">English Teacher</h1>
          </header>

          {/* Main content */}
          <div className="flex-1 container mx-auto px-4 py-4 sm:py-6 lg:py-8">
            <EnglishTeacher />
          </div>
        </main>
        
        {/* Performance monitor for debugging */}
        <PerformanceMonitor />
      </div>
    </SidebarProvider>
  );
};

export default Index;
