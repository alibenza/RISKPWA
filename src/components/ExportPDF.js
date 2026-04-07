// src/components/ExportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = async (responses, questionsConfig, aiResults, auditorInfo) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('RAPPORT D\'INSPECTION', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Expert: ${auditorInfo.name || 'Non spécifié'}`, 20, 35);
  doc.text(`Date: ${auditorInfo.inspectionDate || new Date().toLocaleDateString('fr-FR')}`, 20, 42);
  doc.text(`Entreprise: ${auditorInfo.company || 'Non spécifiée'}`, 20, 49);

  let yPos = 60;

  // Score
  if (aiResults?.score_global) {
    doc.setFontSize(16);
    doc.setTextColor(aiResults.score_global >= 70 ? 34 : aiResults.score_global >= 50 ? 234 : 239, 
                      aiResults.score_global >= 70 ? 197 : aiResults.score_global >= 50 ? 179 : 68, 
                      aiResults.score_global >= 70 ? 94 : aiResults.score_global >= 50 ? 8 : 68);
    doc.text(`Score Global: ${aiResults.score_global}%`, 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
  }

  // Table data
  const tableData = [];
  questionsConfig.forEach(section => {
    section.questions.forEach(q => {
      const resp = responses[q.id];
      if (resp) {
        tableData.push([
          section.title,
          q.label,
          resp.score ? `${resp.score}/5` : 'N/A',
          resp.comment || ''
        ]);
      }
    });
  });

  doc.autoTable({
    startY: yPos,
    head: [['Section', 'Question', 'Score', 'Commentaire']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const clientName = responses['nomination']?.value || 'RAPPORT';
  doc.save(`RAPPORT_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
