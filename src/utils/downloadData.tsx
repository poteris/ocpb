import { jsPDF } from 'jspdf';
import { ChatSession } from '../types';

export const downloadChatHistory = (chatSessions: ChatSession[]) => {
  let textContent = "Chat History:\n\n";
  
  chatSessions.forEach((session, index) => {
    textContent += `Chat Session ${index + 1} (${new Date(parseInt(session.id)).toLocaleString()}):\n\n`;
    session.messages.forEach((message) => {
      textContent += `${message.sender.toUpperCase()}: ${message.text}\n\n`;
    });
    textContent += "\n---\n\n";
  });

  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat_history.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

interface AnalysisData {
  summary: string;
  areas_for_improvement: Array<{
    title: string;
    description: string;
  }>;
}

export const downloadFeedbackAsPDF = (analysisData: AnalysisData) => {
  const doc = new jsPDF();
  let yOffset = 10;

  doc.setFontSize(16);
  doc.text("Feedback Summary", 10, yOffset);
  yOffset += 10;

  doc.setFontSize(12);
  doc.text(analysisData.summary, 10, yOffset, { maxWidth: 180 });
  yOffset += doc.getTextDimensions(analysisData.summary, { maxWidth: 180 }).h + 10;

  doc.setFontSize(14);
  doc.text("Areas for Improvement", 10, yOffset);
  yOffset += 10;

  analysisData.areas_for_improvement.forEach((area, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${area.title}`, 10, yOffset);
    yOffset += 5;
    doc.setFontSize(10);
    doc.text(area.description, 15, yOffset, { maxWidth: 175 });
    yOffset += doc.getTextDimensions(area.description, { maxWidth: 175 }).h + 5;
  });

  doc.save("feedback_summary.pdf");
};
