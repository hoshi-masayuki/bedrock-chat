"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import Image from "next/image";

export default function Home() {
  const [isPending, startTransition] = useTransition()
  const [prompt, setPrompt] = useState("")
  const [chats, setChats] = useState<{ type: "user" | "bot"; text: string }[]>([])
  const [sendCount, setSendCount] = useState(0) // 送信回数を管理
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [isFinishButtonEnabled, setIsFinishButtonEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("chats")
    if (savedChats) setChats(JSON.parse(savedChats))
  }, [])

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats))
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats])

  const onSend = async (e: any) => {
    e.preventDefault()
    
    // ユーザーが入力した項目（プロンプト）と型として持っているプロンプトを切り分け
    let userInput = e.target[0].value // ユーザーが入力した内容
    let _prompt = userInput // 初期プロンプト

    const targetValue = "質問は以上になりますお時間いただきありがとうございました";

    // 送信回数が1回目の場合、localStorageに保存
    if (sendCount === 0) {
      localStorage.setItem("station", userInput) // "station" キーに保存
    }

    // 送信内容を条件に応じて修正
    if (sendCount >= 0 && sendCount <= 4) {
      _prompt += "ユーザーの返答内容では、深層心理にはまだ不十分です。追加で質問してください。"
    } else if (sendCount >= 5 && sendCount <= 8) {
      // これまでにユーザーが入力した内容と、インタビューを終了させる条件
      _prompt += chats.filter(chat => chat.type === "user").map(chat => chat.text).join(" ") + `これまでのユーザーの返答をすべて考慮して以下のフォーマットに必要な情報がそろっていると判断した場合、「質問は以上になりますお時間いただきありがとうございました。」とお伝えしインタビューを終了してくださいインタビューを終了してください。不足している情報がある場合は、追加で質問してください。
      インタビュー結果で埋めるべき項目
      ・通勤・交通利便性：毎日の移動の快適さや時間短縮に対する価値観
      ・生活環境：緑地や静かな環境、近隣の施設（スーパー、病院、学校など）に対する重要度
      ・家族構成と生活の充実度：家族と過ごす時間や家庭内での役割に対する優先順位
      ・経済的な要因（価格・コストパフォーマンス）：住宅価格や家賃に対する予算の範囲と満足度
      ・安全性・治安：自分や家族の安心感や治安に対するこだわり
      ・地域コミュニティへの参加意識：地域のイベントや近隣の人々とのつながりに対する期待感
      ・将来の展望（子どもの成長や自分のライフプラン）：子どもが育つ環境や、長期的な生活設計における優先事項
      ・快適さ・生活の質：日々の生活でのストレス軽減や快適な住まいに対する考え
      ・趣味や余暇の過ごし方：周辺環境が趣味やリラックスできる時間にどう影響するか
      ・地域の発展性・将来性：住んでいるエリアの将来の発展や、資産価値に対する期待や不安
      ・なぜその駅を選んだか：ほかのどの駅でもない、その駅周辺を選んだ理由
      `
    } else if(sendCount === 9) {
      // 10回目になると会話を穴埋めが出来ていなくても会話を終了させる
      _prompt = "「質問は以上になりますお時間いただきありがとうございました。」とだけ送信してください 承知しましたなどの他の文言は一切不要です"
    }

    setChats((prev) => [...prev, { type: "user", text: userInput }]) // ユーザーの入力を追加
    setPrompt("")
    setSendCount(sendCount + 1) // 送信回数をカウント

    startTransition(async () => {
      const response = await fetch(`api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: _prompt }) // 修正したプロンプトを送信
      })
      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        try {
          let botResponse = ""
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              setChats((prev) => [...prev, { type: "bot", text: botResponse }]) // Botの返答を追加
              // レスポンスに特定の文言が含まれているか確認
              if (botResponse.includes(targetValue)) {
                setIsSubmitDisabled(true);
                setIsFinishButtonEnabled(false);
              }
              break
            }

            if (value) {
              const str = decoder.decode(value, { stream: true })
              const chunkSwitcher = (chunk: any) => {
                const chunk_type = chunk.type
                switch (chunk_type) {
                  case "message_start":
                    console.log(chunk["message"]["id"])
                    console.log(chunk["message"]["model"])
                    break
                  case "content_block_delta":
                    const currentText = chunk["delta"]["text"]
                    botResponse += currentText
                    if (chunk["delta"]["stop_reason"] === "max_tokens") {
                      return
                    }
                    break
                  case "message_delta":
                    if (chunk["delta"]["stop_reason"] === "end_turn") {
                      return
                    }
                    break
                  case "message_stop":
                    const metrics = chunk["amazon-bedrock-invocationMetrics"]
                    console.log(metrics)
                    break
                  default:
                    null
                }
              }
              if (str.includes("}{")) {
                const formatedParts = str.split('}{').map((part, index, array) => {
                  if (index === 0) {
                    return `${part}}`
                  } else if (index === array.length - 1) {
                    return `{${part}`
                  } else {
                    return `{${part}}`
                  }
                })

                const jsonList = formatedParts.map(part => JSON.parse(part))
                for (const obj of jsonList) {
                  chunkSwitcher(obj)
                }
              } else {
                chunkSwitcher(JSON.parse(str))
              }
            }
          }
        } finally {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
          reader.releaseLock()
        }
      }
    })
  }

  const onDeleteChats=  () => {
    localStorage.clear()
    setChats([])
    setSendCount(0)
  }

  const saveReport = () => {
    const url = "/result"
    location.href = url
  }

  return (
    <>
      <header className="text-center py-4">
        <h1 className="text-4xl font-bold">AI Deep Insights</h1>
        <p className="text-lg mt-2">※所要時間は20分~30分程度です。</p>
      </header>
      <main className="flex flex-col flex-nowrap justify-between min-h-[89.5vh]">
        <div className="chat">
          <div className="chatContents flex flex-nowrap">
            <div className="chatIcon flex justify-center items-center w-[50px] h-[50px] rounded-full mr-[10px] bg-white">
              <Image src="/chatbot.png" alt="アイコン" width={30} height={30} />
            </div>
            <div className="chatText w-[80%] mb-[30px] p-[10px] bg-white rounded-[10px]">
              <p>あなたは何故阪急電鉄の近くに住むことになったのでしょうか？また、住んでいる地域での思い出等あれば教えてください。</p>
            </div>
          </div>
          {chats.map((chat, index) => (
            <div
              key={index}
              className={`chatContents flex flex-nowrap ${
                  chat.type === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div className={`chatIcon flex justify-center items-center w-[50px] h-[50px] rounded-full bg-white ${
                chat.type === "user" ? "ml-[10px]" : "mr-[10px]"}`}
              >
                <Image
                  src={`/${chat.type === "user" ? "user" : "chatBot"}.png`}
                  alt="アイコン"
                  width={30}
                  height={30}
                />
              </div>
              <div className={`chatText w-[80%] mb-[30px] p-[10px] rounded-[10px] ${chat.type === "user" ? "bg-blue-100" : "bg-white"}`}>
                <p>{chat.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={chatEndRef} />
        <div className="message p-8 mt-4 mb-8">
          <form onSubmit={onSend} className="flex flex-wrap justify-center">
            <input
              placeholder="Type a message"
              className="w-[80%] p-3 mr-[5px] border border-gray-500 rounded-tl-md rounded-md"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" disabled={isSubmitDisabled} className={`sendIcon w-[10%] p-3 py-4 bg-green-500 text-white rounded-md ${isSubmitDisabled ? 'bg-green-200 cursor-not-allowed' : 'hover:bg-green-400'}`}>送信</button>
            <button type="button" onClick={onDeleteChats} className="w-[43%] p-3 py-4 mt-[10px] mr-[40px] bg-red-600 text-white rounded-md hover:bg-red-400">やり直し</button>
            <button type="button" onClick={saveReport} disabled={isFinishButtonEnabled} className={`w-[43%] p-3 py-4 mt-[10px] text-white rounded-md ${isFinishButtonEnabled ? 'bg-blue-200 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-500'}`}>レポートダウンロード</button>
          </form>
        </div>
      </main>
    </>
)
}
