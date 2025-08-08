import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChartLine, CheckCircle, AlertTriangle, Lightbulb, Download, RefreshCw, Bot, Key, Settings } from "lucide-react";
import { AnalysisResult, KeywordMatch, MissingKeyword, SkillAnalysis } from "@shared/schema";

interface AnalysisResultsProps {
  result: AnalysisResult & { id: string };
  onNewAnalysis: () => void;
}

export function AnalysisResults({ result, onNewAnalysis }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High Priority':
        return "bg-red-500";
      case 'Medium':
        return "bg-yellow-500";
      case 'Low':
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6" data-testid="analysis-results-container">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center" data-testid="results-title">
        <ChartLine className="text-primary mr-3" />
        Analysis Results
      </h3>

      {/* Score Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-8">
        <div className="text-center">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Overall Match Score</h4>
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {Math.round((result.atsScore + result.keywordScore + result.skillsScore) / 3)}
            <span className="text-2xl font-medium text-gray-600">/100</span>
          </div>
          <p className="text-gray-600">
            {Math.round((result.atsScore + result.keywordScore + result.skillsScore) / 3) >= 80 ? 'Excellent match! Your resume is well-optimized.' :
             Math.round((result.atsScore + result.keywordScore + result.skillsScore) / 3) >= 60 ? 'Good match with room for improvement.' :
             'Needs improvement to better match the job requirements.'}
          </p>
        </div>
      </div>

      {/* Overall Scores with 100-Point Scale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="gradient-secondary rounded-lg p-6 text-white" data-testid="score-ats">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-green-100 text-sm font-medium">ATS Compatibility</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-bold">{result.atsScore}</p>
                <p className="text-xl font-medium ml-1">/100</p>
              </div>
            </div>
            <Bot className="h-12 w-12 text-green-100" />
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${result.atsScore}%` }}
            ></div>
          </div>
        </div>

        <div className="gradient-primary rounded-lg p-6 text-white" data-testid="score-keywords">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-blue-100 text-sm font-medium">Keyword Match</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-bold">{result.keywordScore}</p>
                <p className="text-xl font-medium ml-1">/100</p>
              </div>
            </div>
            <Key className="h-12 w-12 text-blue-100" />
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${result.keywordScore}%` }}
            ></div>
          </div>
        </div>

        <div className="gradient-warning rounded-lg p-6 text-white" data-testid="score-skills">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Skills Match</p>
              <div className="flex items-baseline">
                <p className="text-4xl font-bold">{result.skillsScore}</p>
                <p className="text-xl font-medium ml-1">/100</p>
              </div>
            </div>
            <Settings className="h-12 w-12 text-yellow-100" />
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${result.skillsScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Matched Keywords */}
        <div className="bg-gray-50 rounded-lg p-6" data-testid="matched-keywords">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="text-secondary mr-2" />
            Matched Keywords ({result.matchedKeywords.length} found)
          </h4>
          <div className="space-y-3">
            {result.matchedKeywords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No matched keywords found</div>
                <p className="text-sm text-gray-500">Try adding more relevant skills and terms from the job description</p>
              </div>
            ) : (
              result.matchedKeywords.slice(0, 10).map((item: KeywordMatch, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200" data-testid={`matched-keyword-${index}`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                    <span className="text-gray-700 font-medium">{item.keyword}</span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary text-white px-3 py-1">
                    {item.count} {item.count === 1 ? 'match' : 'matches'}
                  </Badge>
                </div>
              ))
            )}
            {result.matchedKeywords.length > 10 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                +{result.matchedKeywords.length - 10} more keywords matched
              </p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-gray-50 rounded-lg p-6" data-testid="missing-keywords">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="text-warning mr-2" />
            Missing Keywords ({result.missingKeywords.length} suggestions)
          </h4>
          <div className="space-y-3">
            {result.missingKeywords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-600 mb-2">Great job!</div>
                <p className="text-sm text-gray-500">Your resume includes most relevant keywords</p>
              </div>
            ) : (
              result.missingKeywords.slice(0, 10).map((item: MissingKeyword, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200" data-testid={`missing-keyword-${index}`}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      item.priority === 'High Priority' ? 'bg-red-500' :
                      item.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-gray-700 font-medium">{item.keyword}</span>
                  </div>
                  <Badge className={`${getPriorityColor(item.priority)} text-white px-3 py-1`}>
                    {item.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skills Analysis */}
        <div className="bg-gray-50 rounded-lg p-6" data-testid="skills-analysis">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartLine className="text-primary mr-2" />
            Skills Analysis
          </h4>
          <div className="space-y-4">
            {result.skillsAnalysis.length === 0 ? (
              <p className="text-gray-500 text-sm">No skills analysis available.</p>
            ) : (
              result.skillsAnalysis.map((skill: SkillAnalysis, index: number) => (
                <div key={index} data-testid={`skill-${index}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{skill.category}</span>
                    <span className={`text-sm ${getScoreColor(skill.score)}`}>{skill.score}%</span>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-50 rounded-lg p-6" data-testid="recommendations">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="text-warning mr-2" />
            Recommendations
          </h4>
          <div className="space-y-3">
            {result.recommendations.length === 0 ? (
              <p className="text-gray-500 text-sm">No recommendations available.</p>
            ) : (
              result.recommendations.slice(0, 8).map((rec: string, index: number) => (
                <div key={index} className="flex items-start" data-testid={`recommendation-${index}`}>
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button
          variant="outline"
          onClick={onNewAnalysis}
          className="flex-1 border-primary text-primary hover:bg-blue-50"
          size="lg"
          data-testid="button-new-analysis"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Analyze Another Resume
        </Button>
        <Button
          onClick={() => window.print()}
          className="flex-1 bg-primary hover:bg-blue-600 text-white"
          size="lg"
          data-testid="button-download-report"
        >
          <Download className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>
    </div>
  );
}
