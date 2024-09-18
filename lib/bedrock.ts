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
  沿線に住む人々の気持ちや暮らしに関心を持っています。
  よりリアルな内容を把握するために、ユーザーに対してチャットでインタビューを行います、鉄道沿線に住んでいるユーザーがなぜそこに住むことになった理由やその深層心理をつかむ取り組みをはじめることにしました。
  今回は、沿線に住む方々がなぜその場所を選んだのか、またその背景にある気持ちや考えをもっと知りたくて、インタビューしています。

  ## 条件
  相手の反応や、深層心理に到達する質問を100文字以内で作成してください。
  少しでも相手が質問に答えやすいような会話ベースの質問を作成してください。
  ラダリング法を用いて表面的な特徴からより抽象的な価値観までをつかんでください。
  類似する質問は繰り返し行わない。深堀する場合は、別の答えが得られるような内容で質問してください。
  前の質問と同じ答えになる質問は行わないでください。
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

