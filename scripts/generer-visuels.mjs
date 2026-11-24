import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const RACINE = fileURLToPath(new URL('..', import.meta.url))
const SOURCES = path.join(RACINE, 'brief', 'images')
const CIBLE = path.join(RACINE, 'public', 'images', 'marque')

function ecrireDataUrl(dataUrl, chemin) {
  const contenu = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return writeFile(chemin, Buffer.from(contenu, 'base64'))
}

async function main() {
  await mkdir(CIBLE, { recursive: true })

  const banniereBase64 = (await readFile(path.join(SOURCES, 'bokhismany-banner.png'))).toString(
    'base64',
  )
  const daayakeBase64 = (await readFile(path.join(SOURCES, 'daayake-food.png'))).toString('base64')

  const navigateur = await chromium.launch()
  const page = await navigateur.newPage()

  const visuels = await page.evaluate(
    async ({ banniere, logoDaayake }) => {
      const charger = async (base64) => {
        const image = new Image()
        image.src = `data:image/png;base64,${base64}`
        await image.decode()
        return image
      }

      const imageBanniere = await charger(banniere)
      const imageDaayake = await charger(logoDaayake)
      const largeurBanniere = imageBanniere.naturalWidth
      const hauteur = imageBanniere.naturalHeight

      const zone = document.createElement('canvas')
      zone.width = largeurBanniere
      zone.height = hauteur
      const contexteZone = zone.getContext('2d')
      contexteZone.drawImage(imageBanniere, 0, 0)
      const pixels = contexteZone.getImageData(0, 0, largeurBanniere, hauteur).data
      const estClair = (x, y) => {
        const i = (y * largeurBanniere + x) * 4
        return pixels[i] > 220 && pixels[i + 1] > 210 && pixels[i + 2] > 195 && pixels[i + 3] > 200
      }
      const denses = []
      for (let x = 0; x < largeurBanniere; x++) {
        let clairs = 0
        for (let y = 0; y < hauteur; y += 4) if (estClair(x, y)) clairs++
        denses.push(clairs / Math.ceil(hauteur / 4))
      }
      const debut = denses.findIndex((valeur) => valeur > 0.75)
      let fin = debut
      for (let x = debut; x < largeurBanniere; x++) if (denses[x] > 0.75) fin = x
      const largeurLogo = fin - debut + 1

      const logo = document.createElement('canvas')
      logo.width = largeurLogo
      logo.height = hauteur
      logo
        .getContext('2d')
        .drawImage(imageBanniere, debut, 0, largeurLogo, hauteur, 0, 0, largeurLogo, hauteur)

      const transparent = document.createElement('canvas')
      transparent.width = largeurLogo
      transparent.height = hauteur
      const contexteTransparent = transparent.getContext('2d')
      contexteTransparent.drawImage(logo, 0, 0)
      const imageTransparent = contexteTransparent.getImageData(0, 0, largeurLogo, hauteur)
      for (let i = 0; i < imageTransparent.data.length; i += 4) {
        const r = imageTransparent.data[i]
        const g = imageTransparent.data[i + 1]
        const b = imageTransparent.data[i + 2]
        imageTransparent.data[i + 3] = Math.max(0, Math.min(255, (255 - Math.min(r, g, b)) * 4))
      }
      contexteTransparent.putImageData(imageTransparent, 0, 0)

      const favicon = document.createElement('canvas')
      favicon.width = 128
      favicon.height = 128
      favicon.getContext('2d').drawImage(logo, 0, 0, largeurLogo, hauteur, 0, 0, 128, 128)

      const daayake = document.createElement('canvas')
      daayake.width = 512
      daayake.height = 512
      daayake
        .getContext('2d')
        .drawImage(
          imageDaayake,
          0,
          0,
          imageDaayake.naturalWidth,
          imageDaayake.naturalHeight,
          0,
          0,
          512,
          512,
        )

      const og = document.createElement('canvas')
      og.width = 1200
      og.height = 630
      const contexteOg = og.getContext('2d')
      contexteOg.fillStyle = '#00153e'
      contexteOg.fillRect(0, 0, 1200, 630)
      contexteOg.strokeStyle = '#eab244'
      contexteOg.lineWidth = 2
      contexteOg.strokeRect(28, 28, 1144, 574)
      contexteOg.fillStyle = '#f4d68a'
      contexteOg.font = '600 26px Georgia, serif'
      contexteOg.fillText('DAAYAKE FOOD', 80, 150)
      contexteOg.fillStyle = '#f5ede2'
      contexteOg.font = '600 78px Georgia, serif'
      contexteOg.fillText('Bokhismany', 76, 280)
      contexteOg.fillText('Trading SARL', 76, 370)
      contexteOg.fillStyle = '#eab244'
      contexteOg.fillRect(80, 410, 420, 2)
      contexteOg.font = '400 26px Arial, sans-serif'
      contexteOg.fillText('Commerce général · Kinshasa — Brazzaville', 80, 470)
      contexteOg.font = '400 21px Arial, sans-serif'
      contexteOg.fillStyle = '#f4d68a'
      contexteOg.fillText('Riz · Farine · Semoule · Sucre · Huiles', 80, 518)
      contexteOg.drawImage(logo, 0, 0, largeurLogo, hauteur, 850, 70, 280, 280)

      return {
        logo: logo.toDataURL('image/png'),
        transparent: transparent.toDataURL('image/png'),
        favicon: favicon.toDataURL('image/png'),
        daayake: daayake.toDataURL('image/png'),
        og: og.toDataURL('image/png'),
        largeurLogo,
        debut,
        fin,
      }
    },
    { banniere: banniereBase64, logoDaayake: daayakeBase64 },
  )

  await navigateur.close()

  await ecrireDataUrl(visuels.logo, path.join(CIBLE, 'bokhismany-logo.png'))
  await ecrireDataUrl(visuels.transparent, path.join(CIBLE, 'bokhismany-logo-transparent.png'))
  await ecrireDataUrl(visuels.favicon, path.join(CIBLE, 'favicon.png'))
  await ecrireDataUrl(visuels.daayake, path.join(CIBLE, 'daayake-food.png'))
  await ecrireDataUrl(visuels.og, path.join(RACINE, 'public', 'images', 'og-couverture.png'))
  await copyFile(
    path.join(SOURCES, 'bokhismany-banner.png'),
    path.join(CIBLE, 'banniere.png'),
  )

  console.log(
    `Visuels officiels générés (logo : ${visuels.largeurLogo} px, zone ${visuels.debut}–${visuels.fin}).`,
  )
}

main().catch((error) => {
  console.error('Échec de la génération des visuels :', error instanceof Error ? error.message : error)
  process.exitCode = 1
})
