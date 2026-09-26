import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface GenerateContentStudioPayload {
  topic: string;
  category: string;
  contentType: string;
  targetAudience?: string;
  sourceReferenceInfo?: string;
  tone?: string;
  focusAngle?: string;
}

export async function generateContentStudioOutput(payload: GenerateContentStudioPayload) {
  const {
    topic,
    category,
    contentType,
    targetAudience = 'Tech enthusiasts, developers, and visual media lovers',
    sourceReferenceInfo = '',
    tone = 'Editorial, sharp, well-structured, authoritative and engaging',
    focusAngle = 'In-depth, analytical, and practical'
  } = payload;

  const prompt = `You are an elite editorial content assistant for "PRISM" — a modern visual discovery and curated knowledge publication.

TASK:
Generate comprehensive, ready-to-refine editorial assets for the following topic.

INPUT DETAILS:
- Topic: ${topic}
- Category: ${category}
- Content Type: ${contentType}
- Target Audience: ${targetAudience}
- Tone: ${tone}
- Focus Angle: ${focusAngle}
- Verified Source / Reference Information provided by Human Editor:
"""
${sourceReferenceInfo || 'No external notes provided. Base claims strictly on known factual information and do not hallucinate.'}
"""

CRITICAL EDITORIAL & FACT-CHECKING RULES (STRICT):
1. You are an ASSISTANT providing a first draft for human editing, NOT an automatic publisher.
2. NEVER invent:
   - Fake customer/user reviews or fake star ratings
   - Fake testimonials or fake endorsement quotes
   - Invented prices or fake discounts (if price is unknown, write "Check official site")
   - Made-up hardware/software specifications
   - Fictitious quotes from real people
   - Fabricated statistics or ungrounded research percentages
   - Fake sources or bogus citations
3. NEVER copy another website's verbatim sentences or copyrighted articles.
4. If a fact, specification, or release date is uncertain, explicitly mark it in the fact-checking warnings as "Needs Verification".
5. Tailor the structure to the content type:
   - For "Top 10/20" or "Rankings": provide structured numbered items with clear evaluation criteria.
   - For "Comparison": provide clear side-by-side breakdown points with pros & cons.
   - For "AI Tool" or "Tech Product": provide What It Is, Why It Matters, Key Highlights, Specs, and Considerations.
   - For "Movie", "Manhwa", or "Anime": focus on narrative craft, direction, cinematography/art, themes, and spoiler-free recommendations.
   - For "Short story": creative narrative aligned with the topic themes.

Respond strictly with valid JSON conforming to the requested schema.`;

  if (!ai || !apiKey) {
    // Graceful high-quality structured fallback for environments without API key configured
    return generateFallbackStudioOutput(payload);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a rigorous editorial assistant. Output must strictly follow the requested JSON schema without markdown wrapping.',
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
              description: '5 high-impact headline ideas with varied editorial angles (Curiosity, Direct Value, Provocative, Technical, Listicle/Review).',
            },
            shortSummary: {
              type: Type.STRING,
              description: 'Concise 2-sentence executive summary.',
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
              description: 'Comprehensive, deep markdown article draft with subheadings, formatted lists, and structured insights.',
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
                  status: { type: Type.STRING }, // 'needs_verification' | 'grounded_in_source' | 'general_knowledge'
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

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    // Fallback to structured output if API throws
    return generateFallbackStudioOutput(payload, err.message);
  }
}

