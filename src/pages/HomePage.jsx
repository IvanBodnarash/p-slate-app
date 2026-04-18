import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className="">
      <div></div>
      <h1>{t("welcome")} P.Slate</h1>
    </div>
  );
}
