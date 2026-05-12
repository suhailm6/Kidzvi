import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getChildren, getSettings, updateSettings } from "../../api/parentApi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CATEGORIES } from "../../utils/constants";
import { getCategoryIcon as getIcon } from "../../utils/helpers";

const ToggleSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-indigo-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const SettingsPage = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getChildren()
      .then((r) => {
        const kids = r.data.data || r.data.children || r.data || [];
        const arr = Array.isArray(kids) ? kids : [];
        setChildren(arr);
        if (arr.length > 0) setSelectedChild(arr[0]._id || arr[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setSettings(null);
    getSettings(selectedChild)
      .then((r) => {
        const s = r.data.data || r.data.settings || r.data || {};
        setSettings({
          allowedCategories: s.allowedCategories || [],
          maxDailyActivities: s.maxDailyActivities || 5,
          maxSessionMinutes: s.maxSessionMinutes || 60,
          requireApproval: s.requireApproval !== false,
          physicalActivityRequired: s.physicalActivityRequired || false,
          passiveContentBlocked: s.passiveContentBlocked || false,
        });
      })
      .catch(() => {
        setSettings({
          allowedCategories: [],
          maxDailyActivities: 5,
          maxSessionMinutes: 60,
          requireApproval: true,
          physicalActivityRequired: false,
          passiveContentBlocked: false,
        });
      })
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const toggleCategory = (cat) => {
    setSettings((prev) => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(cat)
        ? prev.allowedCategories.filter((c) => c !== cat)
        : [...prev.allowedCategories, cat],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(selectedChild, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Parental Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure controls for each child
        </p>
      </div>

      {/* Child Selector */}
      <Card>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Child
          </label>
          {children.length === 0 ? (
            <p className="text-sm text-gray-400">No children added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {children.map((child) => (
                <button
                  key={child._id || child.id}
                  onClick={() => setSelectedChild(child._id || child.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
                    selectedChild === (child._id || child.id)
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-indigo-200"
                  }`}
                >
                  <span>
                    {child.name?.[0]?.toUpperCase() || "C"}
                  </span>
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {loading && <LoadingSpinner />}

      {settings && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          {/* Allowed Categories */}
          <Card
            title="Allowed Activity Categories"
            subtitle="Toggle which categories your child can access"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {CATEGORIES.map((cat) => {
                const isAllowed =
                  settings.allowedCategories.length === 0 ||
                  settings.allowedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      isAllowed
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-gray-50 opacity-60"
                    }`}
                  >
                    <span>{getIcon(cat)}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {cat.replace(/_/g, " ")}
                    </span>
                    <span className="ml-auto text-xs">
                      {isAllowed ? "Allowed" : "Blocked"}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {settings.allowedCategories.length === 0
                ? "All categories are allowed. Click categories to restrict."
                : `${settings.allowedCategories.length} categories allowed.`}
            </p>
          </Card>

          {/* Limits */}
          <Card title="Daily Limits">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Activities Per Day:{" "}
                  <span className="text-indigo-600 font-bold">
                    {settings.maxDailyActivities}
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={settings.maxDailyActivities}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      maxDailyActivities: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Session Minutes:{" "}
                  <span className="text-indigo-600 font-bold">
                    {settings.maxSessionMinutes} min
                  </span>
                </label>
                <input
                  type="range"
                  min={15}
                  max={180}
                  step={15}
                  value={settings.maxSessionMinutes}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      maxSessionMinutes: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>15 min</span>
                  <span>3 hrs</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Toggles */}
          <Card title="Safety Settings">
            <ToggleSwitch
              label="Require Approval"
              description="Activities must be approved by parent before points are awarded"
              checked={settings.requireApproval}
              onChange={(val) =>
                setSettings((p) => ({ ...p, requireApproval: val }))
              }
            />
            <ToggleSwitch
              label="Physical Activity Required"
              description="At least one physical activity must be completed daily"
              checked={settings.physicalActivityRequired}
              onChange={(val) =>
                setSettings((p) => ({ ...p, physicalActivityRequired: val }))
              }
            />
            <ToggleSwitch
              label="Block Passive Content"
              description="Prevent purely passive activities like watching videos"
              checked={settings.passiveContentBlocked}
              onChange={(val) =>
                setSettings((p) => ({ ...p, passiveContentBlocked: val }))
              }
            />
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving} size="lg">
              Save Settings
            </Button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-green-600 font-medium"
              >
                Settings saved.
              </motion.span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
