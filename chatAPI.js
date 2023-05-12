const { Configuration, OpenAIApi } = require('openai');
require('date-utils');

async function main(parm) {
  const configuration = new Configuration({
    apiKey: parm.API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createChatCompletion({
    model: `${parm.model}`,
    messages: [{ role: 'user', content: `${parm.messages}` }],
    temperature: parm.temperature,
    top_p: parm.top_p,  //top_pとtempどちらか一方のはずだった、、、
    n: parm.n,
    stream: parm.stream,
    stop: parm.stop,
    max_tokens: parm.max_tokens,
    presence_penalty: parm.presence_penalty,
    frequency_penalty: parm.frequency_penalty,
    logit_bias: parm.logit_bias,
    user: parm.user,
  });
  console.log(completion.status);
  return {
    result: completion.data.choices[0].message,
    tokens: completion.data.usage,
  };
}

module.exports = { main };
