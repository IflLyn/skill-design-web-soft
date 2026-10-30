#!/bin/sh
# Junta três tomadas no vídeo de fundo, com fusões de 1,5 s e loop sem emenda (paisagem e retrato).
# Uso: FFMPEG=/caminho/ffmpeg sh video.sh <A.mp4> <B.mp4> <C.mp4> <pasta-do-projeto>
# Cada tomada precisa de pelo menos 10 s. O arquivo começa em A+1,5 s e termina na fusão C → A.
set -e
A=$1; B=$2; C=$3; OUT=$4/site/video
FF=${FFMPEG:-ffmpeg}
mkdir -p "$OUT"

# $1 nome, $2 largura, $3 altura, $4 crf
gerar() {
  P="scale=$2:$3:force_original_aspect_ratio=increase,crop=$2:$3,fps=24,setsar=1"
  "$FF" -v error -y -i "$A" -i "$B" -i "$C" -i "$A" -filter_complex "
    [0:v]trim=1.5:10,setpts=PTS-STARTPTS,$P[a1];
    [1:v]trim=0:10,setpts=PTS-STARTPTS,$P[b];
    [2:v]trim=0:10,setpts=PTS-STARTPTS,$P[c];
    [3:v]trim=0:1.5,setpts=PTS-STARTPTS,$P[a0];
    [a1][b]xfade=transition=fade:duration=1.5:offset=7[ab];
    [ab][c]xfade=transition=fade:duration=1.5:offset=15.5[abc];
    [abc][a0]xfade=transition=fade:duration=1.5:offset=24,format=yuv420p[v]" \
    -map "[v]" -an -c:v libx264 -preset slow -crf "$4" -profile:v high -movflags +faststart "$OUT/$1.mp4"
  "$FF" -v error -y -i "$OUT/$1.mp4" -frames:v 1 -q:v 4 "$OUT/$1.jpg"
}

gerar hero-paisagem 1280 720 30
gerar hero-retrato 720 1280 30
ls -l "$OUT"
