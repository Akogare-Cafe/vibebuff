"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Settings,
  Save,
  Loader2,
  Globe,
  Github,
  Twitter,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
  LayoutGrid,
  Moon,
  Sun,
  Monitor,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Home,
  Backpack,
  MessageSquare,
  Play,
} from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TabType = "profile" | "notifications" | "privacy" | "preferences";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        ${enabled ? "bg-primary" : "bg-muted"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
          ${enabled ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const settings = useQuery(
    api.userSettings.getSettings,
    user?.id ? { userId: user.id } : "skip"
  );

  const profile = useQuery(
    api.userProfiles.getProfile,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateProfile = useMutation(api.userSettings.updateProfile);
  const updateNotifications = useMutation(api.userSettings.updateNotifications);
  const updatePrivacy = useMutation(api.userSettings.updatePrivacy);
  const updatePreferences = useMutation(api.userSettings.updatePreferences);
  const updateUserProfile = useMutation(api.userProfiles.updateProfile);
  const deleteAccountMutation = useMutation(api.userSettings.deleteAccount);

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    githubUsername: "",
    twitterUsername: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailDigest: true,
    achievementAlerts: true,
    weeklyProgress: true,
    communityUpdates: false,
    battleInvites: true,
    newToolAlerts: true,
    desktopNotifications: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showActivity: true,
    showDecks: true,
    showAchievements: true,
    showOnLeaderboard: true,
  });

  const [preferenceSettings, setPreferenceSettings] = useState({
    theme: "dark" as "dark" | "light" | "system",
    soundEffects: true,
    animations: true,
    compactMode: false,
  });

  useEffect(() => {
    if (settings) {
      setProfileForm({
        displayName: settings.displayName || profile?.username || "",
        bio: settings.bio || "",
        location: settings.location || "",
        website: settings.website || "",
        githubUsername: settings.githubUsername || "",
        twitterUsername: settings.twitterUsername || "",
      });
      setNotificationSettings(settings.notifications);
      setPrivacySettings(settings.privacy);
      setPreferenceSettings(settings.preferences);
    }
  }, [settings, profile]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProfile({
        ...profileForm,
      });
      if (profileForm.displayName) {
        await updateUserProfile({
          username: profileForm.displayName,
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setSaveError("Failed to save profile. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
    }
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateNotifications({
        notifications: notificationSettings,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setSaveError("Failed to save notifications. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
    }
    setIsSaving(false);
  };

  const handleSavePrivacy = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updatePrivacy({
        privacy: privacySettings,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setSaveError("Failed to save privacy settings. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
    }
    setIsSaving(false);
  };

  const handleSavePreferences = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updatePreferences({
        preferences: preferenceSettings,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      setSaveError("Failed to save preferences. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
    }
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    try {
      await deleteAccountMutation({});
      setDeleteDialogOpen(false);
      window.location.href = "/";
    } catch (error) {
      setSaveError("Failed to delete account. Please try again.");
      setTimeout(() => setSaveError(null), 3000);
      setIsDeleting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <PixelCard className="p-8 text-center max-w-md mx-auto">
            <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground mb-2">Sign In to Access Settings</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create an account to customize your profile, notifications, and preferences.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-in">
                <PixelButton>Connect</PixelButton>
              </Link>
              <Link href="/tools">
                <PixelButton variant="outline">Browse Tools</PixelButton>
              </Link>
            </div>
          </PixelCard>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
    { id: "preferences" as const, label: "Preferences", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile">
            <button className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-56 flex-shrink-0">
            <PixelCard>
              <PixelCardContent className="p-2">
                <nav className="flex flex-row lg:flex-col gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full
                          ${activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden lg:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </PixelCardContent>
            </PixelCard>
          </aside>

          <div className="flex-1">
            {activeTab === "profile" && (
              <PixelCard>
                <PixelCardHeader>
                  <PixelCardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Information
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-border">
                    <div className="size-20 rounded-xl border-2 border-border bg-card overflow-hidden">
                      {user.imageUrl ? (
                        <img
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          src={user.imageUrl}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <User className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Profile Picture</p>
                      <p className="text-xs text-muted-foreground">
                        Upload a new avatar to personalize your profile
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Display Name
                      </label>
                      <PixelInput
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                        placeholder="Your display name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Bio
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full bg-background border border-border rounded-md text-foreground text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 transition-all duration-200 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location
                        </label>
                        <PixelInput
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          placeholder="City, Country"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Globe className="w-4 h-4 inline mr-2" />
                          Website
                        </label>
                        <PixelInput
                          value={profileForm.website}
                          onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                          placeholder="https://yoursite.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Github className="w-4 h-4 inline mr-2" />
                          GitHub Username
                        </label>
                        <PixelInput
                          value={profileForm.githubUsername}
                          onChange={(e) => setProfileForm({ ...profileForm, githubUsername: e.target.value })}
                          placeholder="username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Twitter className="w-4 h-4 inline mr-2" />
                          Twitter Username
                        </label>
                        <PixelInput
                          value={profileForm.twitterUsername}
                          onChange={(e) => setProfileForm({ ...profileForm, twitterUsername: e.target.value })}
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      {saveSuccess && (
                        <span className="text-sm text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Saved
                        </span>
                      )}
                      {saveError && (
                        <span className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {saveError}
                        </span>
                      )}
                    </div>
                    <PixelButton onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </PixelButton>
                  </div>
                </PixelCardContent>
              </PixelCard>
            )}

            {activeTab === "notifications" && (
              <PixelCard>
                <PixelCardHeader>
                  <PixelCardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notification Preferences
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Email Digest</p>
                        <p className="text-xs text-muted-foreground">Receive weekly summary of your activity</p>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.emailDigest}
                        onChange={(enabled) => setNotificationSettings({ ...notificationSettings, emailDigest: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Achievement Alerts</p>
                        <p className="text-xs text-muted-foreground">Get notified when you unlock achievements</p>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.achievementAlerts}
                        onChange={(enabled) => setNotificationSettings({ ...notificationSettings, achievementAlerts: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Weekly Progress</p>
                        <p className="text-xs text-muted-foreground">Weekly report on your XP and level progress</p>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.weeklyProgress}
                        onChange={(enabled) => setNotificationSettings({ ...notificationSettings, weeklyProgress: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="text-sm font-medium text-foreground">Community Updates</p>
                        <p className="text-xs text-muted-foreground">News about new tools and features</p>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.communityUpdates}
                        onChange={(enabled) => setNotificationSettings({ ...notificationSettings, communityUpdates: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Battle Invites</p>
                        <p className="text-xs text-muted-foreground">Get notified when someone challenges you</p>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.battleInvites}
                        onChange={(enabled) => setNotificationSettings({ ...notificationSettings, battleInvites: enabled })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      {saveSuccess && (
                        <span className="text-sm text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Saved
                        </span>
                      )}
                      {saveError && (
                        <span className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {saveError}
                        </span>
                      )}
                    </div>
                    <PixelButton onClick={handleSaveNotifications} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </PixelButton>
                  </div>
                </PixelCardContent>
              </PixelCard>
            )}

            {activeTab === "privacy" && (
              <PixelCard>
                <PixelCardHeader>
                  <PixelCardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Privacy Settings
                  </PixelCardTitle>
                </PixelCardHeader>
                <PixelCardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Public Profile</p>
                          <p className="text-xs text-muted-foreground">Allow others to view your profile</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={privacySettings.showProfile}
                        onChange={(enabled) => setPrivacySettings({ ...privacySettings, showProfile: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        {privacySettings.showActivity ? (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">Activity Visibility</p>
                          <p className="text-xs text-muted-foreground">Show your recent activity to others</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={privacySettings.showActivity}
                        onChange={(enabled) => setPrivacySettings({ ...privacySettings, showActivity: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Backpack className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Public Decks</p>
                          <p className="text-xs text-muted-foreground">Allow others to view your decks</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={privacySettings.showDecks}
                        onChange={(enabled) => setPrivacySettings({ ...privacySettings, showDecks: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Show Achievements</p>
                          <p className="text-xs text-muted-foreground">Display your achievements on profile</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={privacySettings.showAchievements}
                        onChange={(enabled) => setPrivacySettings({ ...privacySettings, showAchievements: enabled })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Leaderboard Visibility</p>
                          <p className="text-xs text-muted-foreground">Appear on public leaderboards</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={privacySettings.showOnLeaderboard}
                        onChange={(enabled) => setPrivacySettings({ ...privacySettings, showOnLeaderboard: enabled })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      {saveSuccess && (
                        <span className="text-sm text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Saved
                        </span>
                      )}
                      {saveError && (
                        <span className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {saveError}
                        </span>
                      )}
                    </div>
                    <PixelButton onClick={handleSavePrivacy} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </PixelButton>
                  </div>
                </PixelCardContent>
              </PixelCard>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <PixelCard>
                  <PixelCardHeader>
                    <PixelCardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      App Preferences
                    </PixelCardTitle>
                  </PixelCardHeader>
                  <PixelCardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Theme</label>
                      <div className="flex gap-2">
                        {[
                          { value: "dark", label: "Dark", icon: Moon },
                          { value: "light", label: "Light", icon: Sun },
                          { value: "system", label: "System", icon: Monitor },
                        ].map((theme) => {
                          const Icon = theme.icon;
                          return (
                            <button
                              key={theme.value}
                              onClick={() => setPreferenceSettings({ ...preferenceSettings, theme: theme.value as "dark" | "light" | "system" })}
                              className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                                ${preferenceSettings.theme === theme.value
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
                                }
                              `}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{theme.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          {preferenceSettings.soundEffects ? (
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">Sound Effects</p>
                            <p className="text-xs text-muted-foreground">Play sounds for interactions</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={preferenceSettings.soundEffects}
                          onChange={(enabled) => setPreferenceSettings({ ...preferenceSettings, soundEffects: enabled })}
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Animations</p>
                            <p className="text-xs text-muted-foreground">Enable UI animations and transitions</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={preferenceSettings.animations}
                          onChange={(enabled) => setPreferenceSettings({ ...preferenceSettings, animations: enabled })}
                        />
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Compact Mode</p>
                            <p className="text-xs text-muted-foreground">Use smaller spacing and elements</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          enabled={preferenceSettings.compactMode}
                          onChange={(enabled) => setPreferenceSettings({ ...preferenceSettings, compactMode: enabled })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        {saveSuccess && (
                          <span className="text-sm text-green-500 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Saved
                          </span>
                        )}
                        {saveError && (
                          <span className="text-sm text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {saveError}
                          </span>
                        )}
                      </div>
                      <PixelButton onClick={handleSavePreferences} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </PixelButton>
                    </div>
                  </PixelCardContent>
                </PixelCard>

                <PixelCard className="border-red-500/30">
                  <PixelCardHeader>
                    <PixelCardTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Zone
                    </PixelCardTitle>
                  </PixelCardHeader>
                  <PixelCardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Delete Account</p>
                        <p className="text-xs text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <PixelButton variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </PixelButton>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-500">
                              <AlertTriangle className="w-5 h-5" />
                              Delete Account
                            </DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <PixelButton variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                              Cancel
                            </PixelButton>
                            <PixelButton
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                              )}
                              {isDeleting ? "Deleting..." : "Delete Account"}
                            </PixelButton>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
