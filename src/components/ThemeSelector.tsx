import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Monitor } from "lucide-react";

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <Card className="w-80 shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Moon className="h-4 w-4" />
          Theme Preference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="space-y-2"
        >
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.value;
            
            return (
              <div
                key={themeOption.value}
                className={`
                  relative flex items-center space-x-3 rounded-md border p-3 cursor-pointer
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
                  className={`h-4 w-4 shrink-0 ${
                    isSelected ? 'text-primary' : 'text-muted-foreground'
                  }`} 
                />
                <Label 
                  htmlFor={themeOption.value}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-foreground' : 'text-foreground'
                    }`}>
                      {themeOption.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </span>
                  </div>
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
  );
};