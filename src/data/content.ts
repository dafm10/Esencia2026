import {
  FaBehance,
  FaFacebookF,
  FaLinkedin,
  FaMapMarkerAlt,
  FaMicrophoneAlt,
  FaRegCalendarCheck,
  FaTwitter,
} from "react-icons/fa";
import { FaMoneyBill1Wave } from "react-icons/fa6";

export const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Conferencia", href: "#conferencia" },
  { label: "Expositores", href: "#expositores" },
  { label: "Programa", href: "#programa" },
  // { label: `FAQ's`, href: '#faqs' },
  // { label: 'Sponsors', href: '#sponsors' },
  { label: "Contacto", href: "#contacto" },
] as const;

export const stats = [
  {
    icon: FaMapMarkerAlt,
    value: "Colegio Mercedes Cabello",
    label: "RIMAC, Lima",
  },
  { icon: FaRegCalendarCheck, value: "15 - 17 Oct", label: "2026" },
  { icon: FaMicrophoneAlt, value: "13", label: "EXPOSITORES" },
  { icon: FaMoneyBill1Wave, value: "S/. 80", label: "OFRENDA" },
] as const;

export const contactInfo = {
  address: {
    line1: "Coleg. Emb. Mercedes Cabello de Carbonera",
    line2: "Av. Tupac Amaru, Rimac 15094",
  },
  phones: ["(01) 907 6174"],
  emails: ["esencia.cogop@gmail.com"],
  mapQuery: "XXF3+FGH, Lima",
  mapUrl: "https://maps.app.goo.gl/6q7EriFsNrRES9Uv8",
  social: [
    { icon: FaFacebookF, href: "https://www.facebook.com/cogopperuoficial" },
  ],
};

export const eventInfo = {
  tag: "Congreso Nacional",
  name: "Esencia",
  subname: "DE LA IDENTIDAD AL PROPÓSITO",
  year: "2026",
};

export const speakers = [
  {
    name: "Ob. Rafael Alvino",
    role: "Supervisor Nacional",
    image: "/images/rafael-alvino.jpg",
  },
  {
    name: "Delfi Sánchez Ríos",
    role: "Pastora",
    image: "/images/delfi-alvino.webp",
  },
  {
    name: "Marlon Castillo",
    role: "Obispo y Pastor",
    image: "/images/marlon.webp",
  },
  {
    name: "Edith Saldaña Álvarez",
    role: "Pastora",
    image: "/images/edith.webp",
  },
  {
    name: "Gladys Trujillo",
    role: "Pastora",
    image: "/images/gladys.webp",
  },
  {
    name: "Maria Scarlet Ramirez Bouby",
    role: "Pastora IDP San Miguel",
    image: "/images/scarlet_ramirez.jpg",
  },
  {
    name: "Dayci Diana Blas Silva",
    role: "Licenciada en Psicología",
    image: "/images/dayci.webp",
  },
  {
    name: "Saida Segovia Mallea",
    role: "Licenciada en Psicología",
    image: "/images/saida-segovia.webp",
  },
  {
    name: "Mariamne Alvino Sánchez",
    role: "Pastora",
    image: "/images/mariamne.webp",
  },
  {
    name: "Jhaneey Alvino Sánchez",
    role: "Doctora",
    image: "/images/jhaneey.webp",
  },
  {
    name: "Ruth Esther Horna Valverde",
    role: "Pastora",
    image: "/images/ruth.webp",
  },
  {
    name: "Betty Jara Fernández",
    role: "Pastora",
    image: "/images/betty.webp",
  },
  {
    name: "Sara Valderrama Velásquez",
    role: "Pastora",
    image: "/images/sara.webp",
  },
] as const;

export const sectionIntros = {
  speakers: {
    title: "Nuestros Expositores",
    description:
      "Voces con palabra, experiencia y conocimiento, listas para fortalecer tu identidad y propósito",
  },
  schedule: {
    title: "Plenarias y Talleres",
    description:
      "Alista cuaderno y lapicero y prepara tu corazón para estos tiempos especial de alimento espiritual",
  },
};

