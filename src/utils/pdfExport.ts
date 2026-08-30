import { jsPDF } from 'jspdf';

/**
 * Sanitizes text to remove non-ASCII characters, curly quotes, unicode bullets, 
 * and special symbols that default jsPDF Helvetica fonts cannot render cleanly.
 */
function cleanPdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D]/g, '"') // curly double quotes
    .replace(/[\u2013\u2014]/g, '-') // en/em dashes
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-') // bullet characters
    .replace(/[\u2713\u2714]/g, 'v') // checkmarks
    .replace(/[^\x00-\x7F]/g, ''); // strip remaining non-ASCII characters
}

export function downloadAudioReportPdf(results: any, reviewData: any, audioFileName?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2); // 178mm
  const lineGap = 5.2; // comfortable line spacing for 9pt text
  let y = 16;

  // Helper for adding new page if y exceeds printable area
  const checkNewPage = (neededHeight: number = 12) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 16;
      return true;
    }
    return false;
  };

  // Header Banner
  doc.setFillColor(30, 27, 75); // Dark Indigo #1e1b4b
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeSpace Mental Wellness Portal', margin + 8, y + 10);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(199, 210, 254); // indigo-200
  doc.text('Audio Emotion & Voice Signal Analysis Report', margin + 8, y + 18);

  y += 32;

  // Metadata Card (with dynamic height & multi-line text wrapping)
  const titleRaw = cleanPdfText(results?.title || 'Audio Recording Analysis');
  const wrappedTitle = doc.splitTextToSize(`Title: ${titleRaw}`, contentWidth - 12);
  
  const locAddress = cleanPdfText(results?.location?.address || 'Ramon Magsaysay High School, España Blvd, Manila / QC');
  const locCoords = results?.location?.lat ? ` (${results.location.lat} N, ${results.location.lng} E)` : ' (14.6091 N, 121.0003 E)';
  const locStatus = cleanPdfText(results?.location?.geofenceStatus || 'Inside Safe Campus Zone');
  const locFullText = `Auto-Tracked Location: ${locAddress}${locCoords} [${locStatus}]`;
  const wrappedLoc = doc.splitTextToSize(locFullText, contentWidth - 12);

  const titleLines = wrappedTitle.length;
  const locLines = wrappedLoc.length;
  const titleHeight = titleLines * 4.8;
  const locHeight = locLines * 4.2;
  const cardHeight = 22 + titleHeight + locHeight;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, cardHeight, 3, 3, 'FD');

  let cardY = y + 6;
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(wrappedTitle, margin + 6, cardY, { lineHeightFactor: 1.2 });
  cardY += titleHeight + 2;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Date Generated: ${new Date().toLocaleString()}`, margin + 6, cardY);

  const dominant = cleanPdfText(results?.overallEmotion?.dominantEmotion || 'Calm');
  const valence = typeof results?.overallEmotion?.valence === 'number' ? results.overallEmotion.valence.toFixed(2) : '0.00';
  const arousal = typeof results?.overallEmotion?.arousal === 'number' ? results.overallEmotion.arousal.toFixed(2) : '0.00';

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text(`Primary Emotion: ${dominant}`, margin + 98, cardY);
  cardY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Audio Source: ${cleanPdfText(audioFileName || 'Mic Recording')}`, margin + 6, cardY);
  doc.text(`Valence: ${valence}  |  Activation: ${arousal}`, margin + 98, cardY);
  cardY += 6;

  // Auto-Tracked Location line cleanly wrapped inside the card boundaries
  doc.setTextColor(13, 148, 136); // teal-600
  doc.setFont('helvetica', 'bold');
  doc.text(wrappedLoc, margin + 6, cardY, { lineHeightFactor: 1.25 });

  y += cardHeight + 8;

  // Section 1: Contextual Summary & Overview
  checkNewPage(24);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('1. CONTEXTUAL SUMMARY & EMOTIONAL ASSESSMENT', margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59); // slate-800 for optimal contrast

  const summaryRaw = results?.summary || reviewData?.summaryObservation || 'No summary available.';
  const summaryText = cleanPdfText(summaryRaw);
  const wrappedSummary = doc.splitTextToSize(summaryText, contentWidth - 12);

  const summaryBoxHeight = Math.max(16, wrappedSummary.length * lineGap + 8);
  checkNewPage(summaryBoxHeight);

  // Background box with accent bar
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, summaryBoxHeight, 2, 2, 'FD');

  // Left accent bar
  doc.setFillColor(79, 70, 229); // indigo-600 accent
  doc.rect(margin, y, 2, summaryBoxHeight, 'F');

  doc.text(wrappedSummary, margin + 6, y + 6.5, { lineHeightFactor: 1.35 });
  y += summaryBoxHeight + 10;

  // Section 2: SafeSpace Observation & SafeSpace Counselor Notes
  if (reviewData) {
    checkNewPage(30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 27, 75);
    doc.text("2. SAFESPACE OBSERVATION & SAFESPACE COUNSELOR ASSESSMENT", margin, y);
    y += 7;

    // SafeSpace Observation
    if (reviewData.summaryObservation) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text("SafeSpace Observation:", margin, y);
      y += 5.5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const obsText = cleanPdfText(reviewData.summaryObservation);
      const wrappedObs = doc.splitTextToSize(obsText, contentWidth - 4);
      checkNewPage(wrappedObs.length * lineGap + 4);
      doc.text(wrappedObs, margin + 2, y, { lineHeightFactor: 1.35 });
      y += (wrappedObs.length * lineGap) + 7;
    }

    // Emotional Assessment
    if (reviewData.emotionalAssessment) {
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(147, 51, 234); // purple-600
      doc.text("Emotional Assessment:", margin, y);
      y += 5.5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const assessText = cleanPdfText(reviewData.emotionalAssessment);
      const wrappedAssess = doc.splitTextToSize(assessText, contentWidth - 4);
      checkNewPage(wrappedAssess.length * lineGap + 4);
      doc.text(wrappedAssess, margin + 2, y, { lineHeightFactor: 1.35 });
      y += (wrappedAssess.length * lineGap) + 7;
    }

    // Guidance Counselor Note Box
    if (reviewData.guidanceCounselorNote) {
      const counselorText = cleanPdfText(reviewData.guidanceCounselorNote);
      const wrappedNote = doc.splitTextToSize(counselorText, contentWidth - 12);
      const noteBoxHeight = Math.max(16, wrappedNote.length * lineGap + 12);

      checkNewPage(noteBoxHeight + 10);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text("SafeSpace Counselor Note:", margin, y);
      y += 5.5;

      // Card box
      doc.setFillColor(245, 243, 255); // purple-50
      doc.setDrawColor(221, 214, 254); // purple-200
      doc.roundedRect(margin, y, contentWidth, noteBoxHeight, 2, 2, 'FD');

      // Left bar
      doc.setFillColor(147, 51, 234); // purple-600 accent bar
      doc.rect(margin, y, 2, noteBoxHeight, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(wrappedNote, margin + 6, y + 7, { lineHeightFactor: 1.35 });
      y += noteBoxHeight + 10;
    }
  }

  // Section 3: SafeSpace Insights & Recommended Coping Strategies
  checkNewPage(25);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text("3. SAFESPACE INSIGHTS & RECOMMENDED STRATEGIES", margin, y);
  y += 7;

  const insights = results?.insights || reviewData?.clinicalInsights || [];
  if (Array.isArray(insights) && insights.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text("Key Insights:", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    insights.forEach((insight: string) => {
      const cleanInsight = cleanPdfText(insight);
      const wrappedIns = doc.splitTextToSize(cleanInsight, contentWidth - 10);
      const itemHeight = wrappedIns.length * lineGap + 3;
      checkNewPage(itemHeight);

      // Draw clean vector bullet circle instead of Unicode character
      doc.setFillColor(79, 70, 229); // indigo bullet
      doc.circle(margin + 3, y + 2, 1.0, 'F');

      // Indented wrapped text
      doc.text(wrappedIns, margin + 8, y + 3, { lineHeightFactor: 1.35 });
      y += itemHeight;
    });
    y += 5;
  }

  const coping = results?.healthRecommendations || reviewData?.recommendedCopingStrategies || [];
  if (Array.isArray(coping) && coping.length > 0) {
    checkNewPage(20);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110); // teal-700 / emerald-700
    doc.text("Recommended Coping Strategies:", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42); // slate-900 for sharp clear text

    coping.forEach((strat: string) => {
      const cleanStrat = cleanPdfText(strat);
      const wrappedStrat = doc.splitTextToSize(cleanStrat, contentWidth - 10);
      const itemHeight = wrappedStrat.length * lineGap + 3;
      checkNewPage(itemHeight);

      // Draw clean vector teal bullet circle
      doc.setFillColor(13, 148, 136); // teal-600 bullet
      doc.circle(margin + 3, y + 2, 1.1, 'F');

      // Indented wrapped text
      doc.text(wrappedStrat, margin + 8, y + 3, { lineHeightFactor: 1.35 });
      y += itemHeight;
    });
    y += 7;
  }

  // Section 4: Speech Transcript
  if (Array.isArray(results?.transcript) && results.transcript.length > 0) {
    checkNewPage(25);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 27, 75);
    doc.text("4. SPEECH TRANSCRIPT & TIMELINE", margin, y);
    y += 7;

    doc.setFontSize(8.5);
    results.transcript.forEach((t: any) => {
      const lineHeader = `${cleanPdfText(t.speaker || 'Speaker')} [${cleanPdfText(t.time || '0:00')}]:`;
      const lineBody = cleanPdfText(t.text || '');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      checkNewPage(12);
      doc.text(lineHeader, margin, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const wrappedText = doc.splitTextToSize(lineBody, contentWidth - 6);
      const textHeight = wrappedText.length * 4.2 + 3;
      checkNewPage(textHeight);
      doc.text(wrappedText, margin + 4, y, { lineHeightFactor: 1.3 });
      y += textHeight + 2;
    });
    y += 4;
  }

  // Section 5: Medical & Professional Disclaimer
  checkNewPage(25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("5. MEDICAL & PROFESSIONAL DISCLAIMER", margin, y);
  y += 5.5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15); // amber-900
  const disclaimerText = cleanPdfText("IMPORTANT NOTICE: All analysis, emotional ratings, and observational findings in Share Your Video, Share Voice, and Share Feelings are generated for educational and reflective self-awareness purposes only. They do not represent, constitute, or substitute for actual medical, clinical, or psychological consultation, diagnosis, or treatment by licensed doctors, psychiatrists, or healthcare professionals.");
  const wrappedDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  const disclaimerBoxHeight = wrappedDisclaimer.length * 3.8 + 7;

  checkNewPage(disclaimerBoxHeight + 5);

  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(252, 211, 77); // amber-300
  doc.roundedRect(margin, y, contentWidth, disclaimerBoxHeight, 2, 2, 'FD');
  doc.text(wrappedDisclaimer, margin + 4, y + 5, { lineHeightFactor: 1.25 });
  y += disclaimerBoxHeight + 10;

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    doc.text('SafeSpace Confidential Wellness Analysis Report • Not for official diagnostic substitute', margin, pageHeight - 11);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 11);
  }

  // Save PDF
  const cleanFileName = (results?.title || 'SafeSpace_Audio_Report')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  doc.save(`${cleanFileName}_${Date.now()}.pdf`);
}

