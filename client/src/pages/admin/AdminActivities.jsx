import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../../api/activityApi";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CATEGORIES, AGE_GROUPS, DIFFICULTIES } from "../../utils/constants";
import { getCategoryIcon, getDifficultyIcon, truncate } from "../../utils/helpers";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Select a category"),
  ageGroup: z.string().min(1, "Select an age group"),
  difficulty: z.string().min(1, "Select difficulty"),
  pointsValue: z.coerce.number().min(1, "Must be at least 1"),
  durationMinutes: z.coerce.number().min(1, "Must be at least 1 minute"),
  instructions: z.string().optional(),
});

const FormField = ({ label, name, type = "text", placeholder, as = "input", children, register, errors }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {as === "select" ? (
      <select
        {...register(name)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
      >
        {children}
      </select>
    ) : as === "textarea" ? (
      <textarea
        placeholder={placeholder}
        rows={3}
        {...register(name)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm resize-none"
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
      />
    )}
    {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
  </div>
);

const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [serverError, setServerError] = useState("");
  const [search, setSearch] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(schema) });

  const fetchActivities = () => {
    setLoading(true);
    getActivities()
      .then((r) => {
        const data = r.data.data || r.data.activities || r.data || [];
        setActivities(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchActivities(); }, []);

  const openCreate = () => {
    setEditingActivity(null);
    reset({});
    setModalOpen(true);
  };

  const openEdit = (activity) => {
    setEditingActivity(activity);
    reset(activity);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingActivity(null);
    reset({});
    setServerError("");
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      if (editingActivity) {
        await updateActivity(editingActivity._id || editingActivity.id, data);
      } else {
        await createActivity(data);
      }
      closeModal();
      fetchActivities();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to save activity.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity? This cannot be undone.")) return;
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch {
      alert("Failed to delete activity.");
    }
  };

  const filtered = activities.filter((a) =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activities.length} activities in library</p>
        </div>
        <Button onClick={openCreate}>+ Add Activity</Button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Activity", "Category", "Age", "Difficulty", "Points", "Duration", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No activities found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((activity, i) => (
                    <motion.tr
                      key={activity._id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(activity.category)}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{activity.title}</p>
                            <p className="text-xs text-gray-400">{truncate(activity.description, 40)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge category={activity.category} label={activity.category?.replace(/_/g, " ")} size="xs" />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{activity.ageGroup}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs">{getDifficultyIcon(activity.difficulty)} {activity.difficulty}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">⭐{activity.pointsValue}</td>
                      <td className="px-4 py-3 text-gray-500">{activity.durationMinutes}m</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(activity)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(activity._id || activity.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingActivity ? "Edit Activity" : "Add New Activity"}
        size="lg"
      >
        {serverError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Title *" name="title" placeholder="e.g. Read a Storybook" register={register} errors={errors} />
          <FormField label="Description *" name="description" as="textarea" placeholder="Describe what the child should do..." register={register} errors={errors} />

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category *" name="category" as="select" register={register} errors={errors}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{getCategoryIcon(c)} {c.replace(/_/g, " ")}</option>
              ))}
            </FormField>
            <FormField label="Age Group *" name="ageGroup" as="select" register={register} errors={errors}>
              <option value="">Select age group</option>
              {AGE_GROUPS.map((ag) => (
                <option key={ag} value={ag}>{ag} years</option>
              ))}
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Difficulty *" name="difficulty" as="select" register={register} errors={errors}>
              <option value="">Select</option>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{getDifficultyIcon(d)} {d}</option>
              ))}
            </FormField>
            <FormField label="Points *" name="pointsValue" type="number" placeholder="e.g. 20" register={register} errors={errors} />
            <FormField label="Duration (min) *" name="durationMinutes" type="number" placeholder="e.g. 30" register={register} errors={errors} />
          </div>

          <FormField label="Instructions" name="instructions" as="textarea" placeholder="Step-by-step instructions (optional)" register={register} errors={errors} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              {editingActivity ? "Save Changes" : "Add Activity"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminActivities;
