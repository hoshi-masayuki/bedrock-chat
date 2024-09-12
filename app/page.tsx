"use client"

import { useState } from "react"
import SelectableButtonGroup from "./components/SelectableButtonGroup";
import Dropdown from "./components/Dropdown";
import { 
  Gender, 
  AgeGroup,
  FamilyStructure, 
  FamilySize,
  ChildrenSize, 
  ChildrenOld, 
  IncomeGroup, 
  YearsResidence 
} from "./types/UserType";

  export default function SelectValue() {
    const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
    const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
    const [selectedFamily, setSelectedFamily] = useState<FamilyStructure | null>(null);
    const [selectedFamilySize, setSelectedFamilySize] = useState<FamilySize | null>(null);
    const [selectedChildrenSize, setSelectedChildrenSize] = useState<ChildrenSize | null>(null);
    const [selectedChildrenOld, setSelectedChildrenOld] = useState<ChildrenOld | null>(null);
    const [selectedIncome, setSelectedIncome] = useState<IncomeGroup | null>(null);
    const [selectedYearsResidence, setSelectedYearsResidence] = useState<YearsResidence | null>(null);
    const [station, setStation] = useState<string>("");
  
    const handleStartInterview = () => {
      const interviewData = {
        gender: selectedGender,
        age: selectedAge,
        familyStructure: selectedFamily,
        childrenOld: selectedChildrenOld,
        ChildrenSize: selectedChildrenSize,
        income: selectedIncome,
        station: station,
        familySize: selectedFamilySize,
        yearsResidence: selectedYearsResidence,
      };
  
      localStorage.setItem("interviewData", JSON.stringify(interviewData));
      location.href = "/chat";
    };
  
    return (
    <>
      <div className="flex flex-col flex-nowrap justify-between min-h-[89.5vh]">
        <header className="p-4 grid place-items-center">
          <h1 className="text-2xl font-semibold">AI Deep Insights</h1>
          <p className="text-center mb-4">はじめにあなたのことを教えてください※全ての項目を選択してください</p>
        </header>
  
        <SelectableButtonGroup
          label="性別"
          options={["女性", "男性", "未回答"]}
          selectedOption={selectedGender}
          setSelectedOption={setSelectedGender}
        />
  
        <SelectableButtonGroup
          label="年齢"
          options={[
            "～19歳", 
            "20歳～24歳", 
            "25歳～29歳",
            "30歳～34歳",
            "35歳～39歳", 
            "40歳～49歳", 
            "50歳～59歳",
            "60歳～",
          ]}
          selectedOption={selectedAge}
          setSelectedOption={setSelectedAge}
        />

        <SelectableButtonGroup
          label="家族構成"
          options={["未婚", "既婚"]}
          selectedOption={selectedFamily}
          setSelectedOption={setSelectedFamily}
        />

        <SelectableButtonGroup
          label="同居している家族の人数"
          options={[
             "1人（一人暮らし）" ,
             "2人",
             "3人",
             "4人",
             "5人以上",
          ]}
          selectedOption={selectedFamilySize}
          setSelectedOption={setSelectedFamilySize}
        />

        <SelectableButtonGroup
          label="同居している家族には、あなたのお子様（息子さんや娘さん）がいらっしゃいますか。"
          options={[  
             "いない",
             "1人いる" ,
             "2人いる",
             "3人以上いる",
          ]}
          selectedOption={selectedChildrenSize}
          setSelectedOption={setSelectedChildrenSize}
        />

        <SelectableButtonGroup
          label="同居している家族には、あなたのお子様（息子さんや娘さん）がいらっしゃいますか。"
          options={[
             "なし" ,
             "未就学", 
             "小学生", 
             "中学生" ,
             "高校生" ,
             "大学生",
             "社会人",
          ]}
          selectedOption={selectedChildrenOld}
          setSelectedOption={setSelectedChildrenOld}
        />
  
        {/* 他のセクションも同様にコンポーネントを適用 */}
  
        <Dropdown
          label="世帯年収"
          options={[
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
          ]}
          selectedOption={selectedIncome}
          setSelectedOption={setSelectedIncome}
        />

        <SelectableButtonGroup
          label="今の最寄りの駅での居住年数を教えてください。"
          options={[
             "1年未満",
             "1年～5年",
             "6年～10年",
             "11年～20年",
             "20年以上",
          ]}
          selectedOption={selectedYearsResidence}
          setSelectedOption={setSelectedYearsResidence}
        />
        {/* 駅情報入力部分 */}
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
      </div>
      <div className="flex flex-col items-center justify-center ">
        <button onClick={handleStartInterview} className="px-4 py-3 mb-3 bg-blue-700 hover:bg-blue-500 text-white rounded-lg">
          インタビュー開始
        </button>
      </div>
    </>
    );
  }
  
