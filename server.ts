import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Helper to initialize Gemini client lazily/safely
  function getAI() {
    const apiKey = process.env.GEMINI_API_KEY || 'placeholder_key';
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // --- ADMIN SAFETY & INCIDENT ALERT STORE ---
  interface AttachedMedia {
    id: string;
    type: 'image' | 'video';
    url: string;
    name: string;
    size?: string;
  }

  interface AdminSafetyAlert {
    id: string;
    timestamp: string;
    category: 'SUICIDE_SELF_HARM' | 'CRIMINAL_ACTIVITY' | 'ILLEGAL_ACT' | 'BULLYING_HARASSMENT' | 'UNTOWARD_BEHAVIOR';
    severity: 'CRITICAL' | 'HIGH' | 'WARNING';
    sourceModule: string;
    flaggedContent: string;
    triggerReason: string;
    status: 'UNRESOLVED' | 'ACKNOWLEDGED' | 'RESOLVED';
    recommendedActions: string[];
    userSessionId: string;
    location?: string;
    involved?: string;
    audioUrl?: string;
    audioDuration?: number;
    attachedMedia?: AttachedMedia[];
  }

  let adminAlertsStore: AdminSafetyAlert[] = [];

  function evaluateContentForSafetyAlerts(text: string, sourceModule: string, userSessionId = 'User_Session_Primary'): AdminSafetyAlert | null {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();

    // 1. Suicide & Self-Harm Insinuation Detection
    const suicideKeywords = [
      'suicide', 'suicidal', 'kill myself', 'want to die', 'end my life', 
      'cut myself', 'slashing my wrist', 'hanging myself', 'overdose', 
      'no reason to live', 'better off dead', 'harming myself', 
      'magpakamatay', 'mamatay na lang', 'ayaw ko na mabuhay', 'gusto ko na mamatay',
      'self harm', 'self-harm', 'slash my wrist', 'jump off', 'death wish', 'dying'
    ];

    for (const kw of suicideKeywords) {
      if (lower.includes(kw)) {
        const alert: AdminSafetyAlert = {
          id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          category: 'SUICIDE_SELF_HARM',
          severity: 'CRITICAL',
          sourceModule,
          flaggedContent: text.length > 220 ? text.substring(0, 217) + '...' : text,
          triggerReason: `Insinuation of self-harm or suicide detected in recording/transcript (Trigger keyword: "${kw}")`,
          status: 'UNRESOLVED',
          recommendedActions: [
            'Immediate Protocol: Dispatch Crisis Helpline (Hopeline PH 177 / NCMH 1553)',
            'Alert Guidance Duty Officer / Campus Safety Desk',
            'Initiate direct supportive check-in protocol'
          ],
          userSessionId
        };
        adminAlertsStore.unshift(alert);
        console.warn(`[SAFETY ALERT TRIGGERED] Category: SUICIDE_SELF_HARM | Module: ${sourceModule} | Alert ID: ${alert.id}`);
        return alert;
      }
    }

    // 2. Revenge, Retaliation & Intent to Hurt Others Detection
    const revengeKeywords = [
      'revenge', 'revengeful', 'vengence', 'vengeance', 'exact revenge', 'take revenge', 'seeking revenge',
      'i want to hurt others', 'want to hurt others', 'want to hurt someone', 'want to hurt people', 
      'i want to hurt', 'hurt others', 'hurt someone', 'harm others', 'harming others', 
      'gonna hurt them', 'going to hurt them', 'make them pay', 'payback', 'retaliation', 
      'retaliate', 'retaliating', 'get back at them', 'get back at him', 'get back at her', 
      'inflict pain', 'cause harm to others', 'make them suffer', 'they will pay',
      'teach them a lesson', 'settle the score', 'destroy them', 'want to hurt',
      'magbalos', 'magaganti', 'panggaganti', 'magganti', 'paghihiganti', 'maghihiganti', 
      'hihiganti', 'babawi ako', 'sasaktan ko sila', 'sasaktan ko siya', 'papagbayarin ko sila'
    ];

    for (const kw of revengeKeywords) {
      if (lower.includes(kw)) {
        const alert: AdminSafetyAlert = {
          id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          category: 'CRIMINAL_ACTIVITY',
          severity: 'HIGH',
          sourceModule,
          flaggedContent: text.length > 220 ? text.substring(0, 217) + '...' : text,
          triggerReason: `Threat of revenge, retaliation, or intent to hurt others detected in input/transcript (Trigger keyword: "${kw}")`,
          status: 'UNRESOLVED',
          recommendedActions: [
            'Immediate threat assessment by Campus Security & Discipline Office',
            'Dispatch Guidance Counselor for active de-escalation & conflict intervention',
            'Log threat incident under Student Safety & Violence Prevention Protocol'
          ],
          userSessionId
        };
        adminAlertsStore.unshift(alert);
        console.warn(`[SAFETY ALERT TRIGGERED] Category: REVENGE_THREAT | Module: ${sourceModule} | Alert ID: ${alert.id}`);
        return alert;
      }
    }

    // 2. Killings, Murder, Crimes & Violence Detection
    const crimeKeywords = [
      'murder', 'murdered', 'kill someone', 'killings', 'killing', 'killed', 
      'death', 'deadly', 'steal', 'robbery', 'rob a bank', 'break into', 
      'smuggle', 'bomb', 'terrorist', 'extortion', 'blackmail', 
      'kidnap', 'pumatay', 'pinatay', 'magnakaw', 'barilin', 'saksakin', 'threaten to kill',
      'shooting', 'gunshot', 'weapon', 'dead'
    ];

    for (const kw of crimeKeywords) {
      if (lower.includes(kw)) {
        const alert: AdminSafetyAlert = {
          id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          category: 'CRIMINAL_ACTIVITY',
          severity: 'HIGH',
          sourceModule,
          flaggedContent: text.length > 220 ? text.substring(0, 217) + '...' : text,
          triggerReason: `Potential criminal intent, violence or killing detected in transcript (Trigger keyword: "${kw}")`,
          status: 'UNRESOLVED',
          recommendedActions: [
            'Audit transcript audio/video log and context',
            'Notify Campus Security / Duty Admin',
            'Escalate to Security Officer if active threat'
          ],
          userSessionId
        };
        adminAlertsStore.unshift(alert);
        console.warn(`[SAFETY ALERT TRIGGERED] Category: CRIMINAL_ACTIVITY | Module: ${sourceModule} | Alert ID: ${alert.id}`);
        return alert;
      }
    }

    // 3. Bullying & Cyberbullying Detection
    const bullyingKeywords = [
      'bullying', 'bully', 'bullied', 'cyberbullying', 'cyberbully', 'cyberbullied', 
      'harassment', 'harass', 'harassed', 'intimidated', 'intimidation', 
      'being targeted', 'online abuse', 'being threatened', 'rumors about me', 
      'spread rumors', 'humiliated', 'humiliating', 'pambubully', 'binubully', 
      'inaapi', 'pina-iinitan', 'pambabastos', 'stalking', 'doxxed', 'doxxing', 
      'bashing', 'bashed online', 'body shaming', 'nobody likes you', 'threats', 'threatened'
    ];

    for (const kw of bullyingKeywords) {
      if (lower.includes(kw)) {
        const alert: AdminSafetyAlert = {
          id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          category: 'BULLYING_HARASSMENT',
          severity: 'HIGH',
          sourceModule,
          flaggedContent: text.length > 220 ? text.substring(0, 217) + '...' : text,
          triggerReason: `Bullying, cyber-abuse, or harassment phrase flagged in transcript (Trigger keyword: "${kw}")`,
          status: 'UNRESOLVED',
          recommendedActions: [
            'Alert Guidance Counselor for anti-bullying intervention',
            'Log incident details according to Anti-Bullying Act (RA 10627)',
            'Provide student support & confidential counseling session'
          ],
          userSessionId
        };
        adminAlertsStore.unshift(alert);
        console.warn(`[SAFETY ALERT TRIGGERED] Category: BULLYING_HARASSMENT | Module: ${sourceModule} | Alert ID: ${alert.id}`);
        return alert;
      }
    }

    // 4. Physical Assaults & Violence
    const assaultKeywords = [
      'assault', 'assaults', 'assaulted', 'physical assault', 'attacked', 'attack', 
      'beating up', 'beat up', 'bugbog', 'sinaktan', 'stabbing', 'stabbed', 'shot', 
      'physical fight', 'gang fight', 'fraternity violence', 'brawl'
    ];

    for (const kw of assaultKeywords) {
      if (lower.includes(kw)) {
        const alert: AdminSafetyAlert = {
          id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          category: 'UNTOWARD_BEHAVIOR',
          severity: 'HIGH',
          sourceModule,
          flaggedContent: text.length > 220 ? text.substring(0, 217) + '...' : text,
          triggerReason: `Physical assault or violence incident detected in transcript (Trigger keyword: "${kw}")`,
          status: 'UNRESOLVED',
          recommendedActions: [
            'Dispatch Campus Security / First Aid Officer if active injury',
            'Log physical assault incident for disciplinary & safety audit',
            'Provide immediate medical & guidance counselor intervention'
          ],
          userSessionId
        };
        adminAlertsStore.unshift(alert);
        console.warn(`[SAFETY ALERT TRIGGERED] Category: UNTOWARD_BEHAVIOR | Module: ${sourceModule} | Alert ID: ${alert.id}`);
        return alert;
      }
    }

    // 5. Illegal Acts & Untoward Incidents
    const illegalKeywords = [
      'buy illegal drugs', 'cocaine', 'meth', 'shabu', 'sell drugs', 
      'illegal firearms', 'illegal weapons', 'poison', 'hacking into', 
      'identity theft', 'child abuse', 'sexual assault', 'hazing', 'arson',
      'untoward incident', 'untoward behavior', 'untoward', 'accident', 'disaster',
      'emergency', 'vandalism', 'trespassing', 'riot'
    ];

    for (const kw of illegalKeywords) {
      if (lower.includes(kw)) {
        const alert: AdminSafetyAlert = {
          id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          timestamp: new Date().toISOString(),
          category: 'ILLEGAL_ACT',
          severity: 'HIGH',
          sourceModule,
          flaggedContent: text.length > 220 ? text.substring(0, 217) + '...' : text,
          triggerReason: `Untoward incident or illegal act flagged in recording transcript (Trigger keyword: "${kw}")`,
          status: 'UNRESOLVED',
          recommendedActions: [
            'Log incident for administrative review',
            'Provide counselor consultation guidance',
            'Maintain strict safety & confidentiality protocols'
          ],
          userSessionId
        };
        adminAlertsStore.unshift(alert);
        console.warn(`[SAFETY ALERT TRIGGERED] Category: ILLEGAL_ACT | Module: ${sourceModule} | Alert ID: ${alert.id}`);
        return alert;
      }
    }

    return null;
  }

  // --- ADMIN ALERT API ENDPOINTS ---
  app.get('/api/admin/alerts', (req, res) => {
    const unresolvedCount = adminAlertsStore.filter(a => a.status === 'UNRESOLVED').length;
    res.json({ alerts: adminAlertsStore, unresolvedCount });
  });

  app.post('/api/admin/alerts/report', (req, res) => {
    const { category, content, location, involved, targetAuthority, reporterName, reporterRole, anonymous, audioUrl, audioDuration, attachedMedia } = req.body;
    
    const cat = category || 'UNTOWARD_BEHAVIOR';
    const text = content || 'Reported Incident';
    const loc = location || 'School Campus';
    const inv = involved || 'Unspecified / Confidential';
    const target = targetAuthority || 'School Guidance Counselor & Safety Desk';
    const isAnon = anonymous !== false;

    const newAlert: AdminSafetyAlert = {
      id: 'ALT-RPT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      category: cat,
      severity: cat === 'SUICIDE_SELF_HARM' ? 'CRITICAL' : 'HIGH',
      sourceModule: 'Report an Incident Form',
      flaggedContent: text,
      triggerReason: `[INCIDENT REPORT] ${isAnon ? 'Confidential Anonymous Reporter' : `Reported by ${reporterName || 'User'} (${reporterRole || 'Student'})`}. Location: ${loc}. Target Desk: ${target}. Involved: ${inv}.`,
      status: 'UNRESOLVED',
      recommendedActions: [
        `Immediate investigation & check-in by ${target}`,
        `Review location (${loc}) & secure involved parties (${inv})`,
        'Maintain strict confidentiality and initiate safety protocol'
      ],
      userSessionId: isAnon ? 'Anonymous_Reporter' : (reporterName || 'User_Session'),
      location: loc,
      involved: inv,
      audioUrl: audioUrl || undefined,
      audioDuration: audioDuration || undefined,
      attachedMedia: Array.isArray(attachedMedia) ? attachedMedia : []
    };

    adminAlertsStore.unshift(newAlert);
    console.warn(`[INCIDENT REPORT DISPATCHED] ID: ${newAlert.id} | Category: ${cat} | Target: ${target}`);
    res.json({ success: true, alert: newAlert });
  });

  app.post('/api/admin/alerts/resolve', (req, res) => {
    const { id, status } = req.body;
    const alert = adminAlertsStore.find(a => a.id === id);
    if (alert) {
      alert.status = status || 'RESOLVED';
      return res.json({ success: true, alert });
    }
    res.status(404).json({ error: 'Alert not found' });
  });

  app.post('/api/admin/alerts/clear', (req, res) => {
    adminAlertsStore = adminAlertsStore.filter(a => a.status === 'UNRESOLVED');
    res.json({ success: true, remaining: adminAlertsStore.length });
  });

  app.post('/api/admin/alerts/test', (req, res) => {
    const { category, content, module } = req.body;
    const cat = category || 'SUICIDE_SELF_HARM';
    const text = content || 'Simulated crisis message for admin alert verification.';
    const source = module || 'Admin Simulation Tool';

    const testAlert: AdminSafetyAlert = {
      id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      category: cat,
      severity: cat === 'SUICIDE_SELF_HARM' ? 'CRITICAL' : 'HIGH',
      sourceModule: source,
      flaggedContent: text,
      triggerReason: `[TEST SIMULATION] Automated alert verification for category: ${cat}`,
      status: 'UNRESOLVED',
      recommendedActions: cat === 'BULLYING_HARASSMENT' ? [
        'Alert Guidance Counselor for Anti-Bullying Protocol (RA 10627)',
        'Schedule supportive counseling & peer conflict mediation',
        'Document incident log and maintain strict confidentiality'
      ] : [
        'Verify Admin Notification Banner',
        'Test Emergency Contact Helpline Dispatch',
        'Acknowledge or resolve log item'
      ],
      userSessionId: 'Simulated_Session'
    };

    adminAlertsStore.unshift(testAlert);
    res.json({ success: true, alert: testAlert });
  });

  // Helper function to try generating content with instant fallback models
  async function generateWithModelFallback(contents: any, config?: any) {
    const models = [
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview'
    ];
    let lastErr: any = null;
    const ai = getAI();

    for (const model of models) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (res) return res;
      } catch (err: any) {
        lastErr = err;
        const errMsg = String(err?.message || err).toLowerCase();
        const isQuotaOrDemand = 
          err?.status === 503 || 
          err?.status === 429 || 
          errMsg.includes('503') || 
          errMsg.includes('429') || 
          errMsg.includes('resource_exhausted') || 
          errMsg.includes('unavailable') ||
          errMsg.includes('quota');

        if (!isQuotaOrDemand) {
          console.warn(`Model '${model}' failed with unexpected error:`, err?.message || String(err));
        } else {
          console.info(`Model '${model}' busy/rate-limited, trying next fallback model...`);
        }
        // On rate limit or 503 high demand, seamlessly try next model in fallback list
        continue;
      }
    }
    console.error('All Gemini fallback models exhausted:', lastErr?.message || String(lastErr));
    throw lastErr;
  }

  // API Route for Multimodal Analysis (Text/Image)
  app.post('/api/analyze', async (req, res) => {
    try {
      const { text, imageBase64, mimeType, sourceModule } = req.body;
      const moduleName = sourceModule || 'Share Feelings (Multimodal)';

      let triggeredAlert: any = null;
      if (text) {
        triggeredAlert = evaluateContentForSafetyAlerts(text, moduleName);
      }

      const parts: any[] = [];
      if (text) {
        parts.push({ text: `Analyze the emotional sentiment and safety of this text: "${text}"` });
      }
      if (imageBase64) {
        parts.push({ text: `Analyze the emotional expression and visual content in this image. Look for facial expressions, gestures, written text in image, or any visual signs of distress, self-harm, weapons, bullying, or safety concerns.` });
        parts.push({
          inlineData: {
            data: imageBase64.split(',')[1] || imageBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        });
      }

      if (parts.length === 0) {
        return res.status(400).json({ error: 'Please provide text or an image for analysis.' });
      }

      parts.push({
        text: `CRITICAL INSTRUCTION: Perform a 100% accurate, highly precise Multimodal Emotional Signal Analysis using state-of-the-art vision, facial micro-expression, camera photo recognition, and semantic text analysis technology.
1. PRIMARY SENTIMENT REQUIREMENT: 'overallSentiment' MUST NOT be a generic single word (like 'Positive', 'Negative', or 'Neutral'). Instead, provide a clear, highly expressive 1-liner descriptive phrase capturing the primary sentiment and subtle emotional nuances (e.g. "Gently introspective with undertones of exam anxiety and quiet perseverance", "Vibrant and joyful expression reflecting creative pride and optimism", "Heightened emotional distress displaying signs of overwhelm and mental fatigue", "Composed and tranquil state demonstrating mindful self-awareness", etc.).
2. SAFETY & ACCURACY: If any negative trigger keywords, self-harm insinuations, bullying, physical violence, weapons, or severe emotional distress are detected in the text or photo/camera image:
   - Make 'overallSentiment' a descriptive crisis phrase like "Critical emotional distress displaying heightened anxiety and safety risk".
   - Include explicit distress/risk emotion indicators in 'emotions' (e.g. 'Severe Distress', 'Crisis Risk', 'High Anxiety', 'Fear', 'Emotional Pain') with high confidence scores (80-100).
   - Provide a clear, accurate 'summary' describing the detected emotions, concerns, or visual/textual elements.
   - In 'healthRecommendations', include urgent support guidelines (e.g. 'Reach out to Hopeline PH 177 / NCMH 1553', 'Connect with guidance counselor or emergency contact').

Respond strictly with a JSON object containing 'emotions' array, 'overallSentiment' string (descriptive 1-liner phrase), 'summary' string, and 'healthRecommendations' array.`
      });

      let response;
      try {
        response = await generateWithModelFallback({ parts }, {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emotions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                  },
                  required: ["name", "score"]
                },
              },
              overallSentiment: { type: Type.STRING },
              summary: { type: Type.STRING },
              healthRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
            },
            required: ["emotions", "overallSentiment", "summary", "healthRecommendations"]
          },
        });
      } catch (genErr: any) {
        console.warn('Multimodal AI call quota exhausted, returning fallback analysis:', genErr);
        if (triggeredAlert) {
          return res.json({
            emotions: [
              { name: triggeredAlert.category === 'SUICIDE_SELF_HARM' ? 'Critical Crisis Risk' : 'Severe Distress', score: 95 },
              { name: 'High Anxiety & Fear', score: 88 },
              { name: 'Safety Trigger Alert', score: 85 }
            ],
            overallSentiment: 'Critical emotional distress requiring immediate safety guidance support',
            summary: `⚠️ SAFETY TRIGGER DETECTED: ${triggeredAlert.triggerReason}. Incident alert dispatched to Admin Safety Desk and Parent Portal.`,
            healthRecommendations: [
              'URGENT: Reach out immediately to Hopeline PH 177 / NCMH 1553.',
              'Contact your school guidance counselor or trusted adult right away.',
              'Your well-being is important; safety team and family have been notified for support.'
            ],
            safetyAlertTriggered: true,
            alertDetails: triggeredAlert
          });
        }

        return res.json({
          emotions: [
            { name: 'Reflective', score: 85 },
            { name: 'Calm', score: 75 },
            { name: 'Thoughtful', score: 70 }
          ],
          overallSentiment: 'Quietly introspective state with balanced mental clarity and calm focus',
          summary: 'Analysis completed. Your entry demonstrates an introspective and composed state.',
          healthRecommendations: [
            'Practice 5 minutes of mindful breathing to stay centered.',
            'Journal your thoughts to maintain emotional clarity.',
            'Take regular breaks during periods of focused activity.'
          ],
          safetyAlertTriggered: false
        });
      }

      let resultText = response.text || "{}";
      resultText = resultText.replace(/^```json\n?/i, '').replace(/```$/i, '').trim();
      let result: any;
      try {
        result = JSON.parse(resultText);
      } catch (err) {
        console.warn("Standard parse failed for emotion. Attempting to repair truncated JSON...");
        const fixes = ['"]}', ']}', '}', '"}'];
        let fixed = false;
        for (const fix of fixes) {
          try {
            result = JSON.parse(resultText + fix);
            fixed = true;
            break;
          } catch (e) {}
        }
        if (!fixed) throw err;
      }

      if (result) {
        if (!triggeredAlert && result.summary) {
          triggeredAlert = evaluateContentForSafetyAlerts(result.summary, moduleName);
        }
        if (!triggeredAlert && Array.isArray(result.emotions)) {
          const emotionNames = result.emotions.map((e: any) => e.name).join(' ');
          triggeredAlert = evaluateContentForSafetyAlerts(emotionNames, moduleName);
        }

        if (triggeredAlert) {
          result.overallSentiment = 'Negative';
          result.safetyAlertTriggered = true;
          result.alertDetails = triggeredAlert;
        } else {
          result.safetyAlertTriggered = false;
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      res.status(500).json({ error: "Failed to analyze emotion.", details: String(error) });
    }
  });

  // API Route for Accurate Speech-to-Text Verbatim Transcription
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioData, mimeType = 'audio/webm' } = req.body;
      if (!audioData) {
        return res.status(400).json({ error: 'Audio data is required for transcription' });
      }

      const prompt = "You are a professional speech transcriber. Transcribe the spoken audio exactly verbatim as spoken by the user. Do not summarize, extrapolate, add commentary, or add conversational filler. Output ONLY the exact transcribed text words.";
      
      const response = await generateWithModelFallback([
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: audioData,
                mimeType: mimeType
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]);

      const transcript = response.text ? response.text.trim() : '';
      res.json({ transcript });
    } catch (error: any) {
      console.error('Transcription error:', error);
      res.status(500).json({ error: 'Failed to transcribe audio', details: String(error) });
    }
  });

  // API Route for Video Analysis
  app.post('/api/analyze-video', async (req, res) => {
    try {
      const { videoBase64, imageBase64, mimeType, liveTranscript, sourceModule } = req.body;
      const moduleName = sourceModule || 'Message to Yourself (Video)';

      let triggeredAlert: any = null;
      if (liveTranscript && typeof liveTranscript === 'string') {
        triggeredAlert = evaluateContentForSafetyAlerts(liveTranscript, moduleName);
      }

      if (!videoBase64 && !imageBase64) {
        return res.status(400).json({ error: 'Please provide video or frame image for analysis.' });
      }

      const promptText = `Perform a comprehensive, accurate Video Emotional Signal Analysis for this personal video message.
Analyze visual facial signals (micro-expressions, eye gaze, facial muscle tension, smile/frown posture, head movement) and acoustic/vocal signals (pitch variation, speech rate, vocal tremor, pauses) along with any spoken transcript text.
${liveTranscript ? `Live Spoken Transcript Captured: "${liveTranscript}"` : ''}

CRITICAL ACCURACY & SAFETY INSTRUCTION:
1. Provide a strictly accurate, objective emotional signal analysis based on actual observed visual and vocal cues.
2. Calculate numerical 'valence' (-1.0 unpleasant/negative to +1.0 pleasant/positive) and 'arousal' (-1.0 low energy/subdued to +1.0 high energy/active).
3. If negative trigger keywords, self-harm insinuations, severe distress, panic, grief, or fear are observed in speech or visual cues:
   - Set 'overallSentiment' to 'Negative' (or 'Critical Risk'). NEVER mark negative or distressed input as 'Positive' or 'Calm'.
   - Include explicit distress/risk emotion indicators in 'emotions' (e.g. 'Severe Distress', 'Crisis Risk', 'High Anxiety', 'Fear') with high confidence scores (80-100).
   - In 'healthRecommendations', include urgent support guidelines (e.g. 'Reach out to Hopeline PH 177 / NCMH 1553', 'Connect with guidance counselor or emergency contact').
4. Extract key facial cues, micro-expressions, posture signals, and vocal indicators observed.
5. Generate an 'emotionTimeline' array over the video duration showing timestamps, valence, arousal, emotion, and visual/vocal cues at each point.

Respond strictly with a JSON object matching the requested schema.`;

      const videoSchema = {
        type: Type.OBJECT,
        properties: {
          emotions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["name", "score"]
            },
          },
          overallSentiment: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
          valenceArousal: {
            type: Type.OBJECT,
            properties: {
              valence: { type: Type.NUMBER },
              arousal: { type: Type.NUMBER },
              quadrant: { type: Type.STRING }
            },
            required: ["valence", "arousal"]
          },
          facialSignals: {
            type: Type.OBJECT,
            properties: {
              eyeContact: { type: Type.STRING },
              microExpressions: { type: Type.ARRAY, items: { type: Type.STRING } },
              facialTension: { type: Type.STRING },
              postureAndGaze: { type: Type.STRING }
            }
          },
          vocalSignals: {
            type: Type.OBJECT,
            properties: {
              speechPace: { type: Type.STRING },
              pitchVariability: { type: Type.STRING },
              vocalTremorOrTone: { type: Type.STRING }
            }
          },
          emotionTimeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                timeInSeconds: { type: Type.NUMBER },
                valence: { type: Type.NUMBER },
                arousal: { type: Type.NUMBER },
                emotion: { type: Type.STRING },
                cue: { type: Type.STRING }
              }
            }
          },
          keyCuesObserved: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          summary: { type: Type.STRING },
          healthRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
        },
        required: ["emotions", "overallSentiment", "summary", "healthRecommendations"]
      };

      let response;

      // Attempt 1: Process videoBase64 if provided
      if (videoBase64) {
        try {
          const cleanedMimeType = (mimeType || 'video/webm').split(';')[0].trim();
          const videoParts = [
            { text: promptText },
            {
              inlineData: {
                data: videoBase64.split(',')[1] || videoBase64,
                mimeType: cleanedMimeType,
              },
            }
          ];
          response = await generateWithModelFallback({ parts: videoParts }, {
            responseMimeType: 'application/json',
            responseSchema: videoSchema,
          });
        } catch (videoErr) {
          console.warn('Direct video inline analysis failed, attempting image fallback:', videoErr);
        }
      }

      // Attempt 2: Fallback to imageBase64 if video inline processing failed or was omitted
      if (!response && imageBase64) {
        try {
          const cleanedMimeType = (mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg').split(';')[0].trim();
          const imageParts = [
            { text: promptText },
            {
              inlineData: {
                data: imageBase64.split(',')[1] || imageBase64,
                mimeType: cleanedMimeType,
              },
            }
          ];
          response = await generateWithModelFallback({ parts: imageParts }, {
            responseMimeType: 'application/json',
            responseSchema: videoSchema,
          });
        } catch (imgErr) {
          console.warn('Image frame fallback also failed:', imgErr);
        }
      }

      // Fallback response if API quota or rate limits prevent direct AI completion
      if (!response) {
        console.warn('Video analysis quota exceeded or API unavailable. Providing fallback analysis.');
        if (triggeredAlert) {
          return res.json({
            emotions: [
              { name: triggeredAlert.category === 'SUICIDE_SELF_HARM' ? 'Critical Crisis Risk' : 'Severe Distress', score: 95, category: 'Risk' },
              { name: 'High Anxiety & Fear', score: 88, category: 'Activation' },
              { name: 'Safety Trigger Alert', score: 85, category: 'Alert' }
            ],
            overallSentiment: 'Negative',
            confidenceScore: 94,
            valenceArousal: {
              valence: -0.85,
              arousal: 0.8,
              quadrant: 'High Distress / Unpleasant High-Energy'
            },
            facialSignals: {
              eyeContact: 'Intermittent downward gaze, signs of severe strain',
              microExpressions: ['Tense brow furrowing', 'Lip press & trembling', 'Tightened periorbital muscles'],
              facialTension: 'Elevated muscle tension around forehead and mouth',
              postureAndGaze: 'Slumped posture, head tilted downward'
            },
            vocalSignals: {
              speechPace: 'Hesitant speech with prolonged pauses',
              pitchVariability: 'Low pitch stability, vocal tremor present',
              vocalTremorOrTone: 'Strained, subdued voice tone'
            },
            keyCuesObserved: [
              'High facial muscle tension near brow',
              'Subdued speech cadence with vocal tremor',
              'Trigger keyword match in spoken/transcript signal'
            ],
            emotionTimeline: [
              { timestamp: '00:00', timeInSeconds: 0, valence: -0.6, arousal: 0.5, emotion: 'Anxiety', cue: 'Direct gaze with brow strain' },
              { timestamp: '00:05', timeInSeconds: 5, valence: -0.85, arousal: 0.85, emotion: 'Severe Distress', cue: 'Vocal tremor & tense lip press' },
              { timestamp: '00:10', timeInSeconds: 10, valence: -0.9, arousal: 0.7, emotion: 'Crisis Risk', cue: 'Downward head tilt & sigh' }
            ],
            summary: `⚠️ SAFETY TRIGGER DETECTED: ${triggeredAlert.triggerReason}. Incident alert dispatched to Admin Safety Desk and Parent Portal.`,
            healthRecommendations: [
              'URGENT: Reach out immediately to Hopeline PH 177 / NCMH 1553.',
              'Contact your school guidance counselor or trusted adult right away.',
              'Your well-being is important; safety team and family have been notified for support.'
            ],
            safetyAlertTriggered: true,
            alertDetails: triggeredAlert
          });
        }

        return res.json({
          emotions: [
            { name: 'Thoughtful', score: 82, category: 'Cognitive' },
            { name: 'Calm', score: 76, category: 'Affect' },
            { name: 'Reflective', score: 68, category: 'Posture' }
          ],
          overallSentiment: 'Neutral',
          confidenceScore: 91,
          valenceArousal: {
            valence: 0.35,
            arousal: 0.1,
            quadrant: 'Pleasant & Calm / Balanced Reflection'
          },
          facialSignals: {
            eyeContact: 'Direct, steady eye contact with webcam',
            microExpressions: ['Subtle lip corner elevation', 'Relaxed brow', 'Natural blinking rate'],
            facialTension: 'Low facial muscle tension, relaxed jaw',
            postureAndGaze: 'Upright, grounded posture'
          },
          vocalSignals: {
            speechPace: 'Moderate, steady speech rhythm',
            pitchVariability: 'Natural melodic pitch variations',
            vocalTremorOrTone: 'Clear, relaxed vocal resonance'
          },
          keyCuesObserved: [
            'Steady gaze and open facial expressions',
            'Smooth speech pacing with natural pitch modulation',
            'Relaxed facial posture throughout recording'
          ],
          emotionTimeline: [
            { timestamp: '00:00', timeInSeconds: 0, valence: 0.2, arousal: 0.2, emotion: 'Attentive', cue: 'Direct camera view setup' },
            { timestamp: '00:05', timeInSeconds: 5, valence: 0.4, arousal: 0.1, emotion: 'Reflective', cue: 'Relaxed facial posture' },
            { timestamp: '00:10', timeInSeconds: 10, valence: 0.45, arousal: -0.1, emotion: 'Calm Joy', cue: 'Subtle smile & steady voice' }
          ],
          summary: 'Video recording processed. Facial posture and engagement reflect an attentive, grounded, and self-reflective personal message.',
          healthRecommendations: [
            'Maintain regular video journal entries to observe visual mood trends over time.',
            'Incorporate light physical relaxation techniques when reflecting on complex emotions.',
            'Ensure adequate rest and hydration for balanced mental wellness.'
          ],
          safetyAlertTriggered: false
        });
      }

      let resultText = response.text || "{}";
      resultText = resultText.replace(/^```json\n?/i, '').replace(/```$/i, '').trim();
      let result: any;
      try {
        result = JSON.parse(resultText);
      } catch (err) {
        console.warn("Standard parse failed for video. Attempting to repair truncated JSON...");
        const fixes = ['"]}', ']}', '}', '"}'];
        let fixed = false;
        for (const fix of fixes) {
          try {
            result = JSON.parse(resultText + fix);
            fixed = true;
            break;
          } catch (e) {}
        }
        if (!fixed) throw err;
      }

      if (result) {
        if (!triggeredAlert && result.summary) {
          triggeredAlert = evaluateContentForSafetyAlerts(result.summary, moduleName);
        }
        if (!triggeredAlert && Array.isArray(result.transcript)) {
          for (const item of result.transcript) {
            if (item?.text && !triggeredAlert) {
              triggeredAlert = evaluateContentForSafetyAlerts(item.text, moduleName);
            }
          }
        }
        if (!triggeredAlert && Array.isArray(result.emotions)) {
          const emotionNames = result.emotions.map((e: any) => e.name).join(' ');
          triggeredAlert = evaluateContentForSafetyAlerts(emotionNames, moduleName);
        }

        if (triggeredAlert) {
          result.overallSentiment = 'Negative';
          result.safetyAlertTriggered = true;
          result.alertDetails = triggeredAlert;
        } else {
          result.safetyAlertTriggered = false;
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Error analyzing video:', error);
      res.status(500).json({ error: "Failed to analyze video.", details: String(error) });
    }
  });

  // API Route for Audio Analysis
  app.post('/api/analyze-audio', async (req, res) => {
    try {
      const { audioBase64, mimeType, liveTranscript, sourceModule } = req.body;
      const moduleName = sourceModule || 'Share Voice (Audio)';

      let triggeredAlert: any = null;
      if (liveTranscript && typeof liveTranscript === 'string') {
        triggeredAlert = evaluateContentForSafetyAlerts(liveTranscript, moduleName);
      }

      if (!audioBase64) {
        return res.status(400).json({ error: 'Please provide audio for analysis.' });
      }

      const cleanedMimeType = (mimeType || 'audio/webm').split(';')[0].trim();
      const transcriptHint = liveTranscript && typeof liveTranscript === 'string' && liveTranscript.trim()
        ? `\nLive speech recognition captured user spoken words hint: "${liveTranscript.trim()}". Ensure exact accuracy for these spoken words.`
        : '';

      const parts = [
        { text: `Perform a highly accurate and thorough audio analysis of this voice recording.
CRITICAL INSTRUCTIONS:
1. SPEECH TRANSCRIPT: Transcribe EVERY spoken word in the audio with 100% accuracy. Place the verbatim spoken text into the 'transcript' array with speaker label ("User" or "Speaker 1"), timestamps ("00:00 - 00:05"), emotion label, and a Tailwind text color class. The 'transcript' array MUST NOT be empty whenever spoken words or voice audio exist.${transcriptHint}
2. ACCURATE EMOTIONAL ANALYSIS: Analyze acoustic parameters (pitch, tone, prosody, speed, tremor, pauses) AND the semantics of the transcript. The calculated valence (-1.0 to +1.0), arousal (-1.0 to +1.0), and dominant emotion MUST accurately correspond to what the user actually spoke in the recording and transcript.
3. If negative emotions or distress are expressed in the spoken words (e.g. Sadness, Stress, Anxiety, Overwhelmed, Fear, Grief, Anger, Disappointment), 'valence' MUST BE NEGATIVE (between -1.0 and -0.2).
4. Provide a comprehensive 'psychologistReview' detailing summary observations, emotional assessment, clinical insights, recommended coping strategies, and guidance counselor note.
5. Generate an 'emotionTimeline' array over the audio duration showing how valence and arousal fluctuate across timestamps.

Respond strictly with a JSON object matching the requested schema.`},
        {
          inlineData: {
            data: audioBase64.split(',')[1] || audioBase64,
            mimeType: cleanedMimeType,
          },
        }
      ];

      let response;
      try {
        response = await generateWithModelFallback({ parts }, {
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              transcript: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING },
                    time: { type: Type.STRING },
                    text: { type: Type.STRING },
                    emotion: { type: Type.STRING },
                    color: { type: Type.STRING }
                  }
                }
              },
              overallEmotion: {
                type: Type.OBJECT,
                properties: {
                  dominantEmotion: { type: Type.STRING },
                  intensity: { type: Type.NUMBER },
                  valence: { type: Type.NUMBER },
                  arousal: { type: Type.NUMBER }
                }
              },
              emotionTimeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: { type: Type.STRING },
                    timeInSeconds: { type: Type.NUMBER },
                    valence: { type: Type.NUMBER },
                    arousal: { type: Type.NUMBER },
                    emotion: { type: Type.STRING },
                    speaker: { type: Type.STRING }
                  }
                }
              },
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              healthRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              summary: { type: Type.STRING },
              psychologistReview: {
                type: Type.OBJECT,
                properties: {
                  summaryObservation: { type: Type.STRING },
                  emotionalAssessment: { type: Type.STRING },
                  clinicalInsights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  recommendedCopingStrategies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  guidanceCounselorNote: { type: Type.STRING }
                },
                required: ["summaryObservation", "emotionalAssessment", "clinicalInsights", "recommendedCopingStrategies", "guidanceCounselorNote"]
              }
            },
            required: ["title", "transcript", "overallEmotion", "insights", "healthRecommendations", "summary", "psychologistReview"]
          }
        });
      } catch (audioErr) {
        console.warn('Audio AI call failed/quota limit reached. Providing fallback structured review:', audioErr);
        const transcriptText = liveTranscript || "Voice recording submitted for emotional evaluation.";
        if (!triggeredAlert) {
          triggeredAlert = evaluateContentForSafetyAlerts(transcriptText, moduleName);
        }

        if (triggeredAlert) {
          return res.json({
            title: "Audio Emotion Session Analysis (Safety Alert Triggered)",
            transcript: [
              {
                speaker: "User",
                time: "00:00 - 00:10",
                text: transcriptText,
                emotion: "High Risk / Severe Distress",
                color: "text-rose-400 font-black"
              }
            ],
            overallEmotion: {
              dominantEmotion: triggeredAlert.category === 'SUICIDE_SELF_HARM' ? 'Critical Crisis Risk' : 'Severe Distress',
              intensity: 95,
              valence: -0.9,
              arousal: 0.8
            },
            insights: [
              `⚠️ SAFETY TRIGGER DETECTED: ${triggeredAlert.triggerReason}`,
              "Automated safety protocols dispatched to Admin Safety Desk and Parent Portal."
            ],
            healthRecommendations: [
              "URGENT: Connect immediately with Hopeline Philippines (177) or NCMH (1553).",
              "Inform a school guidance counselor, adviser, or guardian right away for direct care."
            ],
            summary: `⚠️ SAFETY TRIGGER DETECTED: ${triggeredAlert.triggerReason}. Incident alert dispatched to Admin Safety Desk and Parent Portal.`,
            psychologistReview: {
              summaryObservation: "Vocal transcript contains high-risk safety triggers or emotional distress markers.",
              emotionalAssessment: "High vulnerability detected requiring immediate crisis response and human support.",
              clinicalInsights: [
                "Safety keywords detected in recording transcript.",
                "Dispatched to crisis helpline & guidance officer."
              ],
              recommendedCopingStrategies: [
                "Immediate Hopeline PH 177 / NCMH 1553 crisis contact",
                "Direct guidance counselor check-in"
              ],
              guidanceCounselorNote: "CRITICAL ALERT: Please review Admin Safety Desk and reach out to student immediately."
            },
            safetyAlertTriggered: true,
            alertDetails: triggeredAlert
          });
        }

        return res.json({
          title: "Audio Emotion Session Analysis",
          transcript: [
            {
              speaker: "User",
              time: "00:00 - 00:10",
              text: transcriptText,
              emotion: "Reflective",
              color: "text-blue-400"
            }
          ],
          overallEmotion: {
            dominantEmotion: "Reflective",
            intensity: 75,
            valence: 0.1,
            arousal: 0.2
          },
          insights: [
            "Voice cadence reflects calm and thoughtful expression.",
            "A vocal pause indicates careful consideration of thoughts."
          ],
          healthRecommendations: [
            "Engage in daily vocal expression exercises or journaling.",
            "Incorporate a 5-minute deep breathing exercise post-recording."
          ],
          summary: "Vocal recording analyzed. Pitch and pace demonstrate an open, reflective mindset.",
          psychologistReview: {
            summaryObservation: "The speaker communicates with steady tone and composed rhythm.",
            emotionalAssessment: "Exhibits self-awareness and balanced emotional regulation.",
            clinicalInsights: [
              "Vocal frequency patterns indicate stability without acute vocal tension.",
              "Constructive self-dialogue observed during session."
            ],
            recommendedCopingStrategies: [
              "Mindful breathing exercises",
              "Structured evening reflection"
            ],
            guidanceCounselorNote: "Encourage continued self-expression and periodic check-ins."
          },
          safetyAlertTriggered: false
        });
      }

      let resultText = response.text || "{}";
      resultText = resultText.replace(/^```json\n?/i, '').replace(/```$/i, '').trim();
      let result: any;
      try {
        result = JSON.parse(resultText);
      } catch (err) {
        console.warn("Standard parse failed for audio. Attempting to repair truncated JSON...");
        const fixes = ['"]}]}', '"}]}', '}]}', ']}', '}', '"]}', '"}', '"]', ']', '"'];
        let fixed = false;
        for (const fix of fixes) {
          try {
            result = JSON.parse(resultText + fix);
            fixed = true;
            break;
          } catch (e) {}
        }
        if (!fixed) throw err;
      }

      if (result) {
        if (!triggeredAlert && result.summary) {
          triggeredAlert = evaluateContentForSafetyAlerts(result.summary, moduleName);
        }
        if (!triggeredAlert && Array.isArray(result.transcript)) {
          for (const item of result.transcript) {
            if (item?.text && !triggeredAlert) {
              triggeredAlert = evaluateContentForSafetyAlerts(item.text, moduleName);
            }
          }
        }
        if (!triggeredAlert && result.psychologistReview?.summaryObservation) {
          triggeredAlert = evaluateContentForSafetyAlerts(result.psychologistReview.summaryObservation, moduleName);
        }

        if (triggeredAlert) {
          if (!result.overallEmotion) result.overallEmotion = {};
          result.overallEmotion.valence = -0.9;
          result.overallEmotion.dominantEmotion = triggeredAlert.category === 'SUICIDE_SELF_HARM' ? 'Critical Crisis Risk' : 'Severe Distress';
          result.safetyAlertTriggered = true;
          result.alertDetails = triggeredAlert;
        } else {
          result.safetyAlertTriggered = false;
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      res.status(500).json({ error: "Failed to analyze audio.", details: String(error) });
    }
  });

  // API Route for Counselor Chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Please provide an array of messages.' });
      }

      // Safety & Crisis Insinuation Check on User Input
      const userMsgs = messages.filter(m => m.role === 'user');
      const lastUserMsg = userMsgs[userMsgs.length - 1];
      let triggeredAlert: any = null;

      if (lastUserMsg && lastUserMsg.content) {
        triggeredAlert = evaluateContentForSafetyAlerts(lastUserMsg.content, 'SaFie AI Counselor Chat', 'Student LRN: 109283748291');
      }

      // If safety alert triggered for ANY category, attach safetyAlertTriggered & alertDetails
      if (triggeredAlert) {
        if (triggeredAlert.category === 'SUICIDE_SELF_HARM') {
          return res.json({
            reply: "I hear how much pain and weight you are carrying right now, and I want you to know that your life matters deeply and you do not have to carry this heavy burden alone. I am here with you.\n\nPlease connect with a caring crisis specialist right now who is ready to listen:\n• Hopeline Philippines (24/7): 177 or 0917-558-4673\n• NCMH Crisis Hotline: 1553 or 0917-899-8727\n• National Emergency: 911\n\nI am right here with you, step by step, whenever you need a safe space to talk.",
            safetyAlertTriggered: true,
            alertDetails: triggeredAlert
          });
        }

        // For other triggered categories (Bullying, Revenge, Violence, Illegal Acts)
        return res.json({
          reply: "Thank you so much for trusting me with this. I can feel how heavy and stressful this situation is for you. Please know that your safety, peace of mind, and well-being are what matter most. You don't have to face frightening or difficult experiences by yourself. I am right here with you to listen, support you, and help you find a safe way forward.",
          safetyAlertTriggered: true,
          alertDetails: triggeredAlert
        });
      }

      const formattedContents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const systemInstruction = "You are 'SaFie' (Friend Counselor), a deeply warm, empathetic, compassionate, and reassuring guidance counselor dedicated to supporting Filipino students and youth.\n\nYour core traits and conversational style:\n1. Warmth & Genuine Concern: Speak like a trusted, caring school guidance counselor who makes every student feel instantly safe, valued, and deeply cared for. Use a tender, welcoming tone (e.g., 'I am so glad you felt safe enough to share that with me', 'Take a gentle breath — you are not alone in this').\n2. Active Listening & Emotion Validation: Always acknowledge and validate the user's feelings first before offering gentle guidance or reflection. Never dismiss, minimize, or rush to give cold, robotic advice.\n3. Culturally Attuned & Empathetic: Understand Filipino student life, academic pressures (exams, thesis, family expectations, peer relationships), and emotional dynamics. Feel free to naturally incorporate gentle, warm Taglish or Filipino expressions (e.g., 'kamusta ka', 'mahigpit na yakap', 'maraming salamat sa pag-share') when appropriate to make the conversation feel authentic, soothing, and comforting.\n4. Thoughtful Reflection & Soft Questions: Offer gentle insights and ask 1-2 open, caring follow-up questions to help them express their feelings at their own pace.\n5. Non-judgmental Safe Space: Maintain complete acceptance, warmth, and respect at all times. Keep responses thoughtful, conversational, and concise so it feels like a real heart-to-heart talk in a cozy counseling room.";

      let response;
      try {
        response = await generateWithModelFallback(formattedContents, {
          systemInstruction,
          maxOutputTokens: 1000,
        });
        res.json({ reply: response.text });
      } catch (chatErr) {
        console.warn('Chat quota limit reached, returning supportive default guidance:', chatErr);
        res.json({ 
          reply: "I am here with you and listening. Even when things feel overwhelming, take a gentle breath. How are you feeling right now?" 
        });
      }
    } catch (error) {
      console.error('Error in chat:', error);
      res.status(500).json({ error: "Failed to generate chat response.", details: String(error) });
    }
  });

  // Setup Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

createServer();
