const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { main } = require('./chatAPI.js');
require('date-utils');
const crypto = require('crypto');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

const corsOptions = {
  origin: '*', // 全てのドメインを許可
};

app.use(cors(corsOptions));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/text/judge', async function (req, res) {
  let {
    API_KEY,
    model,
    messages,
    temperature,
    top_p,
    n,
    stream,
    stop,
    max_tokens,
    presence_penalty,
    frequency_penalty,
    logit_bias,
    user,
  } = req.body;
  //パラメーターの設定、undefinedの場合はデフォルト値を設定
  const date = new Date(); //現在時刻の取得
  const currentTime = date.toFormat('YYYY-MM-DD-THH24:MI:SS+9:00');
  try {
    if (API_KEY === '') {
      throw new Error(
        'CEA - W - 012 - 00005:必須パラメーターが設定されていません。'
      );
    }
    const strArr = [
      temperature || 1,
      top_p || 1,
      n || 1,
      max_tokens || Infinity,
      presence_penalty || 0,
      frequency_penalty || 0,
    ];
    const numArr = strArr.map((str) => parseFloat(str, 10));
    console.log(numArr);
    let parm = {
      API_KEY: API_KEY, //各種ぱらめーたーの設定、API＿KEY以外にはデフォルト値を設定
      model: model || 'gpt-3.5-turbo',
      messages: messages,
      temperature: numArr[0],
      top_p: numArr[1],
      n: numArr[2],
      stream: stream || false,
      stop: stop || null,
      max_tokens: numArr[3],
      presence_penalty: numArr[4],
      frequency_penalty: numArr[5],
      logit_bias: logit_bias || {},
      user: user || 'null',
    };
    console.log(parm);

    const resultArr = [];
    let json; //結果を返す用のJSONを作成
    let re;
    for (let i = 0; i < n; i++) {
      re = await main(parm); //n回ループ
      json = {
        tokens: {
          completion_tokens: re.tokens.completion_tokens,
          total_tokens: re.tokens.total_tokens,
        },
        result: re.result,
      };
      resultArr.push(json);
    }
    const responses = {
      trn_id: crypto.randomUUID(), //return　JSONの作成
      request: {
        prompt_tokens: re.tokens.prompt_tokens,
        parameters: parm,
      },
      responses: {
        trn_tms: currentTime,
        messages: resultArr,
      },
    };
    console.log(responses);
    res.json(responses);
  } catch (error) {
    console.log(error);
    //return　JSONの作成
    const json = {
      trn_id: crypto.randomUUID(),
      trn_tms: currentTime,
      error: error.message,
    };
    res.json(json);
  }
});
app.listen(3000, function () {
  console.log('app listening on port 3000!');
});
