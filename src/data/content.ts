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
  // { label: "Conferencia", href: "#conferencia" },
  // { label: "Expositores", href: "#expositores" },
  // { label: "Programa", href: "#programa" },
  { label: "Materiales", href: "#materiales" },
  // { label: `FAQ's`, href: '#faqs' },
  // { label: 'Sponsors', href: '#sponsors' },
  // { label: "Contacto", href: "#contacto" },
  // { label: "Equipo", href: "#equipo" },
  // { label: "Hoteles", href: "#hoteles" },
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
  phones: ["938 341 444 - Solo WhatsApp"],
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
    role: "Pastora",
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
];

export const teamMembers = [
  {
    name: "Ob. Rafael Alvino",
    role: "Supervisor Nacional",
    image: "/images/rafael-alvino.jpg",
  },
  {
    name: "Delfi Sánchez",
    role: "Pastora",
    image: "/images/delfi-alvino.webp",
  },
  {
    name: "Marlon Castillo",
    role: "Obispo",
    image: "/images/marlon.webp",
  },
  { name: "Nicky Villaflor", role: "Pastor", image: "/images/nicky.webp" },
  { name: "Gladys Trujillo", role: "Pastora", image: "/images/gladys.webp" },
  { name: "Ruth Horna", role: "Pastora", image: "/images/ruth.webp" },
  {
    name: "Scarlet Ramírez",
    role: "Pastora",
    image: "/images/scarlet_ramirez.jpg",
  },
  { name: "Betty Jara", role: "Pastora", image: "/images/betty.webp" },
  { name: "Sara Valderrama", role: "Pastora", image: "/images/sara.webp" },
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
        description: "Taller para padres de adolescentes",
        speaker: "Piscóloga Saida Segovia",
        time: "03:00 PM - 05:00 PM",
        location: "Aulas #1",
        image: "/images/saida-segovia.webp",
        type: "Talleres",
      },
      {
        title: "Ilusión que parece amor",
        description: "Taller para adolescentes",
        speaker: "Psicóloga Dayci Diana Blas Silva",
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
          "Menopausia informada: Decisiones estratégicas para tu salud y liderazgo",
        description: "Talleres para Pastoras y Líderes",
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
        title: "¿Quién soy yo cuando nadie me ve?",
        description: "Taller para adolescentes",
        speaker: "Psicóloga Saida Segovia",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #1",
        image: "/images/saida-segovia.webp",
        type: "Talleres",
      },
      {
        title: "Original y no copia",
        description: "Taller para Jóvenes",
        speaker: "Dra. Jhaneey Alvino Sánchez",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #3",
        image: "/images/jhaneey.webp",
        type: "Talleres",
      },
      {
        title: "Cuando la pasión se disfraza de amor",
        description: "Taller para Jóvenes",
        speaker: "Ps. Gladis Trujillo López",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #4",
        image: "/images/gladys.webp",
        type: "Talleres",
      },
      {
        title: "Cerca y a la vez lejos",
        description: "Talleres Generales",
        speaker: "Ps. Ruth Esther Horna Valverde",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #5",
        image: "/images/ruth.webp",
        type: "Talleres",
      },
      {
        title: "En que momento dejé de ser yo",
        description: "Talleres Generales",
        speaker: "Ps. Edith Saldaña Álvarez",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #6",
        image: "/images/edith.webp",
        type: "Talleres",
      },
      {
        title: "Heridas que aún hablan",
        description: "Talleres Generales",
        speaker: "Ps. Mariamne Alvino Sánchez",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #7",
        image: "/images/mariamne.webp",
        type: "Talleres",
      },
      {
        title: "Deja que Dios te incomode",
        description: "Talleres Generales",
        speaker: "Ps. Sara Edith Valderrama Velásquez",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #8",
        image: "/images/sara.webp",
        type: "Talleres",
      },
      {
        title: "Ve por más",
        description: "Talleres Generales",
        speaker: "Ps. Betty Jara Fernández",
        time: "02:30 PM - 04:00 PM",
        location: "Aula #9",
        image: "/images/betty.webp",
        type: "Talleres",
      },
      {
        title: "Liderazgo, legado y multiplicación",
        description: "Talleres para Pastoras y Líderes",
        speaker: "Delfi Sánchez & Scarlet Ramírez",
        time: "02:30 PM - 04:00 PM",
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
        title: "De la Esencia al Legado",
        description: "",
        speaker: "Obispo Rafael Alvino-",
        time: "10:45 - 11:45 AM",
        location: "Auditorio Principal",
        image: "/images/rafael-alvino.jpg",
        type: "Taller",
      },
      {
        title: "Deja el cántaro",
        description: "",
        speaker: "Ob. Marlon Castillo Estrada",
        time: "09:30 - 10:30 AM",
        location: "Auditorio Principal",
        image: "/images/marlon.webp",
        type: "Taller",
      },
    ],
  },
] as const;

