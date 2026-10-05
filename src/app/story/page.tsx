import type { Metadata } from "next";
import { Creator, MoneySteps, Newsletter, TwoSides } from "@/components/sections/HomeSections";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Our Story" };

// "Our Story" has no dedicated Figma frame, so it is composed from the Home sections.
export default async function StoryPage() {
  const { t } = await getT();
  return (
    <>
      <Creator t={t} showButton={false} />
      <TwoSides t={t} />
      <MoneySteps t={t} />
      <Newsletter t={t} />
    </>
  );
}
