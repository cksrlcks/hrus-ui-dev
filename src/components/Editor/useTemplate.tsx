import { useEffect, useState } from "react";

export function useTemplate(filename: string) {
  const [data, setData] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!filename) return;

    const fetchTemplate = async () => {
      setIsLoading(true);
      setError(null);
      setData(undefined);

      try {
        const res = await fetch(`/template/${filename}`);
        if (!res.ok) throw new Error("템플릿 로드 실패");

        const html = await res.text();
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 테스트용 딜레이
        setData(html);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("알 수 없는 오류"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [filename]);

  return { data, isLoading, error };
}
