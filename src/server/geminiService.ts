import { GoogleGenAI, Type } from '@google/genai';
import {
  AIStudioFormState,
  AIGeneratedContentResult,
  AIRefineAction,
  NovelAIPayload,
  NovelAIResult,
  GeminiStatusInfo
} from '../types/aiStudio';

const MODEL_NAME = 'gemini-3.8-flash';

function getGeminiClient(): { client: GoogleGenAI; apiKey: string } {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please ensure the GEMINI_API_KEY environment variable is set.');
  }

  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return { client, apiKey };
}

export function checkGeminiStatus(): GeminiStatusInfo {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      isConfigured: false,
      model: MODEL_NAME,
      error: 'GEMINI_API_KEY is missing from server environment.'
    };
  }

  return {
    isConfigured: true,
    model: MODEL_NAME
  };
}

export async function generateContentStudioOutput(payload: AIStudioFormState): Promise<AIGeneratedContentResult> {
  const { client } = getGeminiClient();

  const {
    topic,
    title,
    category,
    contentType,
    targetAudience = 'Tech enthusiasts, developers, and visual media lovers',
    desiredLength = 'medium',
    sourceReferenceInfo = '',
    additionalInstructions = '',
    tone = 'Editorial, sharp, well-structured, authoritative and engaging',
    focusAngle = 'In-depth, analytical, and practical'
  } = payload;

  const lengthInstructions = {
    short: 'Target length: Approximately 500 - 800 words. Concise, high-density, no fluff.',
    medium: 'Target length: Approximately 1,200 - 1,800 words. Balanced, well-structured, thorough.',
    long: 'Target length: Approximately 2,500 - 3,500 words. Comprehensive deep dive with full section breakdowns.',
    comprehensive: 'Target length: Approximately 4,000+ words. Definitive reference guide, exhaustive analysis, benchmarks, and multi-tier insights.'
  }[desiredLength] || 'Target length: Approximately 1,500 words.';

  const typeInstructions = {
    'blog-article': 'Format as an engaging, high-readership blog article with hook, narrative flow, subheadings, actionable takeaways, and clear concluding verdict.',
    'article': 'Format as a premier editorial analytical feature article with executive depth, clear structural hierarchy, and rigorous technical/cultural analysis.',
    'tech-article': 'Format as a rigorous engineering / technical deep dive covering architecture, implementation trade-offs, practical benchmarks, code/system paradigms, and ergonomics.',
    'tech-product': 'Format as a tech product evaluation: What It Is, Architecture & Specs, Core Capabilities, Competitive Trade-offs, and Buyer/Builder Verdict.',
    'ai-tool': 'Format as an AI tool / model breakdown: Model Architecture, Capabilities & Limitations, Practical Workflows, Benchmarks, Pricing / Access, and Ecosystem Impact.',
    'product-description': 'Format as an authoritative, feature-rich product showcase detailing key value propositions, user problems solved, exact features, and technical specifications.',
    'movie-review': 'Format as an astute film / television critique examining narrative craft, visual direction, cinematography, pacing, performances, thematic depth, and recommendations (spoiler-free).',
    'movie': 'Format as a cinema visual and narrative breakdown with focus on director intent, composition, color grading, sound design, and impact.',
    'anime-manga': 'Format as an in-depth manga/anime review covering plot progression, character arcs, sakuga animation / paneling flow, world-building, and audience recommendation.',
    'manhwa': 'Format as a webtoon / manhwa critique focusing on vertical scroll pacing, panel gutters, art evolution, cliffhangers, and story progression.',
    'anime': 'Format as an episodic / series anime editorial analyzing animation studio craftsmanship, narrative pacing, music, and cultural resonance.',
    'novel-outline': 'Format as a comprehensive web novel master outline: Premise, World-Building & Magic/Tech System, Protagonist Arc, Major Antagonists, Multi-Volume Plot Arcs, and Key Milestones.',
    'novel-chapter': 'Format as a full web novel chapter with immersive scene establishment, dialogue, inner monologue, narrative tension, progression, and a gripping chapter ending.',
    'short-story': 'Format as a compelling creative fiction narrative with evocative world-building, high-stakes conflict, character transformation, and a resonant climax.',
    'top-10': 'Format as a ranked top 10 listicle with clear objective ranking criteria, individual item evaluations, pros & cons for each, and a summary verdict table.',
    'top-20': 'Format as a curated top 20 rankings matrix with structured taxonomy, tier lists, and quick-scan comparison criteria.',
    'comparison': 'Format as a definitive side-by-side comparison: Feature matrix, performance benchmarks, real-world workflow strengths, weakness evaluation, and decision flowchart.',
    'recommendation': 'Format as an urgent curator spotlight: Why this demands your attention now, unique selling proposition, who should experience it, and how to get started.'
  }[contentType] || 'Format as an in-depth, authoritative editorial article.';

  const prompt = `You are the lead editor for "PRISM" — a modern visual discovery and curated knowledge publication.

TASK:
Generate a completely authentic, original, and deeply structured editorial suite for the topic below.

INPUT PARAMETERS:
- Topic: ${topic}
${title ? `- Explicit Title Request: ${title}` : ''}
- Category: ${category}
- Content Archetype: ${contentType}
- Target Audience: ${targetAudience}
- Desired Depth: ${desiredLength} (${lengthInstructions})
- Editorial Tone: ${tone}
- Focus Angle: ${focusAngle}
- Archetype Guidance: ${typeInstructions}

HUMAN EDITOR SOURCE NOTES & TRUTH ANCHOR:
"""
${sourceReferenceInfo.trim() || 'No specific editor notes supplied. Base all factual points strictly on verified real-world knowledge. Do not invent non-existent features, fake quotes, or fabricated benchmarks.'}
"""

ADDITIONAL INSTRUCTIONS:
"""
${additionalInstructions.trim() || 'Provide a complete, ready-to-refine draft adhering to PRISM high standards of precision and visual readability.'}
"""

CRITICAL EDITORIAL RULES:
1. Generate genuinely new, insightful, non-templated editorial writing tailored specifically to this topic and archetype.
2. NEVER fabricate fake quotes, fake user star ratings, or imaginary customer reviews.
3. NEVER fabricate false pricing or unverified benchmark numbers. If unverified, note "Requires verification" in factCheckFlags.
4. Structure the markdown draft with clean markdown headers (## and ###), bullet points, and callouts.
5. All factCheckFlags must identify concrete factual assertions from the text that human editors should verify against primary documentation.

Respond strictly with valid JSON conforming to the requested schema.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction:
          'You are PRISM elite editorial AI. Respond with valid JSON matching the schema strictly without markdown code block backticks.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  angle: { type: Type.STRING },
                  charCount: { type: Type.INTEGER },
                },
                required: ['id', 'text', 'angle', 'charCount'],
              },
              description: '5 high-impact headline options tailored to distinct angles (e.g. Provocative, Technical, Direct Value, Curated, Curiosity).',
            },
            shortSummary: {
              type: Type.STRING,
              description: 'Concise, compelling 2-sentence executive summary.',
            },
            quickTake: {
              type: Type.OBJECT,
              properties: {
                whatItIs: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
                keyPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyHighlights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['whatItIs', 'whyItMatters', 'keyPoints'],
            },
            articleOutline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['heading', 'points'],
              },
            },
            firstDraft: {
              type: Type.STRING,
              description: 'Full rich markdown draft matching the requested length and archetype with subheaders and formatted lists.',
            },
            seo: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                metaDescription: { type: Type.STRING },
                slugSuggestion: { type: Type.STRING },
                primaryKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['title', 'metaDescription', 'slugSuggestion', 'primaryKeywords'],
            },
            relatedContentIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  contentType: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['title', 'contentType', 'rationale'],
              },
            },
            internalLinkSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  anchorText: { type: Type.STRING },
                  suggestedDestination: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ['anchorText', 'suggestedDestination', 'context'],
              },
            },
            socialCaptions: {
              type: Type.OBJECT,
              properties: {
                twitterThreadStarter: { type: Type.STRING },
                linkedInPost: { type: Type.STRING },
                redditDiscussionStarter: { type: Type.STRING },
                newsletterBlurb: { type: Type.STRING },
              },
              required: ['twitterThreadStarter', 'linkedInPost', 'redditDiscussionStarter', 'newsletterBlurb'],
            },
            factCheckFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  status: { type: Type.STRING },
                  guidance: { type: Type.STRING },
                },
                required: ['item', 'status', 'guidance'],
              },
            },
            pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            considerations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedSpecs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                },
                required: ['label', 'value'],
              },
            },
          },
          required: [
            'headlines',
            'shortSummary',
            'quickTake',
            'articleOutline',
            'firstDraft',
            'seo',
            'relatedContentIdeas',
            'internalLinkSuggestions',
            'socialCaptions',
            'factCheckFlags',
            'suggestedTags',
          ],
        },
      },
    });

    const text = response.text || '';
    if (!text.trim()) {
      throw new Error('Gemini returned an empty response. Please verify your prompt and try again.');
    }

    const parsed: AIGeneratedContentResult = JSON.parse(text);
    return parsed;
  } catch (err: any) {
    console.error('Gemini generateContentStudioOutput error:', err);
    throw new Error(err.message || 'Failed to generate content with Gemini AI.');
  }
}

export interface RefineTextPayload {
  action: AIRefineAction;
  text: string;
  context?: string;
  topic?: string;
  instructions?: string;
}

export async function refineContentText(payload: RefineTextPayload): Promise<{ resultText: string; action: AIRefineAction }> {
  const { client } = getGeminiClient();
  const { action, text, context = '', topic = '', instructions = '' } = payload;

  if (!text || text.trim().length === 0) {
    throw new Error('Text to refine cannot be empty.');
  }

  const actionPrompts: Record<AIRefineAction, string> = {
    regenerate: `Completely rewrite and regenerate the following draft text with a fresh perspective, stronger flow, engaging subheadings, and deep insights while keeping the core topic intact.`,
    continue: `Continue writing seamlessly from the exact end of the provided text. Do NOT repeat what was already written. Continue the narrative / analysis naturally with the next logical paragraphs, supporting evidence, and insights.`,
    improve: `Elevate and improve the following text. Enhance sentence variety, editorial polish, rhetorical punch, and conceptual clarity while maintaining the original meaning and factual accuracy.`,
    expand: `Expand the following text in depth. Elaborate on the core concepts with concrete examples, nuanced analysis, architectural/stylistic breakdowns, and thorough explanations without adding unnecessary fluff.`,
    shorten: `Condense and tighten the following text. Remove redundancies and wordiness while rigorously preserving all key facts, critical arguments, and high-impact conclusions.`,
    fix_grammar: `Carefully correct all grammatical errors, typos, spelling mistakes, punctuation issues, and awkward phrasing in the following text. Preserve the original voice, style, and formatting.`
  };

  const actionInstruction = actionPrompts[action] || actionPrompts.improve;

  const prompt = `You are the lead editor for PRISM publication.

OPERATION: ${action.toUpperCase()}
INSTRUCTION: ${actionInstruction}
${topic ? `TOPIC CONTEXT: ${topic}` : ''}
${instructions ? `SPECIAL HUMAN EDITOR DIRECTIONS: ${instructions}` : ''}
${context ? `SURROUNDING CONTEXT: ${context}` : ''}

CURRENT TEXT:
"""
${text}
"""

OUTPUT REQUIREMENTS:
- Output ONLY the updated markdown text directly.
- Do NOT wrap in explanatory preamble or metadata (e.g. do not say "Here is your continued text:").
- Maintain clean markdown formatting.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite editorial editor. Return only the revised text directly in clean markdown.',
      },
    });

    const resultText = response.text || '';
    if (!resultText.trim()) {
      throw new Error(`Gemini returned an empty response for action '${action}'.`);
    }

    return {
      resultText: resultText.trim(),
      action
    };
  } catch (err: any) {
    console.error(`Gemini refineContentText (${action}) error:`, err);
    throw new Error(err.message || `Failed to perform ${action} with Gemini AI.`);
  }
}

