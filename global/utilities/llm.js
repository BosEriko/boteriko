const axios = require('axios');
const env = require('@global/utilities/env');

async function llmUtility(personality, topic) {
    const aiResponse = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
            model: env.groq.model,
            messages: [
                { role: 'system', content: personality },
                { role: 'user', content: topic }
            ],
            max_tokens: 60,
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