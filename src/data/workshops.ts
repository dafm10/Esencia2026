export type Workshop = {
  id: string;
  name: string;
  nameDay1?: string;
  nameDay2?: string;
  limit: number | null; // null means unlimited
  category: string;
};

export const workshops: Workshop[] = [
  {
    id: "taller-1",
    category: "ADOLESCENTES",
    name:
      "1.- Lo que tu hijo calla, pero su corazón y su celular revelan / Saida",
    limit: 40,
  },
  {
    id: "taller-2",
    category: "ADOLESCENTES",
    name: "2.- Ilusión que parece amor / Dayci",
    limit: 40,
  },
  {
    id: "taller-3",
    category: "JÓVENES",
    name: "3.- Original y no copia / Jhaneey Alvino",
    limit: 40,
  },
  {
    id: "taller-4",
    category: "JÓVENES",
    name: "4.- Cuando la pasión se disfraza de amor / Gladys",
    limit: 40,
  },
  {
    id: "taller-5",
    category: "GENERAL",
    name: "5.- Cerca y a la vez lejos / Ruth",
    limit: 40,
  },
  {
    id: "taller-6",
    category: "GENERAL",
    name: "6.- En que momento dejé de ser Yo / Edith",
    limit: 40,
  },
  {
    id: "taller-7",
    category: "GENERAL",
    name: "7.- Heridas que aún hablan / Marianne",
    limit: 40,
  },
  {
    id: "taller-8",
    category: "GENERAL",
    name: "8.- Deja que Dios te incomode / Sara",
    limit: 40,
  },
  {
    id: "taller-9",
    category: "GENERAL",
    name: "9.- Ve por más / Betty",
    limit: 40,
  },
  {
    id: "taller-10",
    category: "GENERAL",
    name: "10.- Taller 10 (Menopausia / Liderazgo)",
    nameDay1: "10.- Menopausia informada: Decisiones estratégicas para tu salud y liderazgo",
    nameDay2: "10.- Liderazgo, legado y multiplicación",
    limit: null,
  },
];
