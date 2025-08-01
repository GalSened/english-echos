import { EnglishTeacher } from "@/components/EnglishTeacher";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ThemeSelectorCompact } from "@/components/ThemeSelectorCompact";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 relative">
        {/* Theme selector positioned on the left side */}
        <div className="fixed top-2 sm:top-4 left-2 sm:left-6 z-50 hidden md:block">
          <ThemeSelector />
        </div>
        
        {/* Mobile theme selector - compact version on the left */}
        <div className="md:hidden mb-4 flex justify-start px-2">
          <ThemeSelectorCompact />
        </div>
        
        <EnglishTeacher />
      </div>
    </div>
  );
};

export default Index;
