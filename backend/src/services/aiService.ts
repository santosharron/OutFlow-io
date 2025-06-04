import OpenAI from 'openai';

// Initialize OpenAI client conditionally
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface ProfileData {
  name: string;
  job_title: string;
  company: string;
  location?: string;
  summary?: string;
}

export const generatePersonalizedMessage = async (profileData: ProfileData): Promise<string> => {
  const { name, job_title, company, location, summary } = profileData;

  // Create a personalized prompt
  const prompt = `Generate a professional, personalized LinkedIn outreach message for the following person:

Name: ${name}
Job Title: ${job_title}
Company: ${company}
${location ? `Location: ${location}` : ''}
${summary ? `Professional Summary: ${summary}` : ''}

Requirements:
- Keep it professional and friendly
- Mention their role and company specifically
- Reference how OutFlo can help with lead generation and outreach automation
- Keep it under 200 words
- Make it sound genuine and personalized
- Include a clear call-to-action to connect
- Avoid being too salesy or generic

The message should be for OutFlo, a company that helps businesses automate their outreach to increase meetings and sales.`;

  try {
    // If OpenAI is not configured, use fallback immediately
    if (!openai) {
      console.warn('OpenAI API key not configured, using fallback message generation');
      return generateFallbackMessage(profileData);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional business development expert who writes highly personalized and effective LinkedIn outreach messages. Your messages are concise, genuine, and focus on providing value to the recipient."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const message = response.choices[0]?.message?.content?.trim();
    
    if (!message) {
      throw new Error('No message generated from AI service');
    }

    return message;
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Fallback to a template-based message if AI fails
    return generateFallbackMessage(profileData);
  }
};

// Fallback message generation when AI service fails
const generateFallbackMessage = (profileData: ProfileData): string => {
  const { name, job_title, company } = profileData;
  
  const templates = [
    `Hi ${name},

I noticed you're working as a ${job_title} at ${company}. I'm reaching out because OutFlo helps companies like ${company} automate their outreach processes to significantly increase meetings and sales.

Given your role in ${job_title}, I thought you might be interested in learning how we've helped similar professionals streamline their lead generation efforts.

Would you be open to a brief conversation about how OutFlo could benefit ${company}?

Best regards!`,

    `Hello ${name},

I came across your profile and was impressed by your work as ${job_title} at ${company}. 

OutFlo specializes in helping businesses automate their outreach to boost meetings and sales. I believe there could be some great opportunities for ${company} to leverage our platform.

Would you be interested in connecting to discuss how OutFlo can help streamline your lead generation process?

Looking forward to connecting!`,

    `Hi ${name},

Hope you're doing well! I see you're a ${job_title} at ${company}, and I wanted to reach out because OutFlo has been helping companies in your space automate their outreach and increase their sales meetings.

I'd love to share how we've helped similar professionals at companies like ${company} improve their lead generation results.

Would you be open to a quick chat about this?

Best!`
  ];

  // Return a random template
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};

// Alternative AI service using a free API (if OpenAI is not available)
export const generateMessageWithFreeAI = async (profileData: ProfileData): Promise<string> => {
  // This would integrate with a free AI service like Hugging Face, Claude, etc.
  // For now, return the fallback message
  return generateFallbackMessage(profileData);
}; 