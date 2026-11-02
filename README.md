# 邓乐天 Letian Deng — personal site

> 中文摘要：邓乐天个人站（v3.1）的源码。纯 HTML / CSS / JS，无构建步骤，直接用 GitHub Pages 托管。代码以 MIT 协议开源；文案、照片、项目截图、日隙美术与样片、二维码保留版权，不随代码授权。

The site of Letian Deng (邓乐天): marketing and AI workflow work between China and New Zealand, the projects behind it, and the FDE (forward deployed) way of working with clients.

## What is here

| Path | What it is |
| --- | --- |
| `index.html` | The whole page: work, projects, skills, services, FDE team, contact |
| `v3.css` | Styles, including the phone layout and print rules |
| `v3.js` | Scroll reveals and the Daygap lightbox (keyboard, swipe, sound toggle) |
| `assets/` | Only the images and clips the page uses |

No framework, no build step, no tracking. The page works without JavaScript; the script only adds motion and the lightbox.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Licence

The **code** (the HTML structure, `v3.css`, `v3.js`) is released under the MIT licence; see `LICENSE`.

The **content** is not covered by the MIT licence. The words, portraits, photographs, project screenshots, the Daygap artwork and clips, and the contact QR codes are © Letian Deng, all rights reserved, except as credited below. Please don't reuse them without asking.

### Credits

- Greenstone photograph: "Nephrite jade (Pounamu Ultramafics, Pounamu Ultramafic Belt, South Island, New Zealand) 1" by James St. John, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nephrite_jade_(Pounamu_Ultramafics,_Pounamu_Ultramafic_Belt,_South_Island,_New_Zealand)_1_(24069093653).jpg). Cropped in `assets/v3/stone-disc.jpg` and used as the fill of `assets/v3/verb-*-jade.webp`.
- Screenshots of client and partner projects are shown as portfolio work. The sites and everything in them belong to their owners; film stills inside them remain © their original rights holders.
