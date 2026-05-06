import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowBack } from "react-icons/io5";

interface User {
  id: string;
  name: string;
  email: string;
}

interface SettingsPageProps {
  user: User;
  onBack: () => void;
  onUserUpdate: (updated: User) => void;
  onDeleteAccount: () => void;
}

const CARD_STYLE = {
  background: "linear-gradient(145deg, #1a2e22 0%, #111111 100%)",
  border: "1px solid rgba(22, 196, 127, 0.18)",
};

const DANGER_CARD_STYLE = {
  background: "linear-gradient(145deg, #2e1a1a 0%, #111111 100%)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
};

const INPUT_CLASS =
  "bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green-500/50 transition-colors w-full";

function StatusBanner({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <motion.div
      className={`text-sm px-4 py-2.5 rounded-xl font-medium ${
        type === "success" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
      }`}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      {msg}
    </motion.div>
  );
}

export default function SettingsPage({ user, onBack, onUserUpdate, onDeleteAccount }: SettingsPageProps) {
  // Display name
  const [name, setName] = useState(user.name);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPw, setEmailPw] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePw, setDeletePw] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSaveName = async () => {
    setNameSaving(true);
    setNameMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": token! },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameMsg({ type: "error", text: data.msg || "Failed to update name" });
      } else {
        onUserUpdate({ ...user, name: data.name });
        setNameMsg({ type: "success", text: "Name updated successfully!" });
      }
    } catch {
      setNameMsg({ type: "error", text: "Server error. Please try again." });
    }
    setNameSaving(false);
  };

  const handleSaveEmail = async () => {
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": token! },
        body: JSON.stringify({ newEmail: newEmail.trim(), currentPassword: emailPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailMsg({ type: "error", text: data.msg || "Failed to update email" });
      } else {
        onUserUpdate({ ...user, email: data.email });
        setEmailMsg({ type: "success", text: "Email updated successfully!" });
        setNewEmail("");
        setEmailPw("");
      }
    } catch {
      setEmailMsg({ type: "error", text: "Server error. Please try again." });
    }
    setEmailSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", text: "New passwords don't match" });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": token! },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ type: "error", text: data.msg || "Failed to change password" });
      } else {
        setPwMsg({ type: "success", text: "Password changed successfully!" });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    } catch {
      setPwMsg({ type: "error", text: "Server error. Please try again." });
    }
    setPwSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-auth-token": token! },
        body: JSON.stringify({ currentPassword: deletePw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteMsg({ type: "error", text: data.msg || "Failed to delete account" });
        setDeleting(false);
      } else {
        onDeleteAccount();
      }
    } catch {
      setDeleteMsg({ type: "error", text: "Server error. Please try again." });
      setDeleting(false);
    }
  };

  const nameDirty = name.trim() !== user.name && name.trim().length >= 2;
  const emailDirty = newEmail.trim().length > 0 && emailPw.length > 0;

  return (
    <motion.div
      className="min-h-screen px-4 md:px-10 pt-24 pb-12 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <IoArrowBack className="text-xl" />
        </button>
        <div>
          <h1
            className="text-2xl font-black"
            style={{
              background: "linear-gradient(135deg, #16c47f 0%, #f5c451 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Settings
          </h1>
          <p className="text-xs text-white/40 mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile — display name */}
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={CARD_STYLE}>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Profile</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <AnimatePresence>
            {nameMsg && <StatusBanner type={nameMsg.type} msg={nameMsg.text} />}
          </AnimatePresence>
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !nameDirty}
            className="self-start px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg, #16c47f 0%, #0db36e 100%)", color: "#000" }}
          >
            {nameSaving ? "Saving…" : "Save Name"}
          </button>
        </div>

        {/* Email */}
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={CARD_STYLE}>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Current Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className={`${INPUT_CLASS} opacity-40 cursor-not-allowed`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter new email address"
              className={`${INPUT_CLASS} placeholder:text-white/20`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">Current Password (to confirm)</label>
            <input
              type="password"
              value={emailPw}
              onChange={(e) => setEmailPw(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <AnimatePresence>
            {emailMsg && <StatusBanner type={emailMsg.type} msg={emailMsg.text} />}
          </AnimatePresence>
          <button
            onClick={handleSaveEmail}
            disabled={emailSaving || !emailDirty}
            className="self-start px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg, #16c47f 0%, #0db36e 100%)", color: "#000" }}
          >
            {emailSaving ? "Saving…" : "Save Email"}
          </button>
        </div>

        {/* Security — password change */}
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={CARD_STYLE}>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Security</h2>
          {[
            { label: "Current Password", value: currentPw, setter: setCurrentPw },
            { label: "New Password", value: newPw, setter: setNewPw },
            { label: "Confirm New Password", value: confirmPw, setter: setConfirmPw },
          ].map(({ label, value, setter }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          ))}
          <AnimatePresence>
            {pwMsg && <StatusBanner type={pwMsg.type} msg={pwMsg.text} />}
          </AnimatePresence>
          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !currentPw || !newPw || !confirmPw}
            className="self-start px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg, #16c47f 0%, #0db36e 100%)", color: "#000" }}
          >
            {pwSaving ? "Changing…" : "Change Password"}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={DANGER_CARD_STYLE}>
          <h2 className="text-xs font-bold text-red-400/60 uppercase tracking-widest">Danger Zone</h2>
          <p className="text-xs text-white/40 leading-relaxed">
            Permanently delete your account and all associated data — watch history, audio progress, comments, and saved favorites. This cannot be undone.
          </p>

          <AnimatePresence mode="wait" initial={false}>
            {!showDeleteConfirm ? (
              <motion.button
                key="trigger"
                onClick={() => setShowDeleteConfirm(true)}
                className="self-start px-5 py-2 rounded-xl text-sm font-bold transition-colors"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                whileHover={{ background: "rgba(239,68,68,0.2)" }}
              >
                Delete Account
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/50">Enter your password to confirm</label>
                  <input
                    type="password"
                    value={deletePw}
                    onChange={(e) => setDeletePw(e.target.value)}
                    placeholder="Your current password"
                    className={`${INPUT_CLASS} focus:border-red-500/50 placeholder:text-white/20`}
                    autoFocus
                  />
                </div>
                <AnimatePresence>
                  {deleteMsg && <StatusBanner type={deleteMsg.type} msg={deleteMsg.text} />}
                </AnimatePresence>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeletePw(""); setDeleteMsg(null); }}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white/50 hover:bg-white/5 transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || !deletePw}
                    className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#fff" }}
                  >
                    {deleting ? "Deleting…" : "Permanently Delete"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