// Deterministic intelligent fallback when Gemini key is not set or network fails
function generateFallbackStudioOutput(payload: GenerateContentStudioPayload, errorMessage?: string) {
  const { topic, category, contentType, targetAudience } = payload;
  const cleanTopic = topic.trim();
  const slug = cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    headlines: [
      {
        id: 'h1',
        text: `The Complete Guide to ${cleanTopic}: Architecture, Trade-offs & Practical Insights`,
        angle: 'Comprehensive / Direct Value',
        charCount: `The Complete Guide to ${cleanTopic}: Architecture, Trade-offs & Practical Insights`.length
      },
      {
        id: 'h2',
        text: `Why ${cleanTopic} Changes Everything for ${category}`,
        angle: 'Provocative & High Curiosity',
        charCount: `Why ${cleanTopic} Changes Everything for ${category}`.length
      },
      {
        id: 'h3',
        text: `${cleanTopic} Explained: What Actually Matters Under the Hood`,
        angle: 'Deep Technical Breakdown',
        charCount: `${cleanTopic} Explained: What Actually Matters Under the Hood`.length
      },
      {
        id: 'h4',
        text: `10 Things You Need to Know Before Adopting ${cleanTopic}`,
        angle: 'Listicle & Actionable Review',
        charCount: `10 Things You Need to Know Before Adopting ${cleanTopic}`.length
      },
      {
        id: 'h5',
        text: `The Practical Curator's Review: Is ${cleanTopic} Worth the Hype?`,
        angle: 'Editorial & Critical Analysis',
        charCount: `The Practical Curator's Review: Is ${cleanTopic} Worth the Hype?`.length
      }
    ],
    shortSummary: `${cleanTopic} offers a focused approach within ${category}, tailored specifically for ${targetAudience || 'modern professionals'}. This deep dive evaluates its core architecture, performance nuances, and practical utility.`,
    quickTake: {
      whatItIs: `${cleanTopic} is a high-profile subject in ${category} designed to solve workflow bottlenecks and provide enhanced capability.`,
      whyItMatters: `It represents a key evolutionary shift in how practitioners approach modern tools, streamlining execution without sacrificing depth.`,
      keyPoints: [
        `Purpose-built architecture optimized for ${category} workflows.`,
        `Delivers tangible improvements over legacy solutions when applied to real-world tasks.`,
        `Requires careful verification of environment requirements and trade-offs before full deployment.`
      ],
      keyHighlights: [
        'Streamlined integration and minimal configuration overhead',
        'Strong modular design supporting customized extensions',
        'Transparent documentation and community backing'
      ]
    },
    articleOutline: [
      {
        heading: '1. Executive Overview & Problem Context',
        points: [
          `The historical friction points in ${category}`,
          `How ${cleanTopic} enters the landscape`,
          'Target use cases and primary beneficiaries'
        ]
      },
      {
        heading: '2. Deep Architecture & Core Mechanics',
        points: [
          'Detailed structural breakdown',
          'Key differentiator features and mechanics',
          'Workflow benchmarks and resource requirements'
        ]
      },
      {
        heading: '3. Comparative Evaluation & Trade-offs',
        points: [
          'Strengths in daily production use',
          'Known constraints and limitations to plan around',
          'Cost vs capability breakdown'
        ]
      },
      {
        heading: '4. Editorial Verdict & Recommended Next Steps',
        points: [
          'Who should implement this immediately',
          'Who should hold off or consider alternatives',
          'Step-by-step onboarding checklist'
        ]
      }
    ],
    firstDraft: `## Executive Overview

In the rapidly shifting landscape of **${category}**, **${cleanTopic}** has emerged as a focal point for practitioners seeking greater efficiency, robust quality, and deeper control. 

This analysis cuts through marketing noise to provide an objective, human-verified breakdown of how it works, where it excels, and the practical caveats you need to consider before integrating it into your stack.

---

### Key Strengths & Architecture

At its core, **${cleanTopic}** focuses on eliminating repetitive friction. Unlike traditional approaches that impose heavy cognitive load or fragmented tooling, it unifies key operations into a cohesive workflow.

- **High-Density Execution:** Built to handle demanding workloads with minimal latency.
- **Interoperability:** Seamlessly bridges with standard ${category} protocols and ecosystems.
- **Transparent Output:** Gives users verifiable visibility into state, decisions, and performance.

---

### Practical Considerations & Trade-offs

No solution is a silver bullet. When evaluating **${cleanTopic}**, consider the following factors:

1. **Learning Curve & Configuration:** Initial onboarding benefits from clear reference documentation.
2. **Resource Allocation:** Ensure your production environment satisfies recommended baseline requirements.
3. **Ecosystem Compatibility:** Verify specific connector or integration support for your existing toolchain.

---

### Editorial Verdict

For ${targetAudience || 'teams and individual creators'}, **${cleanTopic}** delivers a compelling balance of innovation and reliability. It earns a solid recommendation for workflows demanding modern precision and rapid turnaround.`,
    seo: {
      title: `${cleanTopic} Review & Deep Dive | PRISM Discovery`,
      metaDescription: `An objective editorial breakdown of ${cleanTopic} in ${category}. Explore core capabilities, benchmarks, pros and cons, and practical implementation guidance.`,
      slugSuggestion: slug,
      primaryKeywords: [cleanTopic, category, `${category} tools`, `${cleanTopic} review`, 'PRISM Discovery']
    },
    relatedContentIdeas: [
      {
        title: `Top 5 Alternatives to ${cleanTopic} Evaluated`,
        contentType: 'Comparison & Ranking',
        rationale: 'Helps readers seeking different pricing tiers or specialized feature sets compare alternatives side-by-side.'
      },
      {
        title: `How to Build an End-to-End Workflow with ${cleanTopic}`,
        contentType: 'Tutorial / Deep Dive',
        rationale: 'Provides actionable tactical instructions for readers after they decide to adopt.'
      },
      {
        title: `The Future of ${category}: 2026 Trends & Predictions`,
        contentType: 'Editorial Trend Report',
        rationale: 'Positions PRISM as an authoritative industry voice while linking back to this topic.'
      }
    ],
    internalLinkSuggestions: [
      {
        anchorText: `${category} Directory`,
        suggestedDestination: `/directory?category=${slug}`,
        context: 'Direct readers to related published entries in the same taxonomy.'
      },
      {
        anchorText: 'Visual Discovery Feed',
        suggestedDestination: '/for-you',
        context: 'Engage readers with personalized discovery cards.'
      },
      {
        anchorText: 'Editorial Comparison Matrix',
        suggestedDestination: '/compare',
        context: 'Allow readers to compare this subject against alternative products.'
      }
    ],
    socialCaptions: {
      twitterThreadStarter: `🧵 Everything you need to know about ${cleanTopic} in 2 minutes:

We broke down the architecture, real-world trade-offs, and whether it actually lives up to the hype.

Here is the no-fluff breakdown 👇`,
      linkedInPost: `Is ${cleanTopic} ready for serious production workflows?

In our latest PRISM editorial review, we dive deep into the mechanics, practical trade-offs, and key benchmarks.

Key Takeaways:
• Solves core latency and ergonomics bottlenecks in ${category}
• Clean architecture with high interoperability
• Crucial trade-offs to check before adoption

Read the full fact-checked guide on PRISM.`,
      redditDiscussionStarter: `[Deep Dive] A breakdown of ${cleanTopic} — pros, cons, and honest thoughts after thorough testing. What has your experience been?`,
      newsletterBlurb: `**This Week's Curator Pick: ${cleanTopic}**\nWe published a deep-dive review exploring what makes this tool stand out in ${category}. Here is our quick take and verdict.`
    },
    factCheckFlags: [
      {
        item: 'Technical Specifications & Version Numbers',
        status: 'needs_verification',
        guidance: 'Ensure all version numbers, API endpoints, and minimum hardware specs reflect the latest official release.'
      },
      {
        item: 'Pricing & Licensing Terms',
        status: 'needs_verification',
        guidance: 'Do not state fixed pricing without verifying against the official pricing page today.'
      },
      {
        item: 'Comparative Claims',
        status: 'needs_verification',
        guidance: 'Confirm any performance differential or speed claim with verifiable benchmarks before publishing.'
      }
    ],
    pros: [
      'Engineered for maximum reliability and throughput',
      'Intuitive ergonomics with clear mental model',
      'Extensive integration points across modern tech stacks'
    ],
    considerations: [
      'Verify compatibility with legacy workflows',
      'Requires baseline domain familiarity for full optimization'
    ],
    suggestedTags: [
      cleanTopic,
      category,
      'Productivity',
      'Deep Dive',
      'Curated'
    ],
    suggestedSpecs: [
      { label: 'Category', value: category },
      { label: 'Content Type', value: contentType },
      { label: 'Status', value: 'Draft / Fact-Check Stage' }
    ],
    _isFallback: true,
    _errorDetails: errorMessage || undefined
  };
}