export function downloadRecordedEntryPdf(entry: any) {
  const results = {
    title: entry.title || 'Recorded Activity Entry',
    location: entry.location || {
      address: 'Ramon Magsaysay High School, España Blvd, Manila / QC',
      campusZone: 'Ramon Magsaysay HS - Main Gate 1',
      lat: 14.6091,
      lng: 121.0003,
      accuracy: 4.2,
      geofenceStatus: 'Inside Safe Campus Zone'
    },
    overallEmotion: {
      dominantEmotion: entry.reportAnalysis?.dominantEmotion || 'Reflective',
      valence: entry.reportAnalysis?.valenceScore || 0.75,
      arousal: entry.reportAnalysis?.arousalScore || 0.35,
      intensity: 0.8
    },
    insights: entry.reportAnalysis?.psychologistInsights || ['Self-expression helps maintain emotional wellness.'],
    healthRecommendations: ['Continue regular journaling and self-reflection.']
  };

  const reviewData = {
    summaryObservation: entry.reportAnalysis?.summaryObservation || entry.excerpt || 'Recorded reflection entry analyzed.',
    emotionalAssessment: `Primary sentiment detected: ${entry.reportAnalysis?.sentimentLabel || 'Mindful'}. Dominant emotion: ${entry.reportAnalysis?.dominantEmotion || 'Reflective'}.`,
    clinicalInsights: entry.reportAnalysis?.psychologistInsights || ['Consistent self-reflection fosters emotional intelligence.'],
    recommendedCopingStrategies: ['Maintain daily reflections', 'Practice 4-7-8 rhythmic breathing'],
    guidanceCounselorNote: entry.reportAnalysis?.guidanceNote || 'Keep up your wellness check-ins.'
  };

  downloadAudioReportPdf(results, reviewData, entry.typeLabel || 'Recorded Entry');
}

