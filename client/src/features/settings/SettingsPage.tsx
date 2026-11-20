import { useState } from "react";
import { UserRound, Lock, Bell, Save, CheckCircle2, Mail } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { useAuth } from "../auth/useAuth";

import {
  updateProfile,
  changePassword,
  updateNotificationPreferences,
  updateEmailPreferences,
  requestEmailChange,
  verifyEmailChange,
} from "../auth/auth.api";

import type {
  NotificationPreferences,
  EmailPreferences,
} from "../auth/auth.types";

const defaultPreferences: NotificationPreferences = {
  workspace: true,
  project: true,
  task: true,
  comments: true,
};

const getErrorMessage = (error: unknown) => {
  const apiError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return (
    apiError.response?.data?.message ||
    "Something went wrong. Please try again."
  );
};

function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [preferences, setPreferences] = useState<NotificationPreferences>(
    user?.notificationPreferences ?? defaultPreferences,
  );
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferences>(
    user?.emailPreferences ?? {
      workspace: true,
      project: true,
      task: true,
      comments: true,
    },
  );

  const [emailPreferencesLoading, setEmailPreferencesLoading] = useState(false);

  const [emailPreferencesMessage, setEmailPreferencesMessage] = useState("");

  const [emailPreferencesError, setEmailPreferencesError] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [preferencesError, setPreferencesError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Update profile
  const handleProfileUpdate = async () => {
    setProfileMessage("");
    setProfileError("");
    setProfileLoading(true);

    try {
      await updateProfile({
        name: fullName,
        username,
      });

      await refreshUser();

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(getErrorMessage(error));
    } finally {
      setProfileLoading(false);
    }
  };

  // Request email change OTP
  const handleEmailRequest = async () => {
    setEmailMessage("");
    setEmailError("");

    const normalizedEmail = newEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError("Please enter your new email address.");
      return;
    }

    if (normalizedEmail === email.toLowerCase()) {
      setEmailError("This is already your current email.");
      return;
    }

    setEmailLoading(true);

    try {
      const response = await requestEmailChange(normalizedEmail);

      setNewEmail(response.data.email);
      setEmailStep(true);
      setEmailOtp("");

      setEmailMessage(
        `A verification code has been sent to ${response.data.email}.`,
      );
    } catch (error) {
      setEmailError(getErrorMessage(error));
    } finally {
      setEmailLoading(false);
    }
  };

  // Verify email change OTP
  const handleEmailVerify = async () => {
    setEmailMessage("");
    setEmailError("");

    if (!/^\d{6}$/.test(emailOtp)) {
      setEmailError("Please enter a valid 6-digit verification code.");
      return;
    }

    setEmailVerifying(true);

    try {
      const response = await verifyEmailChange(emailOtp);

      await refreshUser();

      setEmail(response.data.email);
      setNewEmail("");
      setEmailOtp("");
      setEmailStep(false);

      setEmailMessage("Your email address has been updated successfully.");
    } catch (error) {
      setEmailError(getErrorMessage(error));
    } finally {
      setEmailVerifying(false);
    }
  };

  // Change password
  const handlePasswordUpdate = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");

      setPasswordMessage("Password updated successfully.");
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };
  const toggleEmailPreference = (key: keyof EmailPreferences) => {
    setEmailPreferences((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const handleEmailPreferencesUpdate = async () => {
    setEmailPreferencesMessage("");
    setEmailPreferencesError("");
    setEmailPreferencesLoading(true);

    try {
      await updateEmailPreferences(emailPreferences);
      await refreshUser();

      setEmailPreferencesMessage("Email preferences saved successfully.");
    } catch (error) {
      setEmailPreferencesError(getErrorMessage(error));
    } finally {
      setEmailPreferencesLoading(false);
    }
  };

  // Update in-app notification preferences
  const handlePreferencesUpdate = async () => {
    setPreferencesMessage("");
    setPreferencesError("");
    setPreferencesLoading(true);

    try {
      await updateNotificationPreferences(preferences);

      await refreshUser();

      setPreferencesMessage("Notification preferences saved successfully.");
    } catch (error) {
      setPreferencesError(getErrorMessage(error));
    } finally {
      setPreferencesLoading(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and profile."
      />

      <div className="mt-6 max-w-3xl space-y-6">
        {/* Profile Information */}
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <UserRound size={20} className="text-indigo-600" />

            <h2 className="font-semibold text-slate-900">
              Profile Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={fullName}
              onChange={setFullName}
            />

            <Input
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={setUsername}
            />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Current Email Address
              </label>

              <input
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none"
              />

              <p className="mt-1 text-xs text-slate-500">
                Change your email using the verification section below.
              </p>
            </div>
          </div>

          {profileError && (
            <p className="mt-4 text-sm text-red-600">{profileError}</p>
          )}

          {profileMessage && (
            <p className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              {profileMessage}
            </p>
          )}

          <div className="mt-5 flex justify-stretch sm:justify-end">
            <Button disabled={profileLoading} onClick={handleProfileUpdate}>
              <span className="w-full sm:w-auto flex items-center gap-2">
                <Save size={16} />
                {profileLoading ? "Saving..." : "Save Profile"}
              </span>
            </Button>
          </div>
        </Card>

        {/* Change Email */}
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Mail size={20} className="text-indigo-600" />

            <h2 className="font-semibold text-slate-900">
              Change Email Address
            </h2>
          </div>

          {!emailStep ? (
            <div className="space-y-4">
              <Input
                label="New Email Address"
                type="email"
                placeholder="Enter your new email"
                value={newEmail}
                onChange={setNewEmail}
              />

              <p className="text-xs text-slate-500">
                We will send a verification code to your new email address. Your
                current email will remain unchanged until verification.
              </p>

              <div className="flex justify-end">
                <Button
                  disabled={emailLoading || !newEmail.trim()}
                  onClick={handleEmailRequest}
                  className="w-full sm:w-auto"
                >
                  {emailLoading ? "Sending code..." : "Send Verification Code"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-indigo-50 p-3">
                <p className="text-sm text-indigo-700">
                  Verification code sent to:
                </p>

                <p className="mt-1 text-sm font-semibold text-indigo-900">
                  {newEmail}
                </p>
              </div>

              <Input
                label="Verification Code"
                placeholder="Enter 6-digit OTP"
                value={emailOtp}
                onChange={(value) =>
                  setEmailOtp(value.replace(/\D/g, "").slice(0, 6))
                }
              />

              <div className="flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmailStep(false);
                    setEmailOtp("");
                    setEmailError("");
                    setEmailMessage("");
                  }}
                  className="text-sm w-full sm:w-auto font-medium text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>

                <Button
                  disabled={emailVerifying || emailOtp.length !== 6}
                  onClick={handleEmailVerify}
                  className="w-full sm:w-auto"
                >
                  {emailVerifying ? "Verifying..." : "Verify New Email"}
                </Button>
              </div>
            </div>
          )}

          {emailError && (
            <p className="mt-4 text-sm text-red-600">{emailError}</p>
          )}

          {emailMessage && (
            <p className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              {emailMessage}
            </p>
          )}
        </Card>

        {/* Change Password */}
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Lock size={20} className="text-indigo-600" />

            <h2 className="font-semibold text-slate-900">Change Password</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={setNewPassword}
            />
          </div>

          {passwordError && (
            <p className="mt-4 text-sm text-red-600">{passwordError}</p>
          )}

          {passwordMessage && (
            <p className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              {passwordMessage}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <Button disabled={passwordLoading} onClick={handlePasswordUpdate}>
              <span className="flex w-full sm:w-auto items-center gap-2">
                <Lock size={16} />
                {passwordLoading ? "Updating..." : "Update Password"}
              </span>
            </Button>
          </div>
        </Card>

        {/* In-app Notification Preferences */}
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <Bell size={20} className="text-indigo-600" />

            <div>
              <h2 className="font-semibold text-slate-900">
                Notification Preferences
              </h2>

              <p className="text-sm text-slate-500">
                Choose which in-app notifications you want to receive.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(
              [
                {
                  key: "workspace",
                  title: "Workspace Notifications",
                  description: "Invitations and workspace updates.",
                },
                {
                  key: "project",
                  title: "Project Notifications",
                  description: "New projects and project updates.",
                },
                {
                  key: "task",
                  title: "Task Notifications",
                  description: "Task assignments, updates and completion.",
                },
                {
                  key: "comments",
                  title: "Comment Notifications",
                  description: "New comments on your tasks.",
                },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-100 p-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  onChange={() => togglePreference(item.key)}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-indigo-600"
                />
              </label>
            ))}
          </div>

          {preferencesError && (
            <p className="mt-4 text-sm text-red-600">{preferencesError}</p>
          )}

          {preferencesMessage && (
            <p className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              {preferencesMessage}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <Button
              disabled={preferencesLoading}
              onClick={handlePreferencesUpdate}
              className="w-full sm:w-auto"
            >
              <span className="flex items-center gap-2">
                <Save size={16} />
                {preferencesLoading ? "Saving..." : "Save Preferences"}
              </span>
            </Button>
          </div>
        </Card>

        {/* Email Notification Preferences */}
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <Mail size={20} className="text-indigo-600" />

            <div>
              <h2 className="font-semibold text-slate-900">
                Email Notifications
              </h2>

              <p className="text-sm text-slate-500">
                Choose which activity updates TaskForge can email you.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(
              [
                {
                  key: "workspace",
                  title: "Workspace Emails",
                  description: "Workspace invitations and updates.",
                },
                {
                  key: "project",
                  title: "Project Emails",
                  description: "New projects and project updates.",
                },
                {
                  key: "task",
                  title: "Task Emails",
                  description: "Task assignments, updates and completion.",
                },
                {
                  key: "comments",
                  title: "Comment Emails",
                  description: "New comments on your tasks.",
                },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-100 p-4 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={emailPreferences[item.key]}
                  onChange={() => toggleEmailPreference(item.key)}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-indigo-600"
                />
              </label>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Essential security and billing emails are always sent, regardless of
            these preferences.
          </p>

          {emailPreferencesError && (
            <p className="mt-4 text-sm text-red-600">{emailPreferencesError}</p>
          )}

          {emailPreferencesMessage && (
            <p className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              {emailPreferencesMessage}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <Button
              disabled={emailPreferencesLoading}
              onClick={handleEmailPreferencesUpdate}
              className="w-full sm:w-auto"
            >
              <span className="flex items-center gap-2">
                <Save size={16} />
                {emailPreferencesLoading
                  ? "Saving..."
                  : "Save Email Preferences"}
              </span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
