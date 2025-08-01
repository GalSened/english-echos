import { EnglishTeacher } from "@/components/EnglishTeacher";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ThemeSelectorCompact } from "@/components/ThemeSelectorCompact";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      <div className="container mx-auto py-8 relative">
        {/* Theme selector positioned on the left side */}
        <div className="fixed top-4 left-6 z-50 hidden md:block">
          <ThemeSelector />
        </div>
        
        {/* Mobile theme selector - compact version on the left */}
        <div className="md:hidden mb-6 flex justify-start">
          <ThemeSelectorCompact />
        </div>
        
        <EnglishTeacher />
      </div>
    </div>
  );
};

export default Index;