export function downloadRecordedEntryCsv(entry: any) {
  const sanitize = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;

  const title = sanitize(entry.title || 'Recorded Entry');
  const typeLabel = sanitize(entry.typeLabel || 'Self Reflection');
  const timestamp = sanitize(new Date(entry.timestamp || Date.now()).toLocaleString());
  const address = sanitize(entry.location?.address || 'Ramon Magsaysay High School, España Blvd, Manila / QC');
  const coords = sanitize(entry.location?.lat ? `${entry.location.lat}°N, ${entry.location.lng}°E` : '14.6091°N, 121.0003°E');
  const geofence = sanitize(entry.location?.geofenceStatus || 'Inside Safe Campus Zone');
  const dominantEmotion = sanitize(entry.reportAnalysis?.dominantEmotion || 'Reflective');
  const sentiment = sanitize(`${((entry.reportAnalysis?.valenceScore || 0.75) * 100).toFixed(0)}% (${entry.reportAnalysis?.sentimentLabel || 'Mindful'})`);
  const activityEnergy = sanitize(`${((entry.reportAnalysis?.arousalScore || 0.35) * 100).toFixed(0)}% Balanced`);
  const aiObservation = sanitize(entry.reportAnalysis?.summaryObservation || entry.excerpt || '');
  const safespaceInsights = sanitize((entry.reportAnalysis?.psychologistInsights || []).join(' | '));
  const counselorNote = sanitize(entry.reportAnalysis?.guidanceNote || '');

  const headers = [
    'Title',
    'Type',
    'Date & Time',
    'Auto-Tracked Address',
    'GPS Coordinates',
    'Geofence Status',
    'Dominant Emotion',
    'Valence / Sentiment',
    'Activity / Energy',
    'SafeSpace Observation',
    'SafeSpace Insights',
    'SafeSpace Counselor Note'
  ].join(',');

  const values = [
    title,
    typeLabel,
    timestamp,
    address,
    coords,
    geofence,
    dominantEmotion,
    sentiment,
    activityEnergy,
    aiObservation,
    safespaceInsights,
    counselorNote
  ].join(',');

  const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers}\n${values}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const cleanName = (entry.title || 'safespace_report').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `${cleanName}_analysis_report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadStudentCheckInPdf(entry: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let y = 16;

  const checkNewPage = (neededHeight: number = 12) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 16;
      return true;
    }
    return false;
  };

  // Header Banner
  doc.setFillColor(30, 27, 75); // Dark Indigo #1e1b4b
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeSpace Mental Wellness Portal', margin + 8, y + 10);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('Rate Your Day & Share Your Feelings - Student Reflection Report', margin + 8, y + 18);

  y += 32;

  // Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student: ${cleanPdfText(entry.studentName || 'Student Reflection')}`, margin + 6, y + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Date & Time: ${new Date(entry.timestamp || Date.now()).toLocaleString()}`, margin + 6, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text(`Day Rating: ${entry.rating || 8} / 10`, margin + 6, y + 23);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text(`Mood Rating Label: ${cleanPdfText(entry.ratingLabel || 'Good & Productive')}`, margin + 6, y + 29);

  y += 40;

  // Section 1: Selected Feelings & Mood Tags
  checkNewPage(24);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('1. Tagged Feelings & Mood State', margin + 4, y + 5);
  y += 10;

  const tagsList = (entry.feelingTags && entry.feelingTags.length > 0)
    ? entry.feelingTags.map((t: string) => cleanPdfText(t)).join(', ')
    : 'No specific emotion tags selected';

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const wrappedTags = doc.splitTextToSize(`Selected Feelings: ${tagsList}`, contentWidth - 8);
  doc.text(wrappedTags, margin + 4, y);
  y += wrappedTags.length * 5 + 6;

  // Section 2: Personal Reflection Notes
  checkNewPage(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('2. Student Personal Reflection & Shared Feelings', margin + 4, y + 5);
  y += 10;

  const notesRaw = cleanPdfText(entry.notes || 'No written reflection provided for this check-in.');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(30, 41, 59);
  const wrappedNotes = doc.splitTextToSize(`"${notesRaw}"`, contentWidth - 8);
  doc.text(wrappedNotes, margin + 4, y);
  y += wrappedNotes.length * 5 + 6;

  // Section 3: Auto-Tracked Location & Telemetry
  checkNewPage(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('3. Auto-Tracked GPS Location & Geofence Verification', margin + 4, y + 5);
  y += 10;

  const loc = entry.location || {};
  const addr = cleanPdfText(loc.address || 'Ramon Magsaysay High School, España Blvd, Manila / QC');
  const zone = cleanPdfText(loc.campusZone || 'Inside Safe Campus Zone');
  const coords = loc.lat ? `${loc.lat.toFixed(5)}°N, ${loc.lng.toFixed(5)}°E (Accuracy: ±${loc.accuracy || 3.5}m)` : '14.6091°N, 121.0003°E';
  const status = cleanPdfText(loc.geofenceStatus || 'Inside Safe Campus Zone');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Location / Zone: ${zone}`, margin + 4, y);
  y += 5;
  const wrappedLocAddr = doc.splitTextToSize(`Address: ${addr}`, contentWidth - 8);
  doc.text(wrappedLocAddr, margin + 4, y);
  y += wrappedLocAddr.length * 4.5 + 1;
  doc.text(`Coordinates & Signal: ${coords}`, margin + 4, y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text(`Geofence Verification: [${status}]`, margin + 4, y);
  y += 10;

  // Section 4: SafeSpace Guidance Recommendation
  checkNewPage(24);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('4. SafeSpace Automated Reflection Guidance', margin + 4, y + 5);
  y += 10;

  let guidanceText = "Consistently tracking your daily rating builds emotional awareness. Remember to take short breaks and practice 4-7-8 rhythmic breathing whenever you feel overwhelmed.";
  if (entry.rating <= 4) {
    guidanceText = "We noticed your rating is on the lower side today. Consider reaching out to your Counselor SaFie chatbot or visiting the Student Guidance Desk for friendly support.";
  } else if (entry.rating >= 8) {
    guidanceText = "Awesome positive energy today! Keep up the great habits, celebrate your achievements, and share your good vibes with your student peers.";
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const wrappedGuidance = doc.splitTextToSize(guidanceText, contentWidth - 8);
  doc.text(wrappedGuidance, margin + 4, y);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    doc.text('SafeSpace Confidential Student Check-in Report • Private Wellness Log', margin, pageHeight - 11);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 11);
  }

  const cleanFileName = `rate_your_day_checkin_${entry.dateStr || Date.now()}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`${cleanFileName}.pdf`);
}

export function downloadStudentCheckInCsv(entries: any | any[]) {
  const list = Array.isArray(entries) ? entries : [entries];
  const sanitize = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;

  const headers = [
    'Student Name',
    'Date & Time',
    'Day Rating (1-10)',
    'Rating Label',
    'Feeling Tags',
    'Personal Reflection Notes',
    'Auto-Tracked Location',
    'GPS Coordinates',
    'Geofence Status'
  ].join(',');

  const rows = list.map(item => {
    const name = sanitize(item.studentName || 'Student');
    const time = sanitize(new Date(item.timestamp || Date.now()).toLocaleString());
    const rating = item.rating || 8;
    const label = sanitize(item.ratingLabel || 'Good');
    const tags = sanitize((item.feelingTags || []).join(' | '));
    const notes = sanitize(item.notes || '');
    const addr = sanitize(item.location?.address || 'Ramon Magsaysay High School, Manila');
    const coords = sanitize(item.location?.lat ? `${item.location.lat}°N, ${item.location.lng}°E` : '14.6091°N, 121.0003°E');
    const status = sanitize(item.location?.geofenceStatus || 'Inside Safe Campus Zone');

    return [name, time, rating, label, tags, notes, addr, coords, status].join(',');
  });

  const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers}\n${rows.join('\n')}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const fileName = list.length === 1 ? `rate_your_day_checkin_${Date.now()}` : `student_checkins_history_${Date.now()}`;
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadEmotionalTrendsPdf(
  trendData: any[], 
  avgValence: number, 
  avgArousal: number, 
  quadrantTitle?: string, 
  quadrantStatus?: string, 
  studentName?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let y = 16;

  const checkNewPage = (neededHeight: number = 12) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 16;
      return true;
    }
    return false;
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeSpace Mental Wellness Portal', margin + 8, y + 10);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('7-Day Emotional Valence & Activation Trends Report', margin + 8, y + 18);

  y += 32;

  // Overview Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student: ${cleanPdfText(studentName || 'SafeSpace Student')}`, margin + 6, y + 8);
  doc.text(`Report Period: Last 7 Days Analytics (${new Date().toLocaleDateString()})`, margin + 6, y + 15);

  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text(`7-Day Avg Valence (Positivity): +${avgValence}%`, margin + 6, y + 23);
  doc.setTextColor(147, 51, 234); // purple-600
  doc.text(`7-Day Avg Activation (Energy Level): ${avgArousal}%`, margin + 98, y + 23);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Emotional Zone: ${cleanPdfText(quadrantStatus || 'Calm, Serene & Content')}`, margin + 6, y + 29);

  y += 40;

  // Table Header
  checkNewPage(20);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('Date', margin + 4, y + 5.5);
  doc.text('Valence (%)', margin + 40, y + 5.5);
  doc.text('Activation (%)', margin + 70, y + 5.5);
  doc.text('Dominant State', margin + 105, y + 5.5);
  doc.text('Entries', margin + 155, y + 5.5);
  y += 10;

  // Table Rows
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  trendData.forEach((pt: any) => {
    checkNewPage(8);
    doc.text(cleanPdfText(pt.dayLabel || pt.dateKey), margin + 4, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`+${pt.valence}%`, margin + 40, y);
    doc.setTextColor(147, 51, 234);
    doc.text(`${pt.arousal}%`, margin + 70, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(cleanPdfText(pt.dominantEmotion || 'Mindful'), margin + 105, y);
    doc.text(`${pt.entriesCount || 0}`, margin + 157, y);

    y += 6;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 4, y - 2, pageWidth - margin - 4, y - 2);
  });

  y += 6;

  // Section: Circumplex Model & Coping Insights
  checkNewPage(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('Circumplex Model Insights & Recommendations', margin + 4, y + 5);
  y += 11;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const insightText = "Your 7-day emotional trend plot measures positivity (Valence) against nervous system energy (Activation). Maintaining a balance above 50% Valence fosters resilience, academic productivity, and stress recovery. Continue daily check-ins to monitor long-term emotional stability.";
  const wrappedInsight = doc.splitTextToSize(insightText, contentWidth - 8);
  doc.text(wrappedInsight, margin + 4, y);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    doc.text('SafeSpace 7-Day Emotional Valence & Activation Analytics Report • Confidential', margin, pageHeight - 11);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 11);
  }

  const cleanFileName = `7_day_emotional_trends_${Date.now()}`;
  doc.save(`${cleanFileName}.pdf`);
}

export function downloadEmotionalTrendsCsv(trendData: any[], avgValence: number, avgArousal: number) {
  const sanitize = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;

  const headers = [
    'Date Key',
    'Day Label',
    'Full Date',
    'Valence Score (%)',
    'Activation Score (%)',
    'Dominant Emotion State',
    'Logged Entries Count',
    'Sample Notes / Excerpt'
  ].join(',');

  const rows = trendData.map((pt: any) => {
    const key = sanitize(pt.dateKey || '');
    const label = sanitize(pt.dayLabel || '');
    const fullDate = sanitize(pt.fullDateStr || '');
    const val = pt.valence;
    const aro = pt.arousal;
    const emotion = sanitize(pt.dominantEmotion || 'Mindful');
    const count = pt.entriesCount || 0;
    const note = sanitize(pt.sampleNotes || '');

    return [key, label, fullDate, val, aro, emotion, count, note].join(',');
  });

  // Add Summary Row at the end
  const summaryRow = [
    sanitize('AVERAGE_7_DAY'),
    sanitize('7-Day Summary'),
    sanitize('Overall 7-Day Averages'),
    avgValence,
    avgArousal,
    sanitize('Combined Trend'),
    trendData.reduce((acc, c) => acc + (c.entriesCount || 0), 0),
    sanitize(`7-Day Avg Valence: ${avgValence}%, Avg Activation: ${avgArousal}%`)
  ].join(',');

  const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers}\n${rows.join('\n')}\n${summaryRow}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `7_day_emotional_valence_activation_trends_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

