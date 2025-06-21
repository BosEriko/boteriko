const axios = require('axios');

async function llmUtility(apiKey, personality, topic) {
    const aiResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model: 'openai/gpt-3.5-turbo',
            messages: [ { role: 'system', content: personality }, { role: 'user', content: topic }],
            max_tokens: 60,
        },
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return aiResponse.data.choices[0].message.content.trim();
}

module.exports = llmUtility;