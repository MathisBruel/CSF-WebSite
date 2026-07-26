import racesData from '../Race.json'
import eyeColorsData from '../CouleurYeux.json'

export type Race = {
  id: number
  nom: string
  codeLoof: string
  typePoil: string
  bNouvelleRace: boolean
  ordrePassage: number
}

export const RACES: Race[] = racesData.Race
  .map((r) => ({
    id: r.IDRace,
    nom: r.Nom,
    codeLoof: r.CodeLoof,
    typePoil: r.TypePoil,
    bNouvelleRace: r.bNouvelleRace,
    ordrePassage: r.OrdrePassage,
  }))
  .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

export const EYE_COLORS: { id: number; nom: string }[] = eyeColorsData.CouleurYeux.map((e) => ({
  id: e.IDCouleurYeux,
  nom: e.Nom,
}))

export type ClassOption = { nom: string; idClasses: number }

export const HOUSE_CAT_BREEDS = ['CHAT DE MAISON P.C.', 'CHAT DE MAISON P.L.']

export function isHouseCatBreed(breed: string): boolean {
  return breed.toUpperCase().includes('CHAT DE MAISON')
}

function isNouvelleRace(breed: string): boolean {
  const race = racesData.Race.find(
    (r) => r.Nom.toUpperCase() === breed.toUpperCase() || r.CodeLoof.toUpperCase() === breed.toUpperCase()
  )
  return race?.bNouvelleRace ?? false
}

function catAgeAtExpo(birthDate: Date, expoDate: Date): { years: number; months: number } {
  let years = expoDate.getFullYear() - birthDate.getFullYear()
  let months = expoDate.getMonth() - birthDate.getMonth()
  if (expoDate.getDate() < birthDate.getDate()) months -= 1
  if (months < 0) { years -= 1; months += 12 }
  const totalMonths = years * 12 + months
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 }
}

function addAdultClasses(classes: ClassOption[], isNeutered: boolean, gbWCF: boolean) {
  if (!isNeutered) {
    classes.push({ nom: 'CAC', idClasses: 3 })
    classes.push({ nom: 'CACIB', idClasses: 4 })
    classes.push({ nom: 'CAGCI', idClasses: 5 })
    classes.push({ nom: 'CACE', idClasses: 6 })
    classes.push({ nom: 'CAGCE', idClasses: 7 })
    if (gbWCF) classes.push({ nom: 'CACM', idClasses: 22 })
  } else {
    classes.push({ nom: 'CAP', idClasses: 8 })
    classes.push({ nom: 'CAPIB', idClasses: 9 })
    classes.push({ nom: 'CAGPI', idClasses: 10 })
    classes.push({ nom: 'CAPE', idClasses: 11 })
    classes.push({ nom: 'CAGPE', idClasses: 12 })
    if (gbWCF) classes.push({ nom: 'CAPM', idClasses: 23 })
  }
  classes.push({ nom: 'Honneur', idClasses: 13 })
  if (gbWCF) classes.push({ nom: 'Vétéran', idClasses: 24 })
  classes.push({ nom: 'Nouvelle Couleur', idClasses: 17 })
  classes.push({ nom: 'RIA (Registre d\'inscription Apparence)', idClasses: 19 })
  classes.push({ nom: 'AE (Auxiliaire d\'élevage)', idClasses: 20 })
  classes.push({ nom: 'Conformité Seule', idClasses: 26 })
}

function addHouseCatAdultClasses(classes: ClassOption[]) {
  classes.push({ nom: 'CAB', idClasses: 27 })
  classes.push({ nom: 'CAA', idClasses: 28 })
  classes.push({ nom: 'CAV', idClasses: 29 })
  classes.push({ nom: 'CAO', idClasses: 30 })
  classes.push({ nom: 'CAPL', idClasses: 31 })
}

export function computeAvailableClasses(
  birthDate: Date,
  gender: string,
  breed: string,
  isHouseCat: boolean,
  expoDate: Date,
  gbWCF = false
): ClassOption[] {
  const bNouvelleRace = isNouvelleRace(breed)
  const isHouse = isHouseCat || isHouseCatBreed(breed)
  const isNeutered = gender.startsWith('Neutre')
  const { years, months } = catAgeAtExpo(birthDate, expoDate)

  const classes: ClassOption[] = []

  if (!isHouse) {
    if (years === 0) {
      if (months < 3) {
        // too young — no classes
      } else if (months < 6) {
        classes.push({ nom: '3-6 Mois', idClasses: 1 })
        if (gbWCF) classes.push({ nom: 'Portée', idClasses: 25 })
        classes.push({ nom: 'AE (Auxiliaire d\'élevage)', idClasses: 20 })
      } else if (months < 10) {
        classes.push({ nom: '6-10 Mois', idClasses: 2 })
        classes.push({ nom: 'AE (Auxiliaire d\'élevage)', idClasses: 20 })
      } else {
        addAdultClasses(classes, isNeutered, gbWCF)
      }
    } else {
      addAdultClasses(classes, isNeutered, gbWCF)
    }
  } else {
    if (years === 0) {
      if (months < 4) {
        // too young — no classes
      } else if (months < 10) {
        classes.push({ nom: '4-10 Mois', idClasses: 32 })
      } else {
        addHouseCatAdultClasses(classes)
      }
    } else {
      addHouseCatAdultClasses(classes)
    }
  }

  if (bNouvelleRace) {
    classes.length = 0
    classes.push({ nom: 'Nouvelle Race', idClasses: 18 })
    classes.push({ nom: 'Conformité Seule', idClasses: 26 })
  }

  classes.push({ nom: 'Hors Concours', idClasses: 14 })
  classes.push({ nom: 'Absent', idClasses: 16 })

  return classes
}