export const socialIcons = [
  { icon: FaFacebookF, href: "#" },
  { icon: FaTwitter, href: "#" },
  { icon: FaBehance, href: "#" },
  { icon: FaLinkedin, href: "#" },
];

export const scheduleDays = [
  {
    id: "dia1",
    label: "Día 01",
    subLabel: "Jueves",
    sessions: [
      {
        title: "Hijos de cristal, Padres de algodón",
        description: "",
        speaker: "Ob. Rafael Alvino Vargas",
        time: "10:45 - 11:45 AM",
        location: "Auditorio Principal",
        image: "/images/rafael-alvino.jpg",
        type: "Plenaria",
      },
      {
        title: "Pensamientos cautivos, Corazones libres",
        description: "",
        speaker: "Ps. Edith Saldaña de Ascate",
        time: "09:30 - 10:30 AM",
        location: "Auditorio Principal",
        image: "/images/edith.webp",
        type: "Plenaria",
      },
      {
        title: "Lo que tu hijo calla, pero su corazón y su celular revelan",
        description:
          "Taller para adolescentes, padres y líderes de adolescentes",
        speaker: "Saida Segovia",
        time: "03:00 PM - 05:00 PM",
        location: "Aulas #1",
        image: "/images/saida-segovia.webp",
        type: "Talleres",
      },
      {
        title: "Ilusión que parece amor",
        description:
          "Taller para adolescentes, padres y líderes de adolescentes",
        speaker: "Psicól. Dayci Diana Blas Silva",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #2",
        image: "/images/dayci.webp",
        type: "Talleres",
      },
      {
        title: "Original y no copia",
        description: "Taller para Jóvenes",
        speaker: "Dra. Jhaneey Alvino Sánchez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #3",
        image: "/images/jhaneey.webp",
        type: "Talleres",
      },
      {
        title: "Cuando la pasión se disfraza de amor",
        description: "Taller para Jóvenes",
        speaker: "Ps. Gladis Trujillo López",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #4",
        image: "/images/gladys.webp",
        type: "Talleres",
      },
      {
        title: "Cerca y a la vez lejos",
        description: "Talleres Generales",
        speaker: "Ps. Ruth Esther Horna Valverde",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #5",
        image: "/images/ruth.webp",
        type: "Talleres",
      },
      {
        title: "En que momento dejé de ser yo",
        description: "Talleres Generales",
        speaker: "Ps. Edith Saldaña Álvarez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #6",
        image: "/images/edith.webp",
        type: "Talleres",
      },
      {
        title: "Heridas que aún hablan",
        description: "Talleres Generales",
        speaker: "Ps. Mariamne Alvino Sánchez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #7",
        image: "/images/mariamne.webp",
        type: "Talleres",
      },
      {
        title: "Deja que Dios te incomode",
        description: "Talleres Generales",
        speaker: "Ps. Sara Edith Valderrama Velásquez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #8",
        image: "/images/sara.webp",
        type: "Talleres",
      },
      {
        title: "Ve por más",
        description: "Talleres Generales",
        speaker: "Ps. Betty Jara Fernández",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #9",
        image: "/images/betty.webp",
        type: "Talleres",
      },
      {
        title:
          "Menopausia informada: Decisiones estratégicas para tu salud y liderzago",
        description: "Talleres Generales",
        speaker: "Delfi Sánchez & Scarlet Ramírez",
        time: "03:00 PM - 05:00 PM",
        location: "Auditorio General",
        image: "/images/delfi-alvino.webp",
        type: "Talleres",
      },
    ],
  },
  {
    id: "dia2",
    label: "Día 02",
    subLabel: "Viernes",
    sessions: [
      {
        title: "Volviendo al Diseño Original",
        description: "",
        speaker: "Ps. Scarlet Ramírez Bouby",
        time: "09:30 - 10:30 AM",
        location: "Auditorio Principal",
        image: "/images/scarlet_ramirez.jpg",
        type: "Plenaria",
      },
      {
        title: "De Tumbas a Jardines",
        description: "",
        speaker: "Ps. Gladis Trujillo López",
        time: "10:45 - 11:45 AM",
        location: "Auditorio Principal",
        image: "/images/gladys.webp",
        type: "Plenaria",
      },
      {
        title: "Lo que tu hijo calla, pero su corazón y su celular revelan",
        description:
          "Taller para adolescentes, padres y líderes de adolescentes",
        speaker: "Saida Segovia",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #1",
        image: "/images/saida-segovia.webp",
        type: "Talleres",
      },
      {
        title: "Ilusión que parece amor",
        description:
          "Taller para adolescentes, padres y líderes de adolescentes",
        speaker: "Psicól. Dayci Diana Blas Silva",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #2",
        image: "/images/dayci.webp",
        type: "Talleres",
      },
      {
        title: "Original y no copia",
        description: "Taller para Jóvenes",
        speaker: "Dra. Jhaneey Alvino Sánchez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #3",
        image: "/images/jhaneey.webp",
        type: "Talleres",
      },
      {
        title: "Cuando la pasión se disfraza de amor",
        description: "Taller para Jóvenes",
        speaker: "Ps. Gladis Trujillo López",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #4",
        image: "/images/gladys.webp",
        type: "Talleres",
      },
      {
        title: "Cerca y a la vez lejos",
        description: "Talleres Generales",
        speaker: "Ps. Ruth Esther Horna Valverde",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #5",
        image: "/images/ruth.webp",
        type: "Talleres",
      },
      {
        title: "En que momento dejé de ser yo",
        description: "Talleres Generales",
        speaker: "Ps. Edith Saldaña Álvarez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #6",
        image: "/images/edith.webp",
        type: "Talleres",
      },
      {
        title: "Heridas que aún hablan",
        description: "Talleres Generales",
        speaker: "Ps. Mariamne Alvino Sánchez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #7",
        image: "/images/mariamne.webp",
        type: "Talleres",
      },
      {
        title: "Deja que Dios te incomode",
        description: "Talleres Generales",
        speaker: "Ps. Sara Edith Valderrama Velásquez",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #8",
        image: "/images/sara.webp",
        type: "Talleres",
      },
      {
        title: "Ve por más",
        description: "Talleres Generales",
        speaker: "Ps. Betty Jara Fernández",
        time: "03:00 PM - 05:00 PM",
        location: "Aula #9",
        image: "/images/betty.webp",
        type: "Talleres",
      },
      {
        title: "Liderazgo, legado y multiplicación",
        description: "Talleres Generales",
        speaker: "Delfi Sánchez & Scarlet Ramírez",
        time: "03:00 PM - 05:00 PM",
        location: "Auditorio General",
        image: "/images/delfi-alvino.webp",
        type: "Talleres",
      },
    ],
  },
  {
    id: "dia3",
    label: "Día 03",
    subLabel: "Sábado",
    sessions: [
      {
        title: "Fuiste llamada, no improvisada",
        description: "",
        speaker: "Ob. Marlon Castillo Estrada",
        time: "09:30 - 10:30 AM",
        location: "Auditorio Principal",
        image: "/images/marlon.webp",
        type: "Taller",
      },
      {
        title: "Plenaria Final",
        description: "",
        speaker: "-",
        time: "10:45 - 11:45 AM",
        location: "Auditorio Principal",
        image: "/images/speaker-4.jpg",
        type: "Taller",
      },
      {
        title: "Mujeres de legado: Honrando una vida de fidelidad",
        description: "",
        speaker: "-",
        time: "11:45 AM - 12:10 PM",
        location: "Auditorio Principal",
        image: "/images/speaker-4.jpg",
        type: "Especial",
      },
    ],
  },
] as const;

export const scheduleInfo = {
  pdfUrl: "/programa-evento.pdf",
};
