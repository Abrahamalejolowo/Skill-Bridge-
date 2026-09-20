"use client";

import { useState } from "react";
import { updateApplication } from "@/app/actions/profile";

export default function OpportunityActions({
  opportunityId,
  initialStatus,
}: {
  opportunityId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  // Consider it saved if status is 'saved' or 'in_progress'
  const isSaved = status === "saved" || status === "in_progress";
  const isApplied = status === "applied";

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("opportunity_id", opportunityId);
      formData.append("status", newStatus);
      
      await updateApplication(formData);
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleUpdate(isSaved ? "none" : "saved")}
        className={`rounded-xl py-2.5 text-xs font-semibold transition ${
          isSaved
            ? "bg-[#4B7355] text-white hover:bg-[#3D5E45]"
            : "border border-[#EBEBE3] bg-white text-[#1A1A1A] hover:bg-[#F5F5EF]"
        }`}
      >
        {isSaved ? "Saved ✓" : "Save"}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => handleUpdate(isApplied ? "none" : "applied")}
        className={`rounded-xl py-2.5 text-xs font-semibold transition ${
          isApplied
            ? "bg-[#3D5E45] text-white"
            : "border border-[#EBEBE3] bg-white text-[#1A1A1A] hover:bg-[#F5F5EF]"
        }`}
      >
        {isApplied ? "Applied ✓" : "Mark Applied"}
      </button>
    </div>
  );
}