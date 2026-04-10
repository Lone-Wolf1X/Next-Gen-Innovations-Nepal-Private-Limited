# Domain & Email Setup Guide

Bhai, badhai ho! Domain `nextgeninnovationsnepal.com` aur hosting order mil gaya hai. Ab isko Firebase ke saath kaise connect karna hai aur email kaise setup hoga, ye samjhiye:

## 🌐 1. Domain ko Firebase se Connect Karna

Firebase Hosting pe apni site dikhane ke liye ye steps follow karein:

1. **Firebase Console** me jayein -> **Hosting** -> **Add Custom Domain**.
2. Apna domain (`nextgeninnovationsnepal.com`) enter karein.
3. Firebase aapko ek **TXT record** dega (e.g., `google-site-verification=...`).
4. **Solid Hosting Client Area** (jaha se domain liya) me login karein aur **DNS Management** me ye TXT record add karein.
5. Verify hone ke baad, Firebase aapko 2 **A Records** (IP addresses) dega.
6. DNS Management me purane A records delete karke ye naye Firebase IP addresses daalein.

## 📧 2. Email Setup (info@nextgeninnovationsnepal.com)

Aapke order me **Email Forwarding** included hai. 2 tareeke hain email setup karne ke:

### Option A: Email Forwarding (Simple)
- Aapne registrar (Solid Hosting) ke dashboard me **Email Forwarding** section me jayein.
- `info@nextgeninnovationsnepal.com` -> `aapka-personal-email@gmail.com` set kardein.
- Ab koi bhi business email pe mail bhejega, wo aapke Gmail pe aayega.

### Option B: Professional Email Hosting (via Solid Hosting)
- Aapko jo "Free Cloud Hosting" mili hai, usme **cPanel** ya **DirectAdmin** ka link hoga (aapke email me details hongi).
- Waha login karke **Email Accounts** me jayein aur naya email create karein.
- Iske liye aapko DNS me **MX Records** point karne honge (Solid Hosting ke default MX records use karein).

## 🖥️ 3. Control Panel Kaha Hai?

Solid Hosting ka control panel basically 2 levels pe hota hai:
1. **Billing/Client Area**: Jaha se aapne order kiya (`solidhosting.pro` pe login). Yaha se aap DNS aur Nameservers manage karte ho.
2. **Hosting Control Panel (cPanel/DirectAdmin)**: Iska link aapko "Welcome Email" me aaya hoga. Yaha se aap Emails aur Files manage karte ho.

> [!IMPORTANT]
> **Nameservers Warning**: Agar aap Firebase use kar rahe ho, to nameservers ko default (Solid Hosting) pe hi rehne dein aur sirf **DNS Management** section me jaakar A/TXT records update karein.

## 🏁 Summary Checklist
- [ ] Firebase me domain add karein.
- [ ] DNS verify karwayein (TXT record).
- [ ] A records update karein.
- [ ] Client Area se Email Forwarding set karein.

Need help with specific DNS records? Screenshot dikhaiye ya console me jo records aa rahe hain wo bataiye!
