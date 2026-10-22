import { landingFontVariables } from "./fonts";
import { landingVariants } from "./registry";
import { VariantSwitcher } from "./variant-switcher";

export async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { v } = await searchParams;
  const requested = Array.isArray(v) ? v[0] : v;
  const variant =
    landingVariants.find((candidate) => candidate.slug === requested) ?? landingVariants[0];
  const { Component } = variant;

  return (
    <div className={`${landingFontVariables} flex flex-1 flex-col`}>
      <Component />
      <VariantSwitcher
        options={landingVariants.map(({ slug, name }) => ({ slug, name }))}
        current={variant.slug}
      />
    </div>
  );
}