export const scheduleInfo = {
  pdfUrl: "/programa-evento.pdf",
};

export const Hotels = [
  {
    name: "Hotel ANTARES",
    cost: "Aprox por noche: L-J: S/. 60, V-D: S/. 70",
    addres: "Av. Gerardo Unger 1685, Lima",
    phone: "998 998 190",
    googleMap: "https://maps.app.goo.gl/jnbAqBiqjssc7sTS7",
  },
  {
    name: "Hotel AGUA DULCE",
    cost: "Aprox por noche: L-J: S/. 50, V-D: S/. 60",
    addres: "San Martín de Porres 15102",
    phone: "904 088 963",
  },
  {
    name: "Hotel EL TURISTA",
    cost: "Aprox por noche: L-V: S/. 60, S-D: S/. 70",
    addres: "Av. Gerardo Unger, Los Olivos",
    phone: "927 681 427",
    googleMap: "https://maps.app.goo.gl/M3H6B8ZD6y5RiswGA",
  },
  {
    name: "Hotel JACEN CITY",
    cost: "Aprox por noche: L-V: S/. 50, S-D: S/. 60",
    addres: "Av. Gerardo Unger 1699, San Martín de Porres",
    phone: "927 681 427",
    googleMap: "https://maps.app.goo.gl/51zGDeyHsxxfDZQe6",
  },
  {
    name: "Hotel PRIM'S",
    cost: "Aprox por noche: L-V: S/. 60, S-D: S/. 70",
    addres: "Av. Tomás Valle 109, San Martín de Porres",
    phone: "942 459 035",
    googleMap: "https://maps.app.goo.gl/RYVRmayJeZNsdRn49",
  },
  {
    name: "Hotel LAS LUNAS",
    cost: "Aprox por noche: L-V: S/. 100, S-D: S/. 120",
    addres: "Jr. Enrique La Rosa 282, San Martín de Porres",
    phone: "908 519 718",
    googleMap: "https://maps.app.goo.gl/2nHdQmwcXbucxoig7",
  },
  {
    name: "Hotel HATENIA SUITE",
    cost: "Aprox por noche: L-V: S/. 50, S-D: S/. 60",
    addres: "Av. Eduardo Habich 108, San Martín de Porres",
    phone: "928 460 376",
    googleMap: "https://maps.app.goo.gl/zjCqhVfPhRjHM5ov6",
  },
  {
    name: "Hotel ATENIA",
    cost: "Aprox por noche: L-V: S/. 60, S-D: S/. 70",
    addres: "Av. Eduardo Habich 102, San Martín de Porres",
    phone: "-",
    googleMap: "https://maps.app.goo.gl/FzwLcMHuHBRnjXpf7",
  },
  {
    name: "Hotel STAR DE ORO",
    cost: "Aprox por noche: L-V: S/. 60, S-D: S/. 70",
    addres: "Av. Eduardo Habich 177, San Martín de Porres",
    phone: "926 274 742",
    googleMap: "https://maps.app.goo.gl/uohQEk21fKkh9BQP6",
  },
  {
    name: "Hotel GOLDEN LION",
    cost: "Aprox por noche: L-V: S/. 50, S-D: S/. 60",
    addres: "Av. Eduardo Habich 189, San Martín de Porres",
    phone: "-",
    googleMap: "https://maps.app.goo.gl/K17qiPAurShqVg387",
  },
  {
    name: "Hotel PRIVATE",
    cost: "Aprox por noche: L-V: S/. 100, S-D: S/. 120",
    addres: "Pedro Paulet 180, Frente al parque Cahuide, SMP",
    phone: "993 842 966",
    googleMap: "https://maps.app.goo.gl/zW2vj5EW6nfyPXY28",
  },
  {
    name: "Hotel GAVIOTAS",
    cost: "Aprox por noche: L-V: S/. 100, S-D: S/. 120",
    addres: "Pedro Paulet 122, Frente al parque Cahuide, SMP",
    phone: "935 847 392",
    googleMap: "https://maps.app.goo.gl/ThfvLjMapMpSD5Qy7",
  },
];
