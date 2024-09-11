"use client"

import { useState, useTransition, useEffect } from "react"

export default function Home() {
  const [isPending, startTransition] = useTransition()
  const [prompt, setPrompt] = useState("")
  const [chats, setChats] = useState<{ type: "user" | "bot"; text: string }[]>([])
  const [sendCount, setSendCount] = useState(0) // 送信回数を管理

  useEffect(() => {
    const savedChats = localStorage.getItem("chats")
    if (savedChats) setChats(JSON.parse(savedChats))
  }, [])

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats))
  }, [chats])

  const onSend = async (e: any) => {
    e.preventDefault()
    
    // ユーザーが入力した項目（プロンプト）と型として持っているプロンプトを切り分け
    let userInput = e.target[0].value // ユーザーが入力した内容
    let _prompt = userInput // 初期プロンプト

    const interviewTitle = "これまでのユーザーの返答をすべて考慮して以下のフォーマットに必要な情報を埋めるように質問してください。インタビュー結果で埋めるべき項目";
    const interviewFirstTerm = `      
      ・通勤・交通利便性：毎日の移動の快適さや時間短縮に対する価値観
      ・生活環境：緑地や静かな環境、近隣の施設（スーパー、病院、学校など）に対する重要度
      ・家族構成と生活の充実度：家族と過ごす時間や家庭内での役割に対する優先順位
      ・経済的な要因（価格・コストパフォーマンス）：住宅価格や家賃に対する予算の範囲と満足度
      ・安全性・治安：自分や家族の安心感や治安に対するこだわり
      ・地域コミュニティへの参加意識：地域のイベントや近隣の人々とのつながりに対する期待感`;
    const interviewNextTerm = `      
      ・将来の展望（子どもの成長や自分のライフプラン）：子どもが育つ環境や、長期的な生活設計における優先事項
      ・快適さ・生活の質：日々の生活でのストレス軽減や快適な住まいに対する考え
      ・趣味や余暇の過ごし方：周辺環境が趣味やリラックスできる時間にどう影響するか
      ・地域の発展性・将来性：住んでいるエリアの将来の発展や、資産価値に対する期待や不安
      ・なぜその駅を選んだか：ほかのどの駅でもない、その駅周辺を選んだ理由`;

    // 送信内容を条件に応じて修正
    // 最初ユーザーが回答したことを掘り下げていく
    if (sendCount >= 0 && sendCount <= 4) {
      _prompt += "ユーザーの返答内容では、深層心理にはまだ不十分です。追加で質問してください。"

    } else if (sendCount >= 5 && sendCount <= 8) {
      // これまでにユーザーが入力した内容と、インタビューを終了させる条件
      _prompt += chats.filter(chat => chat.type === "user").map(chat => chat.text).join(" ") + interviewTitle + interviewFirstTerm
    } else if(sendCount >= 9 && sendCount <= 15) {
      _prompt += chats.filter(chat => chat.type === "user").map(chat => chat.text).join(" ") + interviewTitle + interviewNextTerm
    } else if(sendCount >= 15 && sendCount <= 19) {
      _prompt += chats.filter(chat => chat.type === "user").map(chat => chat.text).join(" ") +
      `
      これまでのユーザーの返答をすべて考慮して以下のフォーマットに必要な情報が8割揃っていると判断した場合、インタビューを終了してください。
      ${interviewFirstTerm}${interviewNextTerm}`
    } else if(sendCount >= 20) {
      // 20回目になると会話を穴埋めが出来ていなくても会話を終了させる
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

  return (
    <div className="h-screen flex flex-col gap-4">
      <header className="p-4 grid place-items-center">
        <h1 className="text-2xl font-semibold">AI Deep Insights</h1>
      </header>
      <main className="flex-1 flex flex-col p-4">
        <div className="grid gap-4">
            <div className="flex flex-col items-start gap-1">
              <div className="flex flex-col max-w-[75%] rounded-lg p-4 bg-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <div className="font-medium bg-green-600 text-white px-2 py-1 rounded-full">AI Deep Insights</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap">あなたは何故阪急電鉄の近くに住むことになったのでしょうか？また、住んでいる地域での思い出等あれば教えてください。</div>
              </div>
            </div>
          {chats.map((chat, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                chat.type === "user" ? "items-end" : "items-start"
              } gap-1`}
            >
              <div className="flex flex-col max-w-[75%] rounded-lg p-4 bg-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`font-medium px-2 py-1 rounded-full ${
                      chat.type === "user"
                        ? "bg-slate-500 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {chat.type === "user" ? "あなた" : "AI Deep Insights"}
                  </div>
                </div>
                <div className="mt-2 whitespace-pre-wrap">{chat.text}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <div className="border-t p-4">
        <form className="flex gap-4" onSubmit={onSend}>
          <input
            placeholder="Type a message"
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-gray-400"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Send</button>
          <button type="button" onClick={onDeleteChats} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors">Delete</button>
        </form>
      </div>
    </div>
  )
}
