const axios = require('axios');
const env = require('@global/utilities/env');

async function llmUtility(personality, topic) {
    const constrainedPersonality = [personality, 'Respond in no more than 300 characters. Be concise and clear. End the message cleanly and keep the text Twitch Chat friendly'].join('\n\n');

    const aiResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: env.groq.model,
            messages: [
                { role: 'system', content: constrainedPersonality },
                { role: 'user', content: topic }
            ],
            max_tokens: 100,
        },
        {
            headers: {
                Authorization: `Bearer ${env.groq.apiKey}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return aiResponse.data.choices[0].message.content.trim();
}

module.exports = llmUtility;