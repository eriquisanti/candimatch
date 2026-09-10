import { Schema, model, models } from "mongoose";
import { PROPOSAL_CATEGORIES } from "@/types/category";

const proposalSchema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true, index: true },
    text: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: PROPOSAL_CATEGORIES },
    source: { type: String, trim: true, default: "MANUAL" },
    sourcePage: { type: Number },
    sourceUrl: { type: String, trim: true },
    electionYear: { type: Number, required: true },
  },
  { timestamps: true }
);

proposalSchema.index({ candidateId: 1, electionYear: 1 });

export const Proposal = models.Proposal ?? model("Proposal", proposalSchema);
