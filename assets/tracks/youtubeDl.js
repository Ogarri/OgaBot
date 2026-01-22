const youtubedl = require('youtube-dl-exec');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');

async function downloadYouTubeMp3(url, outputPath = './downloads') {
    try {
        // Créer le dossier de téléchargement s'il n'existe pas
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        console.log(`📥 Téléchargement en cours...`);
        console.log(`URL: ${url}`);
        
        const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');
        
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: '192',
            output: outputTemplate,
            noWarnings: true,
            noPlaylist: true,
            ffmpegLocation: path.dirname(ffmpegPath)
        });

        console.log(`✅ Téléchargement terminé`);
        
        // Vérifier les fichiers téléchargés
        const files = fs.readdirSync(outputPath);
        if (files.length > 0) {
            console.log(`📁 Fichiers téléchargés:`);
            files.forEach(f => {
                const filePath = path.join(outputPath, f);
                const stats = fs.statSync(filePath);
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                console.log(`  - ${f} (${sizeMB} MB)`);
            });
        }
        
    } catch (error) {
        console.error(`❌ Erreur:`, error.message);
        throw error;
    }
}

// Utilisation
const youtubeUrl = process.argv[2];
const customOutputPath = process.argv[3] || './downloads';

if (!youtubeUrl) {
    console.log('Usage: node youtubeDl.js <YouTube URL> [outputPath]');
    console.log('Exemple: node youtubeDl.js https://www.youtube.com/watch?v=dQw4w9WgXcQ ./downloads');
    process.exit(1);
}

downloadYouTubeMp3(youtubeUrl, customOutputPath)
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch(error => {
        process.exit(1);
    });