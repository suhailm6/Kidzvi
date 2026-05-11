import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getChildren, createChild, deleteChild } from "../../api/parentApi";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getAgeGroup } from "../../utils/helpers";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce
    .number()
    .min(3, "Minimum age is 3")
    .max(16, "Maximum age is 16"),
  ageGroup: z.string().optional(),
});

const ChildrenList = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const ageValue = useWatch({ control, name: "age" });

  const fetchChildren = () => {
    setLoading(true);
    getChildren()
      .then((res) => {
        const kids = res.data.data || res.data.children || res.data || [];
        setChildren(Array.isArray(kids) ? kids : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await createChild({ ...data, ageGroup: getAgeGroup(Number(data.age)) });
      reset();
      setModalOpen(false);
      fetchChildren();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to add child.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this child?")) return;
    try {
      await deleteChild(id);
      setChildren((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch {
      alert("Failed to delete child.");
    }
  };

  if (loading) return <LoadingSpinner text="Loading children..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Children</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your children's profiles and settings
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="md">
          + Add Child
        </Button>
      </div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <p className="text-6xl mb-4">👧</p>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No children yet
            </h3>
            <p className="text-gray-400 mb-6">
              Add your first child to get started with Kidzvi.
            </p>
            <Button onClick={() => setModalOpen(true)}>Add First Child</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {children.map((child, i) => (
            <motion.div
              key={child._id || child.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card hover className="relative">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                    {child.age <= 5 ? "🐣" : child.age <= 8 ? "🐥" : "🦅"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {child.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Age {child.age} ·{" "}
                      {child.ageGroup || getAgeGroup(child.age)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {child.points || 0} points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <Link
                    to={`/parent/children/${child._id || child.id}`}
                    className="flex-1 text-center text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-xl transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/child/${child._id || child.id}/dashboard`}
                    className="flex-1 text-center text-sm font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-xl transition-colors"
                  >
                    Child View
                  </Link>
                  <button
                    onClick={() => handleDelete(child._id || child.id)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Child Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          reset();
          setServerError("");
        }}
        title="Add New Child"
      >
        {serverError && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child's Name
            </label>
            <input
              type="text"
              placeholder="e.g. Emma"
              {...register("name")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              min={3}
              max={16}
              placeholder="e.g. 8"
              {...register("age")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            {errors.age && (
              <p className="text-xs text-red-500 mt-1">{errors.age.message}</p>
            )}
            {ageValue && (
              <p className="text-xs text-indigo-500 mt-1">
                Age group: {getAgeGroup(Number(ageValue))}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Add Child
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChildrenList;
