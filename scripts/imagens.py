# Gera favicon, apple-touch-icon e og-image. Uso: python imagens.py <config.json> <pasta-do-projeto>
# Sem "simbolo" no config, o ícone é a inicial da marca sobre a cor de ação.
import json, sys, pathlib
from PIL import Image, ImageDraw, ImageFont

arq, projeto = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
c = json.loads(arq.read_text(encoding="utf-8"))
img = projeto / "site" / "img"
img.mkdir(parents=True, exist_ok=True)
FUNDO, ACAO = c["cores"]["fundo"], c["cores"]["acao"]

def fonte(tam, negrito=True):
    for nome in (["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"] if negrito else ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"]):
        for p in (nome, "C:/Windows/Fonts/" + nome):
            try:
                return ImageFont.truetype(p, tam)
            except OSError:
                pass
    return ImageFont.load_default(tam)

def icone(lado):
    if c.get("simbolo"):
        return Image.open(arq.parent / c["simbolo"]).convert("RGBA").resize((lado, lado), Image.LANCZOS)
    t = Image.new("RGBA", (lado, lado), ACAO)
    ImageDraw.Draw(t).text((lado / 2, lado / 2), c["marca"][0].upper(), font=fonte(round(lado * 0.62)), fill=FUNDO, anchor="mm")
    return t

fav = icone(48)
fav.save(img / "favicon.png")
fav.save(img.parent / "favicon.ico", sizes=[(32, 32), (16, 16)])
toque = Image.new("RGBA", (180, 180), "#FFFFFF")
toque.alpha_composite(icone(132), (24, 24))
toque.convert("RGB").save(img / "apple-touch-icon.png")

og = Image.new("RGBA", (1200, 630), FUNDO)
d = ImageDraw.Draw(og)
if c.get("logo"):
    l = Image.open(arq.parent / c["logo"]).convert("RGBA")
    l = l.resize((360, round(360 * l.height / l.width)), Image.LANCZOS)
    og.alpha_composite(l, (80, 80))
else:
    d.text((80, 80), c["marca"], font=fonte(44), fill="#FFFFFF")
d.multiline_text((80, 230), "\n".join(c["seo"]["ogLinhas"]), font=fonte(64), fill="#FFFFFF", spacing=16)
d.text((80, 500), c["seo"]["ogRodape"], font=fonte(32, False), fill=ACAO)
og.convert("RGB").save(img / "og-image.png", optimize=True)
print("imagens em", img)
