
export interface ArchiveDocument {
    id: string;
    title: string;
    content: string;
    category: string;
}

export const CASE_ARCHIVE: ArchiveDocument[] = [
    {
        id: "DOC-01",
        title: "Samordnad Juridisk Analys - Ärendekomplex Ali Habibpoor",
        category: "Huvuddokument",
        content: `Ärendekomplex: Ali Habibpoor mot Svenska Staten. 
        Klagande: Ali Habibpoor (860918-5676).
        Problemställning: En sammanlänkad skadekedja bestående av vårdskada (CRPS), felaktig SGI-nollställning från Försäkringskassan och avslag på nödbistånd från Socialtjänsten Falun.
        Kausalitetskedja: Vårdskada (2023-09-05) -> CRPS -> Arbetsoförmåga -> FK-avslag -> Inkomststopp -> Hyresskulder -> Avhysningshot (KFM 14-93160-25).
        Ansvariga hos FK: Maria Danielson, Tuire Frideland, Kenan Bektic. 
        Ansvarig hos ST: Carina Larsson.`
    },
    {
        id: "DOC-02",
        title: "Patientskadeanmälan till Löf",
        category: "Försäkringsrätt",
        content: `Skadedatum: 2023-09-05 vid Falu lasarett.
        Diagnos: CRPS typ I (G90.5). 
        Händelse: Nervskada vid Popliteal blockad under fotoperation. 
        Bevis: Neurografi/EMG 2025-03-21 bekräftar nervskada exakt vid blockadplatsen. 
        Specialistutlåtande: Överläkare Kristbjörg Sigurdardottir bekräftar sambandet.`
    },
    {
        id: "DOC-03",
        title: "Skadeståndsanspråk mot Staten (JK)",
        category: "Skadeståndsrätt",
        content: `Grund: Skadeståndslagen 3 kap. 2 §. 
        Fel vid myndighetsutövning: FK brast i utredningsskyldighet (FL 23 §) genom att fatta beslut före objektiv medicinsk bevisning fanns tillgänglig. 
        Skadebelopp: 795 000 SEK (inkl. utebliven sjukpenning och kreditkostnader). 
        Inkomstförlust: 14 månader á 45 000 SEK.`
    },
    {
        id: "DOC-04",
        title: "Polisanmälan om Tjänstefel",
        category: "Straffrätt",
        content: `Misstänkt brott: Tjänstefel (BrB 20 kap. 1 §). 
        Misstänkta: Maria Danielson, Tuire Frideland, Kenan Bektic (FK) samt Carina Larsson (ST). 
        Gärning: Grov oaktsamhet vid myndighetsutövning genom att ignorera kritiska läkarintyg och använda felaktiga tillgångsvärderingar (bil värderad till 700k istället för 342k).`
    },
    {
        id: "DOC-05",
        title: "JO-anmälan",
        category: "Förvaltningsrätt",
        content: `Anmälda myndigheter: Försäkringskassan och Socialtjänsten Falun. 
        Brister: Brott mot kommunicering (FL 25 §), motivering (FL 32 §) och barnets bästa (SoL 1:2). 
        Särskilt påtalat: FK fattade beslut 2 dagar INNAN neurografi visade nervskada. Socialtjänsten nekade matpengar men gjorde samtidigt orosanmälan för barnet.`
    }
];
