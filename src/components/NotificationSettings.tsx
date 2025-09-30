import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Clock, Calendar } from "lucide-react";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  type NotificationSettings as NotificationSettingsType,
} from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettingsType>(getNotificationSettings());
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [isSupported] = useState(isNotificationSupported());

  useEffect(() => {
    setSettings(getNotificationSettings());
    setPermission(getNotificationPermission());
  }, []);

  const handleEnableToggle = async (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission !== "granted") {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        return;
      }
    }

    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    toast({
      title: enabled ? "Notifications Enabled" : "Notifications Disabled",
      description: enabled
        ? "You'll receive daily practice reminders at your chosen time."
        : "Daily practice reminders are now disabled.",
    });
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...settings, time };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    toast({
      title: "Time Updated",
      description: `Daily reminders will be sent at ${time}`,
    });
  };

  const handleDayToggle = (day: number) => {
    const days = settings.days.includes(day)
      ? settings.days.filter((d) => d !== day)
      : [...settings.days, day].sort();

    const newSettings = { ...settings, days };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    toast({
      title: "Days Updated",
      description: `Reminders will be sent on ${days.length} day${days.length !== 1 ? "s" : ""} per week`,
    });
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Daily Practice Reminders
          </CardTitle>
          <CardDescription>
            Notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Daily Practice Reminders
        </CardTitle>
        <CardDescription>
          Get reminded to practice English every day. Stay consistent and improve faster!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive daily practice reminders
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={settings.enabled}
            onCheckedChange={handleEnableToggle}
          />
        </div>

        {settings.enabled && permission === "granted" && (
          <>
            {/* Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reminder Time
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={settings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="max-w-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                Choose when you'd like to receive your daily reminder
              </p>
            </div>

            {/* Days of Week */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Active Days
              </Label>
              <div className="flex gap-2">
                {dayNames.map((day, index) => (
                  <Button
                    key={index}
                    variant={settings.days.includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDayToggle(index)}
                    className="w-12"
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Select which days you want to receive reminders
              </p>
            </div>

            {/* Last Practice Info */}
            {settings.lastPracticeDate && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Last Practice</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(settings.lastPracticeDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </>
        )}

        {settings.enabled && permission !== "granted" && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Permission Required
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Please allow notifications in your browser settings to receive practice reminders.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={async () => {
                const newPermission = await requestNotificationPermission();
                setPermission(newPermission);
              }}
            >
              Request Permission
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}