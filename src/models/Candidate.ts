import { Schema, model, models } from "mongoose";
import { CANDIDATE_POSITIONS } from "@/types/position";

const candidateSchema = new Schema(
  {
    tseId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },

    ballotName: { type: String, trim: true },
    number: { type: Number },
    party: { type: String, required: true, trim: true },
    partyName: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    position: { type: String, required: true, enum: CANDIDATE_POSITIONS },
    electionYear: { type: Number, required: true },
  },
  { timestamps: true }
);

candidateSchema.index({ tseId: 1, electionYear: 1 }, { unique: true });

export const Candidate = models.Candidate ?? model("Candidate", candidateSchema);
