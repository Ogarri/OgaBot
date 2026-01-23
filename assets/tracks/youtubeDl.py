import yt_dlp
import os
import sys
import argparse
from pathlib import Path

# Dossier de téléchargement
DOWNLOAD_FOLDER = os.path.dirname(os.path.abspath(__file__)) + "/downloads"

def telecharger_youtube_mp3(url, nom_fichier=None):
    """
    Télécharge une vidéo YouTube en MP3
    
    Args:
        url (str): L'URL de la vidéo YouTube
        nom_fichier (str, optional): Nom personnalisé du fichier (sans .mp3)
    
    Returns:
        str: Chemin du fichier téléchargé ou None en cas d'erreur
    """
    
    # Créer le dossier s'il n'existe pas
    Path(DOWNLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
    
    try:
        # Configuration de yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, nom_fichier or '%(title)s'),
            'quiet': False,
            'no_warnings': False,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"📥 Téléchargement en cours: {url}")
            info = ydl.extract_info(url, download=True)
            fichier_telecharge = ydl.prepare_filename(info)
            fichier_mp3 = os.path.splitext(fichier_telecharge)[0] + ".mp3"
            print(f"✅ Téléchargement terminé: {fichier_mp3}")
            return fichier_mp3
            
    except Exception as e:
        print(f"❌ Erreur lors du téléchargement: {e}")
        return None


if __name__ == "__main__":
    # Parser d'arguments en ligne de commande
    parser = argparse.ArgumentParser(
        description="Télécharge une vidéo YouTube en MP3",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples d'utilisation:
  python youtubeDl.py "https://www.youtube.com/watch?v=..."
  python youtubeDl.py "https://www.youtube.com/watch?v=..." --nom "ma_musique"
        """
    )
    
    parser.add_argument(
        "url",
        help="L'URL de la vidéo YouTube à télécharger"
    )
    parser.add_argument(
        "--nom", "-n",
        dest="nom_fichier",
        default=None,
        help="Nom personnalisé du fichier MP3 (sans extension)"
    )
    
    args = parser.parse_args()
    
    # Télécharger la vidéo
    resultat = telecharger_youtube_mp3(args.url, args.nom_fichier)
    
    if resultat:
        print(f"\n🎵 Fichier disponible à: {resultat}")

