import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

export default function HomePage() {
  const { lang = "en" } = useParams();
  const { t } = useTranslation();
  return (
    <div className="">
      <div></div>
      <h1>{t("welcome")} P.Slate</h1>
    </div>
  );
}
