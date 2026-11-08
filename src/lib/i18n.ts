// 本项目 i18n 配置（与 astro.config.mjs 保持一致）
// 路由策略：prefix-other-locales —— 默认语种（en）无前缀，其余语种（es/ar）带前缀
export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "es", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// 将内部路径本地化为指定语种路径。
// en（默认语种）不加前缀；es/ar 加 /es、/ar 前缀。
// 若路径已带相应语种前缀则原样返回，避免重复。
export function localizePath(path: string, locale: string = DEFAULT_LOCALE): string {
  if (!path) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;

  // 已带语种前缀的路径直接返回（保留其自身语种，用于语言切换器）
  for (const loc of LOCALES) {
    if (loc === DEFAULT_LOCALE) continue;
    if (clean === `/${loc}` || clean.startsWith(`/${loc}/`)) return clean;
  }

  if (locale === DEFAULT_LOCALE) return clean;

  const trimmed = clean.replace(/\/+$/, "") || "";
  return trimmed ? `/${locale}${trimmed}` : `/${locale}/`;
}

// 从当前路径解析出语种前缀
export function localeFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/(es|ar)(?:\/|$)/);
  if (match && isLocale(match[1])) return match[1];
  return DEFAULT_LOCALE as Locale;
}