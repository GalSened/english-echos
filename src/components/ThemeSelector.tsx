import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return null;
  }

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Clean and bright interface"
    },
    {
      value: "dark", 
      label: "Dark",
      icon: Moon,
      description: "Easy on the eyes"
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follows your device setting"
    }
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Palette;

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
    >
      {/* Trigger Element */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-popover backdrop-blur-sm border border-border cursor-pointer hover:bg-muted/50 transition-colors shadow-sm">
        <CurrentIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground hidden sm:inline">Theme</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-[60]">
          <Card className="w-64 shadow-lg border-border/50 backdrop-blur-sm bg-popover border">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Palette className="h-3 w-3" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <RadioGroup
                value={theme}
                onValueChange={handleThemeChange}
                className="space-y-1"
              >
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isSelected = theme === themeOption.value;
                  
                  return (
                    <div
                      key={themeOption.value}
                      className={`
                        relative flex items-center space-x-2 rounded-md border p-2 cursor-pointer
                        transition-all duration-200 hover:bg-muted/50
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                          : 'border-border hover:border-primary/30'
                        }
                      `}
                    >
                      <RadioGroupItem
                        value={themeOption.value}
                        id={themeOption.value}
                        className="shrink-0"
                      />
                      <Icon 
                        className={`h-3 w-3 shrink-0 ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`} 
                      />
                      <Label 
                        htmlFor={themeOption.value}
                        className="flex-1 cursor-pointer"
                      >
                        <span className={`text-xs font-medium ${
                          isSelected ? 'text-foreground' : 'text-foreground'
                        }`}>
                          {themeOption.label}
                        </span>
                      </Label>
                      {isSelected && (
                        <div className="absolute inset-0 rounded-md ring-2 ring-primary/30 pointer-events-none animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};