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
    <Card className="w-64 shadow-md border-border/50 backdrop-blur-sm bg-card/95">
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Moon className="h-3 w-3" />
          Theme
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
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
  );
};