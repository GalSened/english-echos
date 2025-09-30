// Daily Practice Notification System for SpeakEng

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM" (24-hour)
  days: number[]; // 0-6 (Sunday-Saturday)
  lastPracticeDate: string; // ISO date string
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  time: "19:00", // 7 PM default
  days: [0, 1, 2, 3, 4, 5, 6], // Every day
  lastPracticeDate: "",
};

const STORAGE_KEY = "notification_settings";
const LAST_PRACTICE_KEY = "last_practice_date";

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.log("[Notifications] Not supported in this browser");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    console.log("[Notifications] Permission:", permission);
    return permission;
  } catch (error) {
    console.error("[Notifications] Permission request failed:", error);
    return "denied";
  }
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission;
}

// Get notification settings
export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("[Notifications] Failed to load settings:", error);
  }
  return DEFAULT_SETTINGS;
}

// Save notification settings
export function saveNotificationSettings(settings: Partial<NotificationSettings>): void {
  try {
    const current = getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log("[Notifications] Settings saved:", updated);

    // Reschedule notifications with new settings
    scheduleNotifications();
  } catch (error) {
    console.error("[Notifications] Failed to save settings:", error);
  }
}

// Mark that user practiced today
export function markPracticeToday(): void {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(LAST_PRACTICE_KEY, today);

  // Update in settings
  const settings = getNotificationSettings();
  settings.lastPracticeDate = today;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

  console.log("[Notifications] Practice marked for:", today);
}

// Check if user practiced today
export function hasPracticedToday(): boolean {
  const lastPractice = localStorage.getItem(LAST_PRACTICE_KEY);
  if (!lastPractice) return false;

  const today = new Date().toISOString().split("T")[0];
  return lastPractice === today;
}

// Show notification
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isNotificationSupported()) {
    console.log("[Notifications] Not supported");
    return;
  }

  if (Notification.permission !== "granted") {
    console.log("[Notifications] Permission not granted");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: "/icon-192.png",
      badge: "/icon-72.png",
      vibrate: [200, 100, 200],
      tag: "daily-practice",
      renotify: false,
      requireInteraction: false,
      ...options,
    });
    console.log("[Notifications] Shown:", title);
  } catch (error) {
    console.error("[Notifications] Failed to show:", error);
  }
}

// Send daily practice reminder
export async function sendPracticeReminder(): Promise<void> {
  if (hasPracticedToday()) {
    console.log("[Notifications] User already practiced today");
    return;
  }

  const messages = [
    {
      title: "Time to practice English! 🎯",
      body: "Just 5 minutes of conversation can improve your skills. Let's chat!",
    },
    {
      title: "Don't break your streak! 🔥",
      body: "A quick English practice session awaits. Ready to continue?",
    },
    {
      title: "Your English teacher is waiting! 👨‍🏫",
      body: "Let's have a conversation and improve your fluency today.",
    },
    {
      title: "Practice makes perfect! ⭐",
      body: "Take a few minutes to practice English and reach your goals.",
    },
    {
      title: "English time! 📚",
      body: "Daily practice is the key to fluency. Start a conversation now!",
    },
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  await showNotification(randomMessage.title, {
    body: randomMessage.body,
    data: {
      url: "/",
      action: "practice",
    },
    actions: [
      {
        action: "practice",
        title: "Start Practice",
      },
      {
        action: "later",
        title: "Later",
      },
    ],
  });
}

// Schedule notifications
export function scheduleNotifications(): void {
  if (!isNotificationSupported()) {
    console.log("[Notifications] Not supported, skipping schedule");
    return;
  }

  const settings = getNotificationSettings();

  if (!settings.enabled) {
    console.log("[Notifications] Disabled, skipping schedule");
    return;
  }

  if (Notification.permission !== "granted") {
    console.log("[Notifications] Permission not granted, skipping schedule");
    return;
  }

  console.log("[Notifications] Scheduling with settings:", settings);

  // Clear any existing timers
  clearScheduledNotifications();

  // Calculate time until next notification
  const now = new Date();
  const [hours, minutes] = settings.time.split(":").map(Number);

  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilNotification = scheduledTime.getTime() - now.getTime();

  // Schedule the notification
  const timerId = setTimeout(() => {
    checkAndSendNotification();
    // Reschedule for next day
    scheduleNotifications();
  }, timeUntilNotification);

  // Store timer ID
  sessionStorage.setItem("notification_timer", String(timerId));

  console.log(
    `[Notifications] Scheduled for ${scheduledTime.toLocaleString()} (in ${Math.round(
      timeUntilNotification / 1000 / 60
    )} minutes)`
  );
}

// Clear scheduled notifications
export function clearScheduledNotifications(): void {
  const timerId = sessionStorage.getItem("notification_timer");
  if (timerId) {
    clearTimeout(Number(timerId));
    sessionStorage.removeItem("notification_timer");
    console.log("[Notifications] Cleared scheduled notifications");
  }
}

// Check if today is a notification day and send reminder
async function checkAndSendNotification(): Promise<void> {
  const settings = getNotificationSettings();
  const today = new Date().getDay(); // 0-6

  // Check if today is in the enabled days
  if (!settings.days.includes(today)) {
    console.log("[Notifications] Not scheduled for today");
    return;
  }

  // Check if user already practiced today
  if (hasPracticedToday()) {
    console.log("[Notifications] User already practiced today");
    return;
  }

  // Send the reminder
  await sendPracticeReminder();
}

// Initialize notifications on app start
export async function initializeNotifications(): Promise<void> {
  console.log("[Notifications] Initializing...");

  if (!isNotificationSupported()) {
    console.log("[Notifications] Not supported in this browser");
    return;
  }

  const settings = getNotificationSettings();

  if (settings.enabled && Notification.permission === "default") {
    // Ask for permission on first launch
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      scheduleNotifications();
    }
  } else if (settings.enabled && Notification.permission === "granted") {
    // User has already granted permission
    scheduleNotifications();
  }

  // Check immediately if we should send a reminder
  // (useful if app is opened after scheduled time)
  const now = new Date();
  const [hours, minutes] = settings.time.split(":").map(Number);
  const scheduledHour = hours;

  // If current time is past scheduled time and user hasn't practiced
  if (now.getHours() >= scheduledHour && !hasPracticedToday()) {
    console.log("[Notifications] Checking if reminder needed now...");
    await checkAndSendNotification();
  }

  console.log("[Notifications] Initialization complete");
}

// Hook to track practice activity
export function setupPracticeTracking(): void {
  // Listen for user activity that counts as practice
  window.addEventListener("user-practiced", () => {
    markPracticeToday();
  });

  console.log("[Notifications] Practice tracking set up");
}