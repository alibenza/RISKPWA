// src/components/ExportWord.js
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const exportToWord = async (responses, questionsConfig, aiResults, auditorInfo) => {
  const sections = [];

  // Header
  sections.push(
    new Paragraph({
      text: 'RAPPORT D\'INSPECTION RISKPRO',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Expert: ', bold: true }),
        new TextRun(auditorInfo.name || 'Non spécifié'),
        new TextRun({ text: ' | Date: ', bold: true }),
        new TextRun(auditorInfo.inspectionDate || new Date().toLocaleDateString('fr-FR')),
      ],
      spacing: { after: 400 },
    })
  );

  // AI Results
  if (aiResults) {
    sections.push(
      new Paragraph({
        text: 'SYNTHÈSE EXPERTISE IA',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Score Global: ${aiResults.score_global}%`, bold: true, size: 28 }),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: aiResults.synthese_executive || '',
        spacing: { after: 400 },
      })
    );
  }

  // Detailed responses
  sections.push(
    new Paragraph({
      text: 'DÉTAIL PAR SECTION',
      heading: HeadingLevel.HEADING_1,
    })
  );

  questionsConfig.forEach((section) => {
    sections.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
      })
    );

    section.questions.forEach((q) => {
      const resp = responses[q.id];
      if (!resp) return;

      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: q.label, bold: true }),
            new TextRun({ text: ` [${resp.score || 'N/A'}/5]`, color: getScoreColor(resp.score) }),
          ],
        }),
        new Paragraph({
          text: resp.comment || 'Sans commentaire',
          spacing: { after: 200 },
        })
      );
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  const clientName = responses['nomination']?.value || 'SANS_NOM';
  saveAs(blob, `RAPPORT_${clientName}_${new Date().toISOString().split('T')[0]}.docx`);
};

const getScoreColor = (score) => {
  if (!score) return '999999';
  if (score >= 4) return '22c55e';
  if (score >= 3) return 'eab308';
  if (score >= 2) return 'f97316';
  return 'ef4444';
};
