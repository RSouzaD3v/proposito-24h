export interface ReaderProfile {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "WRITER_ADMIN" | "CLIENT";
  createdAt: string;
  freePlan: boolean;
  writerId: string | null;
  writer: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    titleApp: string | null;
    titleHeader: string | null;
  } | null;
}

export interface HomeCard {
  id: string;
  title?: string;
  nameAuthor?: string;
  reference?: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  locked: boolean;
  completed: boolean;
}

export interface ReaderHome {
  day: string;
  writer: ReaderProfile["writer"];
  colors: {
    primary: string;
    secondary: string;
    background: string;
    buttonBg: string;
    buttonText: string;
    text: string;
    independenteColor1: string;
    independenteColor2: string;
  };
  devotional: HomeCard | null;
  prayer: HomeCard | null;
  quote: HomeCard | null;
  verse: HomeCard | null;
}

export interface LibraryBook {
  id: string;
  title: string;
  coverUrl: string | null;
  visibility: string;
  category: string | null;
  slug: string;
}

export interface LastRead {
  publicationId: string;
  currentChapter: number;
  lastReadAt: string;
}

export interface SectionProgress {
  pct: number;
  finished: boolean;
  finishedByMarkers: boolean;
}

export interface BibleProgress {
  overall: number;
  oldTestament: number;
  newTestament: number;
  sections: Record<string, SectionProgress>;
}
