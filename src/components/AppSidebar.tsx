import { Home, Settings, BarChart3, Palette, Info, Bell } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeSelectorCompact } from "./ThemeSelectorCompact";
import { NotificationSettings } from "./NotificationSettings";

const navigationItems = [
  { title: "Practice", url: "/", icon: Home },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <Sidebar
      className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      collapsible="icon"
    >
      <SidebarContent className="gap-0">
        {/* Theme Selector Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium">
            {!isCollapsed && "Appearance"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              <ThemeSelectorCompact />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} className="w-full" asChild>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Notifications Settings */}
              <SidebarMenuItem>
                <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton tooltip="Notifications" className="w-full">
                      <Bell className="h-4 w-4" />
                      {!isCollapsed && <span>Notifications</span>}
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Daily Practice Reminders</DialogTitle>
                      <DialogDescription>
                        Configure when you want to receive reminders to practice English
                      </DialogDescription>
                    </DialogHeader>
                    <NotificationSettings />
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* App Info Section */}
        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                <p className="font-medium">English Teacher</p>
                <p>AI-powered language practice</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}