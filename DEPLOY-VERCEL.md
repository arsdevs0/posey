# Vercel par deploy kaise karein

ZIP ko pehle extract karo. Sahi project folder woh hai jisme index.html aur vercel.json directly hain.

## Option 1: Vercel CLI (seedha extracted folder se)

Node.js installed hona chahiye. Extracted folder mein terminal kholo aur run karo:

    npx vercel --prod

Vercel login/account prompts follow karo. First deployment mein new project create karo, current directory choose karo, aur framework pooche toh Other choose karo. CLI successful deployment ke baad live URL dega.

## Option 2: GitHub + Vercel dashboard

1. ZIP extract karo aur uske andar ki files GitHub repository ke root mein upload karo. ZIP file ko repository mein upload karne ki jagah uska extracted content upload karo.
2. Vercel mein Add New → Project → Import Git Repository se woh repository select karo.
3. Root Directory us folder par rakho jisme index.html aur vercel.json hain.
4. Framework Preset: Other.
5. Build Command: empty / disabled. Install Command: empty / disabled.
6. Output Directory: . (single dot; vercel.json mein already set hai).
7. Environment Variables: none. Deploy click karo.

## Live pages

- / — main posebook
- /gallery.html — same gallery
- /studio.html — separate 3D pose editor

Gallery ke PNGs browser mein generate hote hain. Koi image API, database, Node server ya build step production mein required nahi hai. Local preview ke liye START.cmd ya node serve.cjs use kar sakte ho.

3D editor Three.js ko cdn.jsdelivr.net se load karta hai, isliye us page ke liye internet/CDN access chahiye. Vercel account, project creation aur production deployment tum khud karoge; is ZIP ko prepare karte waqt koi site publish nahi ki gayi.
