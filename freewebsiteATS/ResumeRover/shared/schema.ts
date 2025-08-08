import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analyses = pgTable("analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description").notNull(),
  resumeText: text("resume_text").notNull(),
  atsScore: integer("ats_score").notNull(),
  keywordScore: integer("keyword_score").notNull(),
  skillsScore: integer("skills_score").notNull(),
  matchedKeywords: jsonb("matched_keywords").notNull(),
  missingKeywords: jsonb("missing_keywords").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  skillsAnalysis: jsonb("skills_analysis").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// Analysis result types
export interface AnalysisResult {
  atsScore: number;
  keywordScore: number;
  skillsScore: number;
  matchedKeywords: KeywordMatch[];
  missingKeywords: MissingKeyword[];
  recommendations: string[];
  skillsAnalysis: SkillAnalysis[];
}

export interface KeywordMatch {
  keyword: string;
  count: number;
}

export interface MissingKeyword {
  keyword: string;
  priority: 'High Priority' | 'Medium' | 'Low';
}

export interface SkillAnalysis {
  category: string;
  score: number;
}
