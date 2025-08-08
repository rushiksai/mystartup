import { HfInference } from '@huggingface/inference';
import { AnalysisResult, KeywordMatch, MissingKeyword, SkillAnalysis } from '@shared/schema';

// Free Hugging Face API - no costs!
const hf = new HfInference();

export class FreeAIAnalyzer {
  static async analyzeResume(resumeText: string, jobTitle: string, jobDescription: string): Promise<AnalysisResult> {
    try {
      // Use free text analysis algorithms
      return this.performFreeAnalysis(resumeText, jobTitle, jobDescription);
    } catch (error) {
      console.error('Free AI Analysis Error:', error);
      return this.performFreeAnalysis(resumeText, jobTitle, jobDescription);
    }
  }

  private static performFreeAnalysis(resumeText: string, jobTitle: string, jobDescription: string): AnalysisResult {
    // Advanced keyword matching algorithm
    const resumeWords = this.extractKeywords(resumeText.toLowerCase());
    const jobWords = this.extractKeywords(jobDescription.toLowerCase());
    const titleWords = this.extractKeywords(jobTitle.toLowerCase());

    // Calculate keyword matches with scoring
    const keywordMatches = this.findKeywordMatches(resumeWords, jobWords);
    const missingKeywords = this.findMissingKeywords(resumeWords, jobWords, titleWords);
    
    // Technical skills analysis
    const technicalSkills = this.analyzeTechnicalSkills(resumeText, jobDescription);
    const experienceMatch = this.analyzeExperience(resumeText, jobDescription);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(keywordMatches, missingKeywords, resumeText, jobDescription);
    
    // Calculate comprehensive scores
    const keywordScore = this.calculateKeywordScore(keywordMatches, jobWords.length);
    const atsScore = this.calculateATSScore(resumeText, keywordScore, technicalSkills.score);
    const skillsScore = technicalSkills.score;

    const skillsAnalysis: SkillAnalysis[] = [
      { category: "Technical Skills", score: technicalSkills.score },
      { category: "Experience Level", score: experienceMatch },
      { category: "Industry Keywords", score: keywordScore },
      { category: "Soft Skills", score: this.analyzeSoftSkills(resumeText, jobDescription) },
    ];

    return {
      atsScore: Math.round(atsScore),
      keywordScore: Math.round(keywordScore),
      skillsScore: Math.round(skillsScore),
      matchedKeywords: keywordMatches,
      missingKeywords: missingKeywords,
      recommendations: recommendations,
      skillsAnalysis: skillsAnalysis,
    };
  }

