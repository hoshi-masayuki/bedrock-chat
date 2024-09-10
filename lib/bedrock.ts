import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  }
});

export const postMessageWithRiouteHandler = async (prompt: string) => {
  const systemText = `
  あなたは鉄道会社に勤める沿線への集客担当者です。
  最も沿線に住んでいる人と接点があり、その心理を把握しています。
  よりリアルな内容を把握するために、ユーザーに対してチャットでインタビューを行い、鉄道沿線に住んでいるユーザーがなぜそこに住むことになった理由やその深層心理をつかむ取り組みをはじめることにしました。

  相手の反応の見ながら、深層心理に到達する質問を100文字以内で作成してください。

  ## 条件
  インタビュー相手とは良好な関係でインタビューを終えることを必須とします。少しでも圧力がかかるようなコミュニケーションは控えてください。
 `
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2000,
    system: systemText,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  };
  const response = await bedrock.send(
    new InvokeModelWithResponseStreamCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      contentType: 'application/json',
      body: JSON.stringify(payload)
    })
  );
  return response;
}

