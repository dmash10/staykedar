-- Populate Help Center with Comprehensive Articles (Part 3)
-- Articles 11-15

-- Article 11: Weather Updates and Packing List
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'weather-packing-list',
  'Weather Updates & Essential Packing List',
  '# Weather & Packing Guide

The weather in Kedarnath is unpredictable and changes rapidly. Being well-prepared is the key to a comfortable Yatra.

## Weather Overview

- **Summer (May-June):** Days are pleasant (15°C), nights are cool (5°C). Light woolens required.
- **Monsoon (July-Aug):** Frequent rain, fog, and chill. Rain gear essential.
- **Autumn (Sept-Oct):** Days are sunny but crisp. Nights are freezing (0°C to -5°C). Heavy woolens required.

*Always check the forecast before starting your trek.*

## Essential Packing List 🎒

### Clothing
- **Thermals:** Upper and lower (must-have).
- **Heavy Jacket:** Down jacket or fleece-lined windcheater.
- **Sweaters:** 1-2 warm layers.
- **Trousers:** Comfortable trekking pants (avoid denim/jeans as they get heavy if wet).
- **Socks:** 3-4 pairs of woolen socks.
- **Gloves & Cap:** Woolen cap and waterproof gloves.
- **Raincoat/Poncho:** Mandatory, even in summer.

### Footwear
- **Trekking Shoes:** With good grip and ankle support.
- **Slippers:** For use inside the hotel room.

### Medical Kit 💊
- **Pain Relief:** Paracetamol, Combiflam, Volini spray.
- **Digestion:** Pudin Hara, Digene.
- **Altitude Sickness:** Diamox (consult doctor).
- **First Aid:** Band-aids, crepe bandage, antiseptic cream.
- **Personal Meds:** Carry extra stock of your regular medicines.

### Electronics
- **Power Bank:** Electricity can be erratic.
- **BSNL Sim Card:** BSNL has the best coverage; Jio/Airtel are intermittent.
- **Torch/Headlamp:** For night movement.

### Miscellaneous
- **Water Bottle:** Reusable bottle (stay hydrated!).
- **Dry Fruits/Chocolates:** For instant energy during the trek.
- **Cash:** ATMs are scarce or often out of cash. Carry sufficient cash.
- **Toiletries:** Soap, paper soap, sanitizer, wet wipes.
- **Sunscreen & Sunglasses:** UV rays are strong at high altitude.

## What NOT to Pack ❌
- Heavy suitcases (carry a backpack).
- Unnecessary fancy clothes.
- Alcohol or tobacco products.
- Single-use plastic (banned in the region).

**Pack light, pack right!**',
  true,
  95,
  11
FROM help_categories WHERE slug = 'travel-guide';

-- Article 12: Helicopter Booking Guide
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'helicopter-booking-guide',
  'Helicopter Booking: Complete Guide',
  '# Helicopter Booking Guide

Helicopter services are the fastest way to reach Kedarnath, saving the 16km trek. However, booking tickets can be challenging due to high demand.

