import { readFile, writeFile } from "node:fs/promises";
const c = JSON.parse(await readFile("src/shared/ui/ui-catalog.json", "utf8"));
const ko = JSON.parse(
  await readFile("src/shared/i18n/locales/ko.json", "utf8"),
);
const body =
  `# UI 컴포넌트 기준\n\n정본: src/shared/ui/ui-catalog.json. 이 문서는 npm run ui:docs로 생성한다. 수동으로 표를 수정하지 않는다.\n\n한국어가 기본이다. 영어 이름과 공통 상태 문구는 준비했지만 전체 앱 번역은 완료되지 않았으므로 언어 선택기는 아직 제공하지 않는다. 안정적인 ID를 코드·QA·협업에 사용한다.\n\n재생 조작 영역은 재생바와 구간 조작판으로 구성한다. 재생바에는 마커·곡 위치, 재생 조작, 주변 마디 반복을 두고, 구간 조작판에는 섹션 바로가기와 반복 구간을 둔다. 도움말에서는 공통 명칭을 각 영역의 테두리 위에 표시하고, 버튼을 선택하면 영역 이름을 숨겨 버튼 이름과 설명 하나를 표시한다. 빈 곳을 선택하면 영역 이름으로 돌아간다. 하위 영역은 일반 group이며 toolbar 전용 방향키 동작을 암시하지 않는다. 버튼은 Tab과 Enter/Space, 대화상자는 Escape와 브라우저 기본 모달 포커스를 사용한다. 동적 재생·전체화면 상태는 상태 소유 코드에서 공통 문구를 호출한다.\n\n| ID | 협업 이름 | 접근성 이름 | English | 상위 ID |\n|---|---|---|---|---|\n` +
  c.components
    .map(
      (x) =>
        `| ${x.id} | ${ko[x.name.ko]} | ${ko[x.accessible.ko]} | ${x.name.en} | ${x.parent || "—"} |`,
    )
    .join("\n") +
  "\n";
if (process.argv.includes("--check")) {
  if ((await readFile("docs/product/UI-COMPONENTS.md", "utf8")) !== body)
    throw Error("UI documentation is stale");
} else await writeFile("docs/product/UI-COMPONENTS.md", body);
