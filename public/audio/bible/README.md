# Audio Bible — AGAPE

## Option 1 : Enregistrement d’un chapitre entier (recommandé)

Placez un fichier MP3 nommé ainsi :

```
public/audio/bible/{version}/{livre}/{chapitre}.mp3
```

Exemples :

- `public/audio/bible/lsg/jhn/3.mp3` — Jean 3 en Segond
- `public/audio/bible/kjv/jhn/3.mp3` — Jean 3 en King James

Le bouton **Écouter** lira ce fichier directement.

## Option 2 : Voix clonée (ElevenLabs)

1. Envoyez votre échantillon vocal (30 s à 2 min, voix claire) à l’équipe ou placez-le dans :
   `public/audio/bible/narrator-reference.mp3`
2. Créez une voix sur [ElevenLabs](https://elevenlabs.io) à partir de cet échantillon.
3. Ajoutez dans `.env.local` sur Vercel :

```
ELEVENLABS_API_KEY=votre_clé
ELEVENLABS_VOICE_ID=id_de_votre_voix
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

La lecture utilisera cette voix pour synthétiser chaque chapitre.

## Option 3 : Voix du navigateur

Sans fichier ni ElevenLabs, le bouton **Écouter** utilise la synthèse vocale de l’appareil (Chrome / Edge / Safari).