## Official Booking Platform
**IRCTC HeliYatra** is the ONLY official website for booking helicopter tickets.
- **Website:** [heliyatra.irctc.co.in](https://heliyatra.irctc.co.in)
- **Warning:** Do not book from unauthorized agents or random websites. Many are scams.

## Booking Process

1. **Registration:** Create an account on the IRCTC HeliYatra website.
2. **Yatra Registration:** You must have a valid Char Dham Yatra Registration number.
3. **Slot Opening:** Tickets usually open in batches (e.g., 15 days or 1 month in advance).
4. **Booking:** Select route (Guptkashi/Phata/Sersi), date, and passengers.
5. **Payment:** Pay online immediately.

## Helipads & Routes

1. **Guptkashi:** Furthest; highest fare.
2. **Phata:** Mid-range distance and fare.
3. **Sersi:** Closest to Sonprayag; usually lowest fare and shortest flight time (7 mins).

## Important Rules

- **Weight Limit:** Passenger weight + baggage usually capped at 80kg. Extra weight may be charged or denied.
- **Baggage:** Only small handbags (2-5kg) allowed. No suitcases.
- **ID Proof:** Original Aadhar card mandatory at helipad.
- **Reporting Time:** Reach helipad 1 hour before slot.
- **Weather Cancellations:** Flights are frequently cancelled due to bad weather.
  - **Refund:** Full refund is processed automatically by IRCTC if cancelled by operator.

## Tips for Success
- Create your account beforehand.
- Be ready exactly when booking opens (slots fill in minutes).
- Have high-speed internet.
- Keep passenger details ready to copy-paste.

**Note:** StayKedar does NOT sell helicopter tickets. We only provide accommodation.',
  true,
  130,
  12
FROM help_categories WHERE slug = 'travel-guide';

-- Article 13: Safety Tips for Yatra
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'safety-tips-yatra',
  'Important Safety Tips for Your Yatra',
  '# Safety First: Yatra Guidelines

Kedarnath is located at 3,583 meters (11,755 ft). The high altitude and tough terrain require caution.

## Health Safety ❤️

1. **Medical Checkup:** Get a basic checkup before the trip. Avoid if you have severe heart or respiratory issues.
2. **Acclimatization:** Do not rush. Spend a night at Guptkashi or Sonprayag before ascending.
3. **Hydration:** Drink plenty of warm water. Dehydration worsens altitude sickness.
4. **Walk Slowly:** Do not run or walk too fast on the trek. Maintain a steady, slow rhythm.
5. **Oxygen:** Portable oxygen cans are available at medical camps. Carry one if you are asthmatic.

## Trekking Safety 🚶

1. **Stick to the Path:** Do not take shortcuts; they can be slippery and dangerous.
2. **Mules/Horses:** Be careful of mules on the path. Always walk on the hill-side, not the valley-side, to avoid being pushed.
3. **Night Trekking:** Avoid trekking after dark. The path is lit but temperature drops drastically.
4. **Rain:** If it rains heavily, stop at a shelter. Landslides are possible.

## General Safety 🛡️

1. **Register:** Ensure you have the official Yatra e-Pass. It helps authorities track pilgrims in emergencies.
2. **Group:** Try to stick with your group or family. Decide a meeting point in case you get separated.
3. **Emergency Numbers:** Save local police and disaster management numbers.
4. **Valuables:** Keep cash and phones in zipped inner pockets.

## Emergency Contacts
- **Police:** 100 / 112
- **Ambulance:** 108
- **Disaster Control Room:** 01372-251437

**Stay Safe, Jai Baba Kedar!**',
  true,
  115,
  13
FROM help_categories WHERE slug = 'travel-guide';

-- Article 14: Medical Facilities
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'medical-facilities',
  'Medical Facilities & Emergency Contacts',
  '# Medical Facilities on the Route

The Uttarakhand government sets up medical relief posts along the trek route.

## Medical Camps Locations 🏥
Medical units are typically available at:
1. **Gaurikund** (Start point)
2. **Jungle Chatti**
3. **Bheem Bali**
4. **Lincholi**
5. **Kedarnath Base Camp**
6. **Near Temple Complex**

## Services Available
- First Aid
- Oxygen Cylinders
- Basic Medicines (fever, pain, vomiting)
- Blood Pressure check
- Stretchers for emergencies

## Six Sigma High Altitude Medical Services
- Often deployed during Yatra season.
- Provide specialized high-altitude care.
- Equipped with portable ECG and critical care kits.

## Air Ambulance
- In extreme critical cases, air evacuation to Dehradun/Rishikesh can be arranged (subject to weather and availability).

## Pharmacies
- Basic medical shops are available at Sonprayag and Gaurikund.
- **Tip:** Carry your own prescription medicines as specific brands may not be available.

## Advice for Heart Patients
- Consult your cardiologist before planning.
- Avoid walking; use a Palki or Helicopter.
- Stop immediately if you feel breathless or chest pain.

**Your health is more important than the journey.**',
  true,
  80,
  14
FROM help_categories WHERE slug = 'travel-guide';

-- Article 15: Troubleshooting Booking Issues
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'troubleshooting-booking-issues',
  'Troubleshooting: Common Booking Issues',
  '# Troubleshooting Booking Issues

Facing trouble with your booking? Here are quick solutions to common problems.

## 1. "Booking Confirmed" but No Email?
- **Check Spam:** Look in Spam/Promotions folder.
- **Wait:** Allow 10-15 minutes for server delivery.
- **Check Account:** Log in to "My Bookings" on the website. If it''s there, you are confirmed.
- **Typo:** You might have entered the wrong email. Contact support to update it.

## 2. Payment Failed but Money Deducted
- **Do not panic.** This is a common banking glitch.
- **Auto-Refund:** Usually reversed by bank in 24-48 hours.
- **Status Check:** If we received the money, your booking will be confirmed manually. Send us the transaction ID/screenshot.

## 3. Cannot Find Available Rooms
- **Sold Out:** Peak dates (May/June) sell out months in advance.
- **Try Split Dates:** Try booking 1 night at a time if continuous dates aren''t available.
- **Check Nearby:** Look for properties in Sitapur or Guptkashi if Kedarnath top is full.

## 4. Website Error / Crashing
- **Clear Cache:** Clear browser cache and cookies.
- **Incognito:** Try opening in Incognito/Private mode.
- **App:** Try using our mobile app instead.
- **Internet:** Ensure stable connection.

## 5. Double Booking
- If you accidentally booked twice:
- Contact support immediately (within 2 hours).
- We will cancel the duplicate and process a full refund.

## 6. Property Denied Check-in?
- This is extremely rare.
- **Show Confirmation:** Show the email/SMS booking ID.
- **Call Us:** Call our priority support line immediately: +91 98765 43210.
- We will resolve it on the spot or provide an upgrade.

## Need Human Help?
- **Raise a Ticket:** Go to Support > Raise Ticket.
- **Email:** support@staykedarnath.com
- **WhatsApp:** +91 98765 43210

We resolve 95% of issues within 1 hour!',
  true,
  105,
  15
FROM help_categories WHERE slug = 'bookings-payments';