  private static extractKeywords(text: string): string[] {
    // Remove common stop words and extract meaningful keywords
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
    
    return text
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2);
  }

  private static findKeywordMatches(resumeWords: string[], jobWords: string[]): KeywordMatch[] {
    const matches: Map<string, number> = new Map();
    
    jobWords.forEach(jobWord => {
      const count = resumeWords.filter(resumeWord => 
        resumeWord.includes(jobWord) || jobWord.includes(resumeWord)
      ).length;
      
      if (count > 0) {
        matches.set(jobWord, count);
      }
    });

    return Array.from(matches.entries())
      .map(([keyword, count]) => ({
        keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static findMissingKeywords(resumeWords: string[], jobWords: string[], titleWords: string[]): MissingKeyword[] {
    const important = ['leadership', 'management', 'team', 'project', 'agile', 'scrum', 'communication', 'collaboration', 'problem', 'solving', 'analysis', 'design', 'development', 'implementation', 'testing', 'deployment'];
    
    const missing: MissingKeyword[] = [];
    
    // Check for important missing keywords
    jobWords.forEach(jobWord => {
      const isInResume = resumeWords.some(resumeWord => 
        resumeWord.includes(jobWord) || jobWord.includes(resumeWord)
      );
      
      if (!isInResume && jobWord.length > 3) {
        const priority = important.includes(jobWord) ? 'High Priority' :
                        titleWords.includes(jobWord) ? 'Medium' : 'Low';
        
        missing.push({
          keyword: jobWord.charAt(0).toUpperCase() + jobWord.slice(1),
          priority: priority as 'High Priority' | 'Medium' | 'Low'
        });
      }
    });

    return missing.slice(0, 8);
  }

  private static analyzeTechnicalSkills(resumeText: string, jobDescription: string): { score: number } {
    const techKeywords = ['javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'express', 'mongodb', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'typescript', 'html', 'css', 'bootstrap', 'tailwind'];
    
    const resumeTech = techKeywords.filter(tech => 
      resumeText.toLowerCase().includes(tech)
    );
    
    const jobTech = techKeywords.filter(tech => 
      jobDescription.toLowerCase().includes(tech)
    );
    
    if (jobTech.length === 0) return { score: 75 };
    
    const matchedTech = resumeTech.filter(tech => jobTech.includes(tech));
    const score = (matchedTech.length / jobTech.length) * 100;
    
    return { score: Math.min(95, Math.max(20, score)) };
  }

  private static analyzeExperience(resumeText: string, jobDescription: string): number {
    // Look for experience indicators
    const experienceWords = ['years', 'experience', 'worked', 'developed', 'managed', 'led', 'created', 'implemented', 'designed'];
    
    const resumeExp = experienceWords.filter(word => 
      resumeText.toLowerCase().includes(word)
    ).length;
    
    const jobExp = experienceWords.filter(word => 
      jobDescription.toLowerCase().includes(word)
    ).length;
    
    return Math.min(95, Math.max(30, (resumeExp / Math.max(jobExp, 1)) * 80));
  }

  private static analyzeSoftSkills(resumeText: string, jobDescription: string): number {
    const softSkills = ['communication', 'leadership', 'teamwork', 'problem-solving', 'analytical', 'creative', 'organized', 'detail-oriented', 'collaborative'];
    
    const resumeSoft = softSkills.filter(skill => 
      resumeText.toLowerCase().includes(skill.replace('-', ' '))
    );
    
    const jobSoft = softSkills.filter(skill => 
      jobDescription.toLowerCase().includes(skill.replace('-', ' '))
    );
    
    if (jobSoft.length === 0) return 70;
    
    const matchedSoft = resumeSoft.filter(skill => jobSoft.includes(skill));
    return Math.min(95, Math.max(25, (matchedSoft.length / jobSoft.length) * 100));
  }

  private static calculateKeywordScore(matches: KeywordMatch[], totalJobWords: number): number {
    const totalMatches = matches.reduce((sum, match) => sum + match.count, 0);
    const uniqueMatches = matches.length;
    
    const score = (uniqueMatches / Math.max(totalJobWords * 0.1, 1)) * 100;
    return Math.min(95, Math.max(15, score));
  }

  private static calculateATSScore(resumeText: string, keywordScore: number, technicalScore: number): number {
    // ATS formatting analysis
    const hasProperStructure = resumeText.includes('experience') || resumeText.includes('education');
    const hasContactInfo = resumeText.includes('@') || resumeText.includes('phone');
    const hasBulletPoints = resumeText.includes('•') || resumeText.includes('-');
    
    let formatScore = 0;
    if (hasProperStructure) formatScore += 30;
    if (hasContactInfo) formatScore += 20;
    if (hasBulletPoints) formatScore += 25;
    
    const finalScore = (keywordScore * 0.4) + (technicalScore * 0.3) + (formatScore * 0.3);
    return Math.min(95, Math.max(25, finalScore));
  }

  private static generateRecommendations(matches: KeywordMatch[], missing: MissingKeyword[], resumeText: string, jobDescription: string): string[] {
    const recommendations: string[] = [];
    
    if (missing.length > 0) {
      recommendations.push(`Add these important keywords: ${missing.slice(0, 3).map(k => k.keyword).join(', ')}`);
    }
    
    if (matches.length < 5) {
      recommendations.push('Include more relevant keywords from the job description naturally in your experience section');
    }
    
    if (!resumeText.includes('achieved') && !resumeText.includes('increased')) {
      recommendations.push('Add quantifiable achievements and results (percentages, dollar amounts, etc.)');
    }
    
    if (!resumeText.includes('•') && !resumeText.includes('-')) {
      recommendations.push('Use bullet points to improve readability for ATS systems');
    }
    
    recommendations.push('Ensure your resume is in a standard format (PDF or DOCX) for better ATS compatibility');
    recommendations.push('Use standard section headers like "Experience", "Education", "Skills"');
    
    return recommendations.slice(0, 6);
  }
}