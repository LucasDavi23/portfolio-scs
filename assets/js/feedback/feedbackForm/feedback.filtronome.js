import filter from "leo-profanity";
import * as profs from "profanities"; // <- aqui o ajuste

// normalizador
const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// limpa e carrega dicionário base PT do leo
filter.clearList();
filter.loadDictionary("pt");

// adiciona extras do pacote 'profanities' (PT/pt-br)
const extras = profs["pt-br"] || profs.pt_br || profs.pt || []; // tenta várias chaves
filter.add(extras.map(norm));

export function nomeOk(nome) {
  return !filter.check(norm(nome));
}
