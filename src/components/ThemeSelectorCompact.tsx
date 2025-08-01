import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

export const ThemeSelectorCompact = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor }
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 bg-popover backdrop-blur-sm border-border hover:bg-muted/50 shadow-sm"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme?.label || "Theme"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-36 z-50 bg-popover/95 border border-border shadow-lg backdrop-blur-sm"
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.value;
          
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center gap-2 cursor-pointer ${
                isSelected ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              {themeOption.label}
              {isSelected && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};