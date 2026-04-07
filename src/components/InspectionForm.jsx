// src/components/InspectionForm.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useInspectionStore } from '../hooks/useInspectionStore';
import QuestionCard from './QuestionCard';
import AlertSection from './AlertSection';

const InspectionForm = () => {
  const [expandedSection, setExpandedSection] = useState(0);
  const questionsConfig = useInspectionStore(state => state.questionsConfig);
  const responses = useInspectionStore(state => state.responses);
  const setResponse = useInspectionStore(state => state.setResponse);
  const alerts = useInspectionStore(state => state.getAlerts());
  
  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? -1 : index);
  };

  const handleResponse = (questionId, data) => {
    setResponse(questionId, data);
  };

  const progress = (() => {
    const totalScored = questionsConfig.reduce((sum, section) => 
      sum + section.questions.filter(q => q.isScored).length, 0
    );
    const answered = Object.values(responses).filter(r => r.isScored && r.score !== undefined).length;
  // src/components/InspectionForm.jsx (continued)
    return Math.round((answered / totalScored) * 100);
  })();

  return (
    <div className="space-y-6 pb-24">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Inspection sur site</h1>
          <span className="text-sm font-semibold text-primary-600">{progress}% complété</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Alerts Summary */}
      {alerts.length > 0 && (
        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-red-500" size={20} />
            <h3 className="font-semibold text-slate-900">
              {alerts.length} point{alerts.length > 1 ? 's' : ''} de vigilance identifié{alerts.length > 1 ? 's' : ''}
            </h3>
          </div>
          <AlertSection alerts={alerts.slice(0, 3)} compact />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {questionsConfig.map((section, sectionIndex) => {
          const isExpanded = expandedSection === sectionIndex;
          const sectionResponses = section.questions.filter(q => responses[q.id]);
          const sectionProgress = section.questions.filter(q => q.isScored).length > 0 
            ? Math.round((sectionResponses.filter(r => r.score !== undefined).length / section.questions.filter(q => q.isScored).length) * 100)
            : 0;

          return (
            <div key={sectionIndex} className="card overflow-hidden">
              <button
                onClick={() => toggleSection(sectionIndex)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    sectionProgress === 100 ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'
                  }`}>
                    {sectionProgress === 100 ? <CheckCircle2 size={20} /> : <span className="font-bold">{sectionIndex + 1}</span>}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">{section.title}</h3>
                    <p className="text-xs text-slate-500">
                      {sectionResponses.length}/{section.questions.length} questions répondues
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sectionProgress > 0 && (
                    <span className={`text-xs font-semibold ${
                      sectionProgress === 100 ? 'text-green-600' : 'text-primary-600'
                    }`}>
                      {sectionProgress}%
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 p-4 space-y-4 animate-in slide-in-from-top-2">
                  {section.questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      response={responses[question.id]}
                      onResponse={(data) => handleResponse(question.id, { ...data, questionLabel: question.label })}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InspectionForm;