export async function generateNovelContent(payload: NovelAIPayload): Promise<NovelAIResult> {
  const { client } = getGeminiClient();

  const {
    type,
    novelTitle,
    genre,
    characters = '',
    setting = '',
    plotDirection = '',
    writingStyle = 'Cinematic, fast-paced, immersive progression fantasy with visceral stakes',
    chapterLength = 'medium',
    previousChapterContext = '',
    additionalPrompt = ''
  } = payload;

  const lengthGuide = {
    short: 'Around 800 - 1,200 words',
    medium: 'Around 1,500 - 2,500 words',
    long: 'Around 3,000 - 4,500 words'
  }[chapterLength] || 'Around 1,500 words';

  let typeSpecificPrompt = '';
  switch (type) {
    case 'idea':
      typeSpecificPrompt = `Generate 3 distinct, high-concept story premises for this web novel.
For each premise, include:
1. High-Concept Hook & Logline
2. Unique Power / Magic / Technology Progression System
3. Protagonist Archetype & Inciting Cataclysm
4. Central Antagonistic Force & Stakes
5. The "Viral Cliffhanger" Element that keeps serialized readers hooked.`;
      break;

    case 'character':
      typeSpecificPrompt = `Generate detailed character profiles for the novel "${novelTitle}".
Provide full profiles for:
- The Protagonist: Name, Alias, Initial Class/Rank, Personality Flaws, Driving Motivations, Latent Potential, Combat Style, and Background.
- The Primary Rival / Foil: Dynamic with protagonist, differing philosophy.
- The Core Supporting Ally / Mentor: Quirks, secrets, power limitations.
- The Enigmatic Antagonist: Justified worldview, threatening capability, presence.`;
      break;

    case 'story_outline':
      typeSpecificPrompt = `Generate a master multi-arc story outline for the novel "${novelTitle}".
Structure as:
- Volume / Arc 1: The Inciting Catalyst & Foundation (Chapters 1-25)
- Volume / Arc 2: The Trial of Ascendancy & Escalation (Chapters 26-60)
- Volume / Arc 3: World Fracture & Betrayal / Midpoint Crisis (Chapters 61-100)
- Volume / Arc 4: Sovereign Convergence & Ultimate Climax (Chapters 101+)
Include key plot turns, system evolution breakthroughs, and major emotional reveals.`;
      break;

    case 'chapter_outline':
      typeSpecificPrompt = `Generate a detailed chapter-by-chapter outline for the upcoming 5 chapters of "${novelTitle}".
For each chapter provide:
- Chapter Number & Evocative Title
- Opening Scene & Setting
- Core Confrontation / Discovery / Progression Beat
- System Notification or Tactical Turn
- Ending Cliffhanger hook.`;
      break;

    case 'chapter':
      typeSpecificPrompt = `Write a complete, thrilling web novel chapter for "${novelTitle}".
Target Length: ${lengthGuide}.
Tone: ${writingStyle}.
Requirements:
- Immersive scene craft with sensory tactile details.
- Organic dialogue that reveals character personality and subtext.
- Dynamic action choreography or high-tension negotiation.
- Clear progression / system feedback if applicable.
- End on a heart-stopping cliffhanger that compels immediate reading of the next chapter.`;
      break;

    case 'chapter_continuation':
      typeSpecificPrompt = `Write the direct continuation of the previous chapter of "${novelTitle}".
Target Length: ${lengthGuide}.
Tone: ${writingStyle}.
Maintain strict continuity with the events, positioning, dialogue, and momentum established in the previous chapter context.
Do NOT reboot the scene. Pick up exactly at the tension point and advance the narrative toward its climax and next cliffhanger.`;
      break;
  }

  const prompt = `You are a master serialized web novel author and story architect for PRISM's Original Fiction portal.

NOVEL INFORMATION:
- Novel Title: ${novelTitle}
- Genre: ${genre}
- Setting / World: ${setting || 'Expansive serialized fiction world with distinct hierarchy'}
- Characters: ${characters || 'Protagonist seeking mastery and truth'}
- Plot Direction: ${plotDirection || 'High-stakes progression and uncovering deeper secrets'}
- Writing Style: ${writingStyle}
- Target Chapter Length: ${lengthGuide}

${previousChapterContext ? `PREVIOUS CHAPTER CONTEXT (FOR STRICT CONTINUITY):
"""
${previousChapterContext.slice(-3000)}
"""` : ''}

${additionalPrompt ? `ADDITIONAL AUTHOR INSTRUCTIONS:
"""
${additionalPrompt}
"""` : ''}

TASK:
${typeSpecificPrompt}

OUTPUT GUIDELINES:
- Output only the generated novel content in clean, formatted Markdown.
- Maintain top-tier serialization craft: pacing, momentum, dialogue, and memorable prose.`;

  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite web novel author and story architect. Output polished, thrilling markdown prose directly.',
      },
    });

    const result = response.text || '';
    if (!result.trim()) {
      throw new Error(`Gemini returned an empty response for novel generation (${type}).`);
    }

    return {
      result: result.trim(),
      type,
      novelTitle
    };
  } catch (err: any) {
    console.error(`Gemini generateNovelContent (${type}) error:`, err);
    throw new Error(err.message || `Failed to generate novel ${type} with Gemini AI.`);
  }
}
