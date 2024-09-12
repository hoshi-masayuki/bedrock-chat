"use client";

import { useState, useTransition, useEffect } from "react";

export default function Result() {
  const [isPending, startTransition] = useTransition();
  const [botChat, setBotChat] = useState("")

  // マウント時に自動で fetch を送信する
  useEffect(() => {
    let storageText = localStorage.getItem("chats");
    let _prompt = `${storageText} を基にユーザーが沿線に何を求めているのかまとめてください`;

    startTransition(async () => {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: _prompt }), // 自動送信するプロンプト
      });

      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              break
            }

            if (value) {
              const str = decoder.decode(value, { stream: true })
              const chunkSwitcher = (chunk: any) => { 
              const chunk_type = chunk.type;
              switch (chunk_type) {
                case "message_start":
                  console.log(chunk["message"]["id"]);
                  console.log(chunk["message"]["model"]);
                  break;
                case "content_block_delta":
                  const currentText = chunk["delta"]["text"]
                  setBotChat(prev => prev + currentText)
                  if (chunk["delta"]["stop_reason"] === "max_tokens") {
                    return
                  }
                  break;
                case "message_delta":
                  if (chunk["delta"]["stop_reason"] === "end_turn") {
                    return
                  }
                  break;
                case "message_stop":
                  const metrics = chunk["amazon-bedrock-invocationMetrics"];
                  console.log(metrics);
                  break;
                default:
                  null
                }
              }
              if (str.includes("}{")) {
                  const formatedParts = str.split('}{').map((part, index, array) => {
                    if (index === 0) {
                      // 最初の要素の場合、末尾に'}'を追加
                      return `${part}}`;
                    } else if (index === array.length - 1) {
                      // 最後の要素の場合、先頭に'{'を追加
                      return `{${part}`;
                    } else {
                      // それ以外の要素の場合、先頭と末尾にそれぞれ'{'と'}'を追加
                      return `{${part}}`;
                    }
                  });

                  const jsonList = formatedParts.map(part => JSON.parse(part));
                  for (const obj of jsonList) {
                    chunkSwitcher(obj);
                  }
                } else {
                  chunkSwitcher(JSON.parse(str));
                }
            }
          }
        } finally {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          reader.releaseLock()
        }
      }
    });
  }, []);

  return (
    <>
      <div className="flex flex-col flex-nowrap justify-between min-h-[89.5vh]">
        <header className="p-4 grid place-items-center">
          <h1 className="text-2xl font-semibold">レポート結果</h1>
        </header>
        <main className="flex-1 flex flex-col p-4">
        <div className="flex flex-col items-start gap-1">
                <div className="flex flex-col max-w-[75%] rounded-lg p-4 bg-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">インタビューの回答いただきありがとうございました以下のフォルダーに出力結果をお名前と併せてご記入ください
                  <div className="text-green-600 px-2 py-1 rounded-full">
                      <a href="https://www.google.com/" target="_blank">ここをクリックするとフォルダーに遷移します</a>
                    </div>
                  </div>
                </div>
              </div>
          <div className="grid gap-4">
            {botChat &&
              <div className="flex flex-col items-start gap-1">
                <div className="flex flex-col max-w-[75%] rounded-lg p-4 bg-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="font-medium bg-green-600 text-white px-2 py-1 rounded-full">Bed Rock Chat</div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">{botChat}</div>
                </div>
              </div>
            }
            {isPending && botChat.length === 0 && <div className="flex flex-col items-start gap-1">
              <div className="flex flex-col max-w-[75%] rounded-lg p-4 bg-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <div className="font-medium">Bed Rock</div>
                </div>
                <div className="mt-2">考え中...</div>
              </div>
            </div>}
          </div>
        </main>
      </div>
    </>
  );
}
