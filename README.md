# Elfareed Roastery Project

1. The Brand

Name (Arabic): بن الفريد Name (Latin/brand file naming only): Elfareed Coffee Slogan: بن الفريد — اختيار الملوك ("Elfareed Coffee — The Choice of Kings") Category: Coffee roaster / bean seller (retail + wholesale), new launch, Egyptian market Language: Site is primarily Arabic, RTL. Do not default to LTR English layouts mirrored — build natively RTL.

Products / Roast line (use these exact 4 categories as the core product grid):

محوج (Spiced blend)

وسط (Medium roast)

فاتح (Light roast)

غامق (Dark roast)

Location: ش عبد الفتاح أبو ريه، المرج القديمة، القاهرة Sales number: 01110583020 Wholesale numbers (رقم الجملة): 01020073246 / 01056425650 (confirm digit count with client — one of the two wholesale numbers looks like it may be missing/extra a digit; verify before launch)

Required functionality: A visible, working "اطلب أونلاين" (Order Online) flow — a product grid with quantity/weight selector → cart → checkout.

2. Non-Negotiable Art Direction: this must NOT look AI-generated

Lovable/Stitch defaults (and most AI page-builders) produce a recognizable "look": centered hero with a huge rounded-corner hero image, 3 equal glassmorphism cards under it, a soft purple/teal gradient background, Inter/Poppins everywhere, rounded-2xl everything, drop shadows on every card, emoji-as-icons. Explicitly avoid every item in that list. Instead:

Break the grid on purpose. Asymmetric hero (text block off-center, product photo overlapping the edge of its container, roast-type tags scattered rather than in a neat row).

No default gradients. Use flat, roasted color fields (see palette below) or a subtle paper/burlap/kraft-paper texture as background instead of a linear gradient.

No glassmorphism, no soft drop shadows on every element. Use hard-edged cards, thin 1px borders, or a solid offset shadow (like a printed poster) instead.

Typography does the heavy lifting. One striking Arabic display typeface for headlines (see fonts below) at a large, confident size, paired with a plain, restrained body font. Not the default "bold Arabic web font at 40px in a rounded card."

Texture over polish. Add grain/paper texture, a coffee-stain ring graphic, roasted-bean photography with natural shadows — not flat vector illustrations or 3D-render clichés (no floating coffee cup with glow, no generic "AI barista" imagery).

Real photography direction, not stock-looking renders: close-up of roasted beans, burlap sacks, a hand pouring, terracotta/copper coffee tools. If AI-generated imagery is used for placeholders, art-direct it toward documentary/editorial food photography, not glossy 3D product renders.

Imperfect, human details: a hand-drawn underline under the slogan, a stamped/seal-style logo mark reminiscent of an Egyptian roastery stamp, torn-paper edges on section dividers instead of straight lines.

3. Reference Brands (study the systems, not just the images)

Give Lovable/Stitch these references by name so it pulls real design language instead of generic templates:

Blue Bottle Coffee — restraint, huge whitespace, confident single-color blocks, minimal copy.

Devoción — bold typography, saturated color blocks, editorial photo crops.

Onyx Coffee Lab — dark, moody, premium roast-brand feel; good reference for the "غامق" (dark roast) mood.

Grind (London) — playful but structured grid, strong brand color (hot pink) used as a signature — Elfareed should pick ONE signature accent color the same way.

Tim Wendelboe — Scandinavian minimalism, lots of negative space, small confident logotype.

Local/regional cue: Egyptian specialty roasters like Cilantro or Costa-style Cairo cafés for what already reads as "familiar and trustworthy" to an Egyptian customer — then push the typography and color further upmarket than they typically go, since the slogan is "اختيار الملوك" (choice of kings) → the brand should feel a notch more premium/regal, not just another neighborhood café.

Tell the tool explicitly: "Take cues from Blue Bottle's restraint, Onyx Coffee Lab's dark premium mood, and Grind's confident single accent color — combined with an Egyptian roastery sensibility, not a Western minimalist coffee shop."

4. Color Palette — tied to the 4 roast types

Use a base of warm neutrals (kraft paper, cream, charcoal) plus a signature accent, then let each roast category get its own small tonal marker instead of using generic rainbow tags:

RoleColor directionBase backgroundWarm off-white / unbleached paper (#F4EEE4-ish)Ink / textNear-black espresso brown, not pure black (#241A14-ish)Signature accentOne saturated regal color — deep gold/brass or a deep royal red — echoing "اختيار الملوك"فاتح (light roast) markerWarm tanوسط (medium roast) markerAmber/caramelمحوج (spiced) markerTerracotta/rust with a hint of cardamom-green or clove toneغامق (dark roast) markerNear-black charcoal brown

Avoid teal, purple, or mint — these read as generic SaaS/AI-tool colors, not coffee.

5. Typography

Headlines/logotype: A bold, high-contrast Arabic display face with character — something in the spirit of a modern Kufi or a stylized Naskh-inspired display font (e.g., explore Google Fonts Arabic options like Lalezar, Aref Ruqaa, or Rakkas for the wordmark/slogan; test which best fits a "regal roastery" feel — avoid the default Cairo or Tajawal used everywhere).

Body text: A calm, highly legible Arabic text face (Tajawal or IBM Plex Sans Arabic are fine only for body copy, never for the headline/logo — this is what avoids the generic look).

Numerals: Keep phone numbers in Western digits (as given) but ensure correct RTL bidi handling so numbers don't visually break.

6. Required Sections / Page Structure

Header — logotype/stamp mark (بن الفريد) + nav (الرئيسية / المنتجات / عن الفريد / الجملة / تواصل) + a persistent "اطلب أونلاين" button.

Hero — slogan front and center: بن الفريد — اختيار الملوك, asymmetric layout, strong bean/roast photography, primary CTA "اطلب أونلاين" + secondary "تصفح المنتجات."

Roast selector / Product grid — the 4 types (محوج، وسط، فاتح، غامق) as distinct cards, each with its tonal marker color, short description, weight/price selector, add-to-order action.

Story/About strip — short brand story block, giving it credibility as a new but serious brand (texture, stamp/seal graphic reinforcing trust).

Order Online flow — cart summary → checkout page, clearly labeled.

Wholesale (الجملة) block — separate, clearly marked section for bulk/business buyers with the wholesale numbers, distinct tone (more B2B/plain).

Location — ش عبد الفتاح أبو ريه، المرج القديمة, with a simple map embed or static map graphic.

Footer — contact numbers, social links, slogan repeated small.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4993eee3-3dea-449f-b9fc-c2eb136e520e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
