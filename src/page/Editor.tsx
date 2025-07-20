import {
  Alias,
  Editor,
  useTemplate,
  replaceAliasesToRealValue,
  Preview,
} from "../components/Editor";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// 테스트
const FAKE_ALISAS_VALUE = {
  part: "개발팀",
  position: "팀장",
  name: "홍길동",
};

export default function EditorPage() {
  const { data: template, isLoading, error } = useTemplate("sample.html");
  const [data, setData] = useState<string | undefined>(template);
  const previewHTML = replaceAliasesToRealValue(data || "", FAKE_ALISAS_VALUE);

  if (error) {
    return <div>탬플릿을 불러오는 데 실패했습니다.</div>;
  }

  const handleSubmit = () => {
    console.log(previewHTML);
  };

  return (
    <div className="space-y-8">
      <Editor height="600px" setContents={template} onChange={setData} isLoading={isLoading}>
        <Alias
          alias={[
            { id: "part", value: "part", label: "부서명" },
            { id: "position", value: "position", label: "직급" },
            { id: "name", value: "name", label: "이름" },
          ]}
        />
      </Editor>
      <Button type="button" onClick={handleSubmit}>
        버튼
      </Button>

      <Preview results={previewHTML} />
    </div>
  );
}
