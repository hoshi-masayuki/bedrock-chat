"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";

export default function Result() {
  const [isPending, startTransition] = useTransition();
  const [botChat, setBotChat] = useState("")

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([botChat], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "result.txt";
    document.body.appendChild(element); // 必要に応じて追加
    element.click();
  };

  // マウント時に自動で fetch を送信する
  useEffect(() => {
    let storageText = localStorage.getItem("chats");
    const demographicData = localStorage.getItem("interviewData")
    let _prompt = `${storageText} ${demographicData}を基にお客様がその沿線に何を求めているのか深層心理を箇条書きで分析してください。
    やりとりの内容をまとめるのではなく、やりとりから読み取れる・類推できる要素を抽出してください。課題がある場合は、その課題に対して、どのように行動するかを推測してください。
    お客様が自己分析を確認する画面になっているのでお客様に伝えるような方を取ってください。
    `;
    
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
      <header className="text-center py-4">
        <h1 className="text-4xl font-bold">レポート結果</h1>
      </header>
      <main className="flex flex-col flex-nowrap content-center min-h-[93vh]">
        <div className="mt-8">
          {botChat &&
            <div className="flex flex-nowrap">
              <div className="flex justify-center items-center w-[50px] h-[50px] rounded-full mr-[10px] bg-white">
                <Image src="/chatbot.png" alt="アイコン" width={30} height={30} />
              </div>
              <div className="w-[80%] mb-[30px] p-[15px] bg-white rounded-[10px] shadow-2xl">
                <pre className="whitespace-pre-wrap leading-relaxed">{botChat}</pre>
              </div>
            </div>
          }
          {isPending && botChat.length === 0 && 
            <div className="flex flex-nowrap">
              <div className="flex justify-center items-center w-[50px] h-[50px] rounded-full mr-[10px] bg-white">
                <Image src="/chatbot.png" alt="アイコン" width={30} height={30} />
              </div>
              <div className="w-[80%] mb-[30px] p-[15px] bg-white rounded-[10px] shadow-2xl">
                <p className="leading-relaxed">考え中...</p>
              </div>
            </div>
          }
        </div>
        {botChat.length >= 1 &&
          <div className="mt-10 p-5 pr-20 pl-20 rounded-lg mx-auto">
            <p>回答いただきありがとうございました。お名前を記載したディレクトリを作成後、ディレクトリ内にファイルのアップロードお願いいたします。</p>
            <p>個人名を明かしたくない場合は、何か固有の名前でのご対応お願いいたします。</p>
            <p className="mb-5">下記のボタンを押すとアップロード画面に遷移しますのでご協力お願いいたします。</p>
            <div className="w-48 h-15 leading-[30px] mx-auto p-2 text-center bg-blue-600 rounded-lg">
              <a onClick={downloadTxtFile} className="text-xl text-white" href="https://drive.google.com/drive/folders/13gOzglUEVEf9-WbsfjbNVUKRdNRGsDrS" target="_blank">送信画面へ</a>
            </div>
          </div>
        }
      </main>
    </>
  );
}
