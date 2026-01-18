
export const LAGTEXTER: Record<string, { namn: string; källa: string; paragrafer: Record<string, string> }> = {
  "SoL_2001": {
    "namn": "Socialtjänstlag (SFS 2001:453)",
    "källa": "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialtjanstlag-2001453_sfs-2001-453/",
    "paragrafer": {
      "1 kap. 1 §": "Samhällets socialtjänst skall på demokratins och solidaritetens grund främja människornas ekonomiska och sociala trygghet, jämlikhet i levnadsvillkor, aktiva deltagande i samhällslivet. Socialtjänsten skall under hänsynstagande till människans ansvar för sin och andras sociala situation inriktas på att frigöra och utveckla enskildas och gruppers egna resurser. Verksamheten skall bygga på respekt för människornas självbestämmanderätt och integritet.",
      "1 kap. 2 §": "Vid åtgärder som rör barn ska barnets bästa särskilt beaktas. Vid beslut eller andra åtgärder som rör vård- eller behandlingsinsatser för barn ska vad som är bäst för barnet vara avgörande. Med barn avses varje människa under 18 år.",
      "2 kap. 1 §": "Varje kommun svarar för socialtjänsten inom sitt område, och har det yttersta ansvaret för att enskilda får det stöd och den hjälp som de behöver. Detta innebär ingen inskränkning i det ansvar som vilar på andra huvudmän.",
      "3 kap. 1 §": "Till socialnämndens uppgifter hör att göra sig väl förtrogen med levnadsförhållandena i kommunen, medverka i samhällsplaneringen, informera om socialtjänsten, genom uppsökande verksamhet främja goda levnadsförhållanden, svara för omsorg och service, upplysningar, råd, stöd och vård, ekonomisk hjälp och annat bistånd till familjer och enskilda som behöver det.",
      "4 kap. 1 §": "Den som inte själv kan tillgodose sina behov eller kan få dem tillgodosedda på annat sätt har rätt till bistånd av socialnämnden för sin försörjning (försörjningsstöd) och för sin livsföring i övrigt. Den enskilde ska genom biståndet tillförsäkras en skälig levnadsnivå.",
      "5 kap. 1 §": "Socialnämnden ska verka för att barn och unga växer upp under trygga och goda förhållanden, i nära samarbete med hemmen främja en allsidig personlighetsutveckling.",
      "6 kap. 1 §": "Vård i familjehem och i hem för vård eller boende ska bedrivas i samråd med socialnämnden i den kommun som har beslutat om vården.",
      "7 kap. 1 §": "En person som avser att flytta till en annan kommun kan begära förhandsbesked om rätt till bistånd av den kommunen.",
      "8 kap. 1 §": "Kommunen får, om inte annat är föreskrivet, ta ut skäliga avgifter för hemtjänst, dagverksamhet, bostad i särskilt boende och annan liknande social tjänst.",
      "9 kap. 1 §": "Om någon genom oriktiga uppgifter eller genom underlåtenhet att lämna uppgifter förorsakat att ekonomisk hjälp betalats ut obehörigen, får socialnämnden återkräva vad som har betalats ut för mycket.",
      "10 kap. 2 §": "I ärenden som avser myndighetsutövning mot någon enskild får uppgifter som avses i 6 kap. 37 § kommunallagen inte delegeras till en anställd.",
      "11 kap. 1 §": "Socialnämnden ska utan dröjsmål inleda utredning av vad som genom ansökan, anmälan eller på annat sätt har kommit till nämndens kännedom.",
      "11 kap. 1 a §": "En utredning av om socialnämnden behöver ingripa till ett barns skydd eller stöd ska bedrivas skyndsamt och vara slutförd senast inom fyra månader.",
      "14 kap. 1 §": "Följande myndigheter och yrkesverksamma är skyldiga att genast anmäla till socialnämnden om de i sin verksamhet får kännedom om eller misstänker att ett barn far illa.",
      "15 kap. 1 §": "Den som är eller har varit verksam inom yrkesmässigt bedriven enskild verksamhet får inte obehörigen röja vad han eller hon därvid har fått veta om enskildas personliga förhållanden.",
      "16 kap. 1 §": "Beslut av socialnämnden får överklagas till allmän förvaltningsdomstol, om nämnden har meddelat beslut i fråga om bistånd, vård eller avgift."
    }
  },
  "SoL": {
    "namn": "Socialtjänstlag (SFS 2025:400)",
    "källa": "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialtjanstlag-2025400_sfs-2025-400/",
    "paragrafer": {
      "1 kap. 1 §": "Socialtjänsten ska främja människornas ekonomiska och sociala trygghet, jämlikhet i levnadsvillkor och deltagande i samhällslivet.",
      "4 kap. 1 §": "Rätt till bistånd för försörjning och livsföring om behoven inte kan tillgodoses på annat sätt."
    }
  }
};

export function getLagtext(lagKod: string, paragraf?: string): string {
  let effectiveLagKod = lagKod;
  if (lagKod === 'SoL' && paragraf?.includes('2001')) effectiveLagKod = 'SoL_2001';

  const lag = LAGTEXTER[effectiveLagKod] || LAGTEXTER[lagKod];
  if (!lag) return `Okänd lagkod: ${lagKod}`;
  
  if (!paragraf) return lag.namn;

  const normalizedP = paragraf.trim()
    .replace(/\s+/g, ' ')
    .replace(' (2001:453)', '')
    .replace(' (2025:400)', '')
    .replace('SoL ', '');
  
  if (lag.paragrafer[normalizedP]) {
      return `${lag.namn} ${normalizedP}:\n${lag.paragrafer[normalizedP]}`;
  }
  
  if (lagKod === 'SoL') {
      const otherSol = effectiveLagKod === 'SoL' ? 'SoL_2001' : 'SoL';
      if (LAGTEXTER[otherSol]?.paragrafer[normalizedP]) {
          return `${LAGTEXTER[otherSol].namn} ${normalizedP}:\n${LAGTEXTER[otherSol].paragrafer[normalizedP]}`;
      }
  }

  return `Paragrafen ${normalizedP} saknas i registret för ${lag.namn}.`;
}
