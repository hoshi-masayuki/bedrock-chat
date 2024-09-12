"use client"

import { useState} from "react"
type Gender = "女性" | "男性" | "未回答";
type AgeGroup =
  | "～19歳"
  | "20歳～24歳"
  | "25歳～29歳"
  | "30歳～34歳"
  | "35歳～39歳"
  | "40歳～49歳"
  | "50歳～59歳"
  | "60歳～";
type FamilyStructure = "独身" | "配偶者とふたり";
type Children = "未就学" | "小学生" | "中学生";
type IncomeGroup =
  | "200万円未満"
  | "200万円以上400万円未満"
  | "400万円以上600万円未満"
  | "600万円以上800万円未満"
  | "800万円以上1000万円未満"
  | "1000万円以上1200万円未満"
  | "1200万円以上1500万円未満"
  | "1500万円以上2000万円未満"
  | "2000万円以上"
  | "わからない"
  | "答えたくない";

export default function Home() {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyStructure | null>(
    null
  );
  const [selectedChildren, setSelectedChildren] = useState<Children | null>(
    null
  );
  const [selectedIncome, setSelectedIncome] = useState<IncomeGroup | null>(null);
  const [station, setStation] = useState<string>("");
   const [showIncomeDropdown, setShowIncomeDropdown] = useState<boolean>(false); // ドロップダウンの表示・非表示を管理


   const handleStartInterview = () => {
    const interviewData = {
      gender: selectedGender,
      age: selectedAge,
      familyStructure: selectedFamily,
      children: selectedChildren,
      income: selectedIncome,
      station: station,
    };

    // JSON 形式で localStorage に保存
    localStorage.setItem("interviewData", JSON.stringify(interviewData));

    const url = "/"
    location.href = url
  };

  return (
    <div className="h-screen flex flex-col gap-4">
      <header className="p-4 grid place-items-center">
        <h1 className="text-2xl font-semibold">AI Deep Insights</h1>
        <p className="text-center mb-4">はじめにあなたのことを教えてください</p>
      </header>
      
      <div className="mb-4">
        <label className="block font-semibold mb-2">性別</label>
        <div className="flex gap-2 flex-wrap">
          {["女性", "男性", "未回答"].map((gender) => (
            <button
              key={gender}
              className={`px-4 py-2 rounded-lg border ${
                selectedGender === gender
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setSelectedGender(gender as Gender)}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

       <div className="mb-4">
        <label className="block font-semibold mb-2">年齢</label>
        <div className="flex gap-2 flex-wrap">
          {[
            "10代",
            "20-25才",
            "26-30才",
            "31-35才",
            "36-39才",
            "40代",
            "50代",
            "60才以上",
          ].map((age) => (
            <button
              key={age}
              className={`px-4 py-2 rounded-lg border ${
                selectedAge === age ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setSelectedAge(age as AgeGroup)}
            >
              {age}
            </button>
          ))}
        </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">家族構成</label>
          <div className="flex gap-2">
            {["独身", "配偶者とふたり"].map((family) => (
              <button
                key={family}
                className={`px-4 py-2 rounded-lg border ${
                  selectedFamily === family
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setSelectedFamily(family as FamilyStructure)}
              >
                {family}
              </button>
            ))}
          </div>
        </div>

        {/* 子供の有無 */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">子供の有無</label>
          <div className="flex gap-2">
            {["未就学", "小学生", "中学生"].map((children) => (
              <button
                key={children}
                className={`px-4 py-2 rounded-lg border ${
                  selectedChildren === children
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setSelectedChildren(children as Children)}
              >
                {children}
              </button>
            ))}
          </div>
        </div>
         {/* 世帯年収 (ドロップダウン) */}
        <div className="mb-4 relative">
          <label className="block font-semibold mb-2">世帯年収</label>
          <button
            className="flex gap-2t px-4 py-2 rounded-lg border bg-gray-200"
            onClick={() => setShowIncomeDropdown(!showIncomeDropdown)}
          >
            {selectedIncome ? selectedIncome : "選択してください"}
          </button>
          {showIncomeDropdown && (
            <ul className="absolute left-0 w-full bg-white border mt-2 z-10 rounded-lg shadow-lg">
              {[
                "200万円未満",
                "200万円以上400万円未満",
                "400万円以上600万円未満",
                "600万円以上800万円未満",
                "800万円以上1000万円未満",
                "1000万円以上1200万円未満",
                "1200万円以上1500万円未満",
                "1500万円以上2000万円未満",
                "2000万円以上",
                "わからない",
                "答えたくない",
              ].map((income) => (
                <li
                  key={income}
                  className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                  onClick={() => {
                    setSelectedIncome(income as IncomeGroup);
                    setShowIncomeDropdown(false); // ドロップダウンを閉じる
                  }}
                >
                  {income}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">居住地の沿線</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="複数ある場合はよく使うものをひとつ記載"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          ※複数ある場合はよく使うものをひとつ記載
        </p>

        <button onClick={handleStartInterview} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          インタビュー開始
        </button>
    </div>
  )
}
