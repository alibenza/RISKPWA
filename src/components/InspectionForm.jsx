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
    return Math
