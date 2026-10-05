import { Creator, FundBand, Hero, MoneySteps, Newsletter, Shirts, TwoSides } from "@/components/sections/HomeSections";
import { getFundStats, getProducts } from "@/lib/data";
import { getT } from "@/lib/i18n/server";

export default async function HomePage() {
  const { t, locale } = await getT();
  const [stats, products] = await Promise.all([getFundStats(), getProducts()]);

  return (
    <>
      <Hero t={t} stats={stats} />
      <TwoSides t={t} />
      <Shirts t={t} products={products.slice(0, 3)} locale={locale} />
      <FundBand t={t} stats={stats} />
      <MoneySteps t={t} />
      <Creator t={t} />
      <Newsletter t={t} />
    </>
  );
}
