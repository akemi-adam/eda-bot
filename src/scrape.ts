import * as cheerio from "cheerio";

export type ScrapeResult = {
  updatedAt: Date;
  updatedAtIso: string;
  lastUpdaterUser: string;
};

export async function scrapeSpiritPage(url: string): Promise<ScrapeResult> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!res.ok) {
    throw new Error(`Falha ao baixar página (${res.status})`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const latestActivity = $("#divAtividades .atividade").first();

  if (!latestActivity.length) {
    throw new Error("Nenhuma atividade encontrada em #divAtividades.");
  }

  const updatedAtIso = String(
    latestActivity.find("a.data").attr("title") ?? "",
  ).trim();

  if (!updatedAtIso) {
    throw new Error("Não encontrei o datetime da atividade mais recente.");
  }

  const updatedAt = new Date(updatedAtIso);

  if (Number.isNaN(updatedAt.getTime())) {
    throw new Error(`Datetime inválido: ${updatedAtIso}`);
  }

  const lastUpdaterUser = String(
    latestActivity.find("a[data-usuario]").first().attr("data-usuario") ?? "",
  ).trim();

  if (!lastUpdaterUser) {
    throw new Error("Não encontrei o usuário da atividade mais recente.");
  }

  return {
    updatedAt,
    updatedAtIso,
    lastUpdaterUser,
  };
}
