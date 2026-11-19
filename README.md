# Aditya & Shreya — Cinematic Wedding Invitation (Corrected V5)

**This is the complete interactive invitation website, not a set of images.** It is a static, mobile-first website with 7 connected scenes, 6 reversible, scroll-driven transitions, real-photo demo sources and functional guest interactions.

## Deploy on Vercel

1. Extract `Aditya_Shreya_Interactive_Wedding_Invitation_V5_FINAL.zip`.
2. Put the contents of the `AdityaShreya_Invitation_Final/` folder in your GitHub repository root. The root must contain `index.html`, `styles.css`, `script.js` and `assets/`.
3. Import the repo to Vercel.
4. Choose Framework Preset **Other**, with no build command and no output-directory override.
5. Publish. Review on an actual phone before sharing with guests.

## What is included

- Scroll-controlled cinematic wedding card with **7 scenes** and **6 scene-specific transitions**: parchment/families, night-sky ring, marigolds, dhol, mirrored glass, and havan flames.
- Opening ring-drop interaction, optional locally bundled soundtrack, touch-triggered festival effects, scene shortcut menu, and reduced-motion support.
- Original families, event dates and times, venue, RSVP phone, calendar downloads and sharing.
- Photography for the demo, with responsive fallback files so previews remain visible even without internet.

## IMPORTANT: Photography is demonstrative

The public photo URLs below are **real wedding stock photography** from Pexels. They depict unrelated people, **not Aditya and Shreya**. The locally bundled `fallback-*` images are illustrative placeholders from the earlier concept. The invitation should not be publicly presented as showing Aditya and Shreya until their own images replace these assets.

Photo sources, all advertised as free-to-use on their Pexels pages:

- Hero: https://www.pexels.com/photo/beautiful-bride-and-groom-in-traditional-ornamented-clothing-on-their-wedding-day-6543940/
- Family/blessings and wedding: https://www.pexels.com/photo/traditional-indian-wedding-ceremony-ritual-35872894/
- Sufi/night: https://www.pexels.com/photo/vibrant-indian-wedding-ceremony-at-night-35474670/
- Haldi: https://www.pexels.com/photo/vibrant-indian-wedding-haldi-ceremony-celebration-35457632/
- Baraat: https://www.pexels.com/photo/vibrant-indian-wedding-procession-with-groom-on-horse-35457634/
- Reception: https://www.pexels.com/photo/bride-and-groom-in-traditional-wedding-clothing-standing-near-a-fountain-20058062/

To change the six photo references, edit `photoSources` near the top of `script.js` (one photo for each event, plus hero and families), replacing each `real` URL with the URL of the family's photograph or a file placed inside `assets/`. Set `fallback` to that same file to keep the card fully local. Once done, remove the demo photography notice in the `index.html` footer.

## Important wedding time confirmation

The original invitation gives the wedding as **Friday, 11 December 2026, midnight**. In calendar terms, the time is entered as **Saturday, 12 December 2026 at 12:00 AM IST**, immediately after Friday night. Please confirm this convention with the family before sending the calendar file to guests.

## Editing

- Text and invitation layout: `index.html`
- Colors, fonts, animations and responsiveness: `styles.css`
- Scene timing, images, transitions, music and RSVP/calendar interactions: `script.js`
- Soundtrack: `assets/celebration-soundscape.mp3`

Technical note: the heavy transitions are powered by scroll position, with native JS, CSS transforms, SVG and one reduced-frame-rate canvas. No GSAP, React or external animation runtime is needed. The remote Pexels pictures and Google Fonts require internet access; the local fallbacks cover image failures.
