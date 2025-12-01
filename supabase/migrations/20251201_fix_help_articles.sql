-- Fix missing categories and articles

-- 1. Create 'Travel Guide' category if it doesn't exist
INSERT INTO help_categories (name, slug, description, icon, sort_order)
VALUES ('Travel Guide', 'travel-guide', 'Essential guides for your Kedarnath Yatra.', 'Map', 2)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert missing articles with CORRECT category slugs

-- Article 5: Account Creation and Management (Corrected category: account-profile)
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'account-creation-management',
  'Creating and Managing Your Account',
  '# Account Management Guide

Create and manage your StayKedar account for a seamless booking experience.

## Why Create an Account?

### Benefits:
- **Faster bookings** - Save your details
- **Track bookings** - All in one place
- **Manage reservations** - Cancel or modify easily
- **Save favorites** - Bookmark properties
- **Special offers** - Exclusive member deals
- **Booking history** - Easy re-booking
- **Support tickets** - Track issues

## Creating Your Account

### Method 1: During Checkout (Recommended)
1. Start booking any property
2. Enter guest details
3. Check "Create account"
4. Set password
5. Complete booking
6. Account created automatically!

### Method 2: Before Booking
1. Click **"Sign Up"** in top menu
2. Enter your details:
   - Full Name
   - Email Address
   - Phone Number
   - Password (min 8 characters)
3. Click **"Create Account"**
4. Verify email (check inbox)
5. Start booking!

### Method 3: Social Login
**Quick signup with:**
- Google account
- Facebook account

Simply click the icon and authorize!

## Email Verification

**After signup:**
1. Check your email inbox
2. Find email from "StayKedar Registration"
3. Click verification link
4. Account activated!

**Didn''t receive email?**
- Check spam/junk folder
- Wait 5-10 minutes
- Request new verification link
- Check email spelling

## Profile Information

### Edit Your Profile
1. Log in to your account
2. Click profile icon (top right)
3. Select **"My Profile"**
4. Update information:
   - Name
   - Phone number
   - Email (requires re-verification)
   - Profile photo
   - Communication preferences

**Save changes when done.**

## Password Management

### Creating Strong Password
Requirements:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Special characters recommended

**Examples:**
- ❌ Weak: "password123"
- ❌ Better: "Password123"
- ✅ Strong: "Kedar@2024#Trip"

### Changing Your Password
1. Go to **"My Profile"**
2. Click **"Change Password"**
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click **"Update"**

**You''ll be logged out and need to log in again with new password.**

### Forgot Password?
1. Go to login page
2. Click **"Forgot Password?"**
3. Enter your email
4. Check email for reset link
5. Click link (valid for 1 hour)
6. Enter new password
7. Confirm and save

**Didn''t receive reset email?**
- Check spam folder
- Try again with correct email
- Contact support if issue persists

## Managing Bookings

### View All Bookings
1. Log in
2. Go to **"My Bookings"**
3. See all current and past reservations

**Booking cards show:**
- Property name and photo
- Check-in/out dates
- Booking status
- Booking ID
- Total amount paid

### Booking Status Explained
- **Confirmed** ✅ - All set! Awaiting check-in
- **Pending** ⏳ - Payment processing
- **Cancelled** ❌ - Booking cancelled
- **Completed** ✓ - Stay finished
- **Refunded** 💰 - Refund processed

### Managing Individual Booking
Click any booking to:
- View full details
- Download invoice
- Cancel booking
- Contact property
- Modify booking
- Add review (after stay)
- Raise support ticket

## Communication Preferences

### Email Notifications
**You can opt in/out:**
- Booking confirmations (Always sent)
- Promotional emails
- Travel tips and guides
- Special offers
- Newsletter

**To update:**
1. Go to **"Settings"**
2. Select **"Notifications"**
3. Toggle preferences
4. Save changes

### SMS Notifications
**Receive SMS for:**
- Booking confirmation
- Check-in reminders
- Important updates
- OTP for verification

**To disable:**
- Contact support (some SMS mandatory)

## Privacy Settings

### Data Visibility
Control what''s visible:
- Profile information
- Booking history
- Reviews and ratings

### Data Export
**Download your data:**
1. Go to **"Privacy Settings"**
2. Click **"Download My Data"**
3. Receive email with data file

### Account Deletion
**To permanently delete account:**
1. Go to **"Settings"**
2. Scroll to **"Delete Account"**
3. Read warnings carefully
4. Enter password to confirm
5. Click **"Delete Permanently"**

**Warning:**
- This action is irreversible
- All bookings will be cancelled
- No refunds for future bookings
- Data deleted within 30 days

**Better option:** Contact support to deactivate temporarily.

## Saved Addresses

**Add multiple addresses:**
- Home
- Office
- Billing address
- Shipping address (if ordering)

**Quick select during booking!**

## Payment Methods

### Save Cards (Secure)
- Save cards for faster checkout
- Only last 4 digits stored
- CVV never saved
- Remove anytime

**How to add:**
During payment, check "Save for future use"

**Remove saved card:**
1. Go to **"Payment Methods"**
2. Click card to remove
3. Confirm deletion

## Loyalty Program

### Earn Points
- Every booking earns points
- 1 point = ₹1 spent
- 100 points = ₹10 discount

### Redeem Points
- Use during checkout
- Minimum 500 points
- Maximum 50% of booking value

### Tier Benefits
- **Silver:** 0-5,000 points
- **Gold:** 5,001-15,000 points
- **Platinum:** 15,000+ points

**Higher tiers get:**
- Better discounts
- Early access to sales
- Free upgrades (subject to availability)

## Support Tickets

### Raise a Ticket
1. Go to **"Support"**
2. Click **"Raise Ticket"**
3. Select issue category
4. Describe problem
5. Attach documents if needed
6. Submit

### Track Ticket Status
- View all tickets in "Support" section
- Receive email updates
- Add replies and updates

## Account Security

### Two-Factor Authentication (2FA)
**Enable for extra security:**
1. Go to **"Security Settings"**
2. Enable 2FA
3. Choose method (SMS/Email/App)
4. Verify setup
5. Save backup codes

**When enabled, you''ll need:**
- Password + OTP to login

### Login History
**Monitor account activity:**
- See recent logins
- Device information
- Location and time
- Logout remotely if suspicious

## Mobile App

**Download our app for:**
- Faster access
- Push notifications
- Easy booking management
- Exclusive app-only deals

**Available on:**
- Google Play Store
- Apple App Store

**Same account works on web and app!**

## Troubleshooting

### Can''t Login?
**Check:**
- Correct email/phone
- Correct password (case-sensitive)
- Email verified
- Account not deleted

**Try:**
- Reset password
- Clear browser cache
- Try different browser
- Contact support

### Account Locked?
**Happens after 5 failed login attempts.**

**Solution:**
- Wait 30 minutes, try again
- OR reset password immediately

### Email Not Updating?
**Verify the new email before old one is replaced.**

### Phone Number Issues?
Make sure:
- Include country code (+91)
- No spaces or special characters
- Number not already registered

## Need Help?

**Contact our support team:**
- Email: accounts@staykedarnath.com
- Phone: +91 98765 43210
- Live Chat: 24/7

We''re here to help! 👤',
  true,
  73,
  5
FROM help_categories WHERE slug = 'account-profile'
ON CONFLICT (slug) DO NOTHING;

-- Article 6: Resetting Your Password (Corrected category: account-profile)
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'resetting-your-password',
  'How to Reset Your Password',
  '# Resetting Your Password

Forgot your password? Don''t worry, it happens! Here''s how to securely reset it and regain access to your account.

## Method 1: Using the "Forgot Password" Link

1. Go to the **Login Page**.
2. Click on the **"Forgot Password?"** link below the login form.
3. Enter your registered **Email Address**.
4. Click **"Send Reset Link"**.
5. Check your email inbox for a message from StayKedar.
6. Click the **"Reset Password"** link in the email.
   - *Note: This link expires in 1 hour for security.*
7. Enter your **New Password** and confirm it.
8. Click **"Save Password"**.

You can now log in with your new password!

## Method 2: While Logged In (Changing Password)

If you know your current password but want to change it:

1. Log in to your account.
2. Go to **My Profile** > **Settings**.
3. Select **"Change Password"**.
4. Enter your **Current Password**.
5. Enter your **New Password**.
6. Click **"Update Password"**.

## Troubleshooting Password Reset

### Didn''t receive the email?
- **Check Spam/Junk Folder:** Sometimes automated emails land there.
- **Wait 5-10 Minutes:** Email delivery can occasionally be delayed.
- **Verify Email Address:** Ensure you entered the correct email associated with your account.
- **Resend Link:** You can request a new link after 2 minutes.

### "Link Expired" Error?
- The reset link is valid for only 1 hour. If it expires, simply request a new one using the "Forgot Password" page.

### Account Locked?
- For security, your account may be temporarily locked after multiple incorrect login attempts.
- Wait **30 minutes** and try again, or reset your password to unlock it immediately.

## Tips for a Strong Password
- Use at least **8 characters**.
- Include a mix of **uppercase** and **lowercase** letters.
- Include **numbers** and **special symbols** (@, #, $, etc.).
- Avoid using common words or personal info like birthdays.

## Still Can''t Access Your Account?
If you''re still facing issues, please contact our support team:
- **Email:** support@staykedarnath.com
- **Live Chat:** Available 24/7',
  true,
  65,
  6
FROM help_categories WHERE slug = 'account-profile'
ON CONFLICT (slug) DO NOTHING;

-- Article 9: Best Time to Visit Kedarnath (Corrected category: travel-guide)
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'best-time-to-visit',
  'Best Time to Visit Kedarnath: A Monthly Guide',
  '# Best Time to Visit Kedarnath

Planning your Yatra? Choosing the right time is crucial for a safe and comfortable journey. The temple is open only for 6 months a year (approx. May to November).

## Peak Season (May - June) ☀️
**Crowd:** High | **Weather:** Pleasant

- **Pros:**
  - Snow has melted, paths are clear.
  - Pleasant daytime temperatures (10°C to 15°C).
  - Ideal for trekking.
- **Cons:**
  - Very crowded; long queues for darshan.
  - Accommodation prices are highest.
  - Helicopter tickets sell out instantly.

## Monsoon Season (July - August) 🌧️
**Crowd:** Low | **Weather:** Rainy & Risky

- **Pros:**
  - Lush green landscapes and waterfalls.
  - Less crowd; quick darshan.
  - Cheaper accommodation.
- **Cons:**
  - **High Risk:** Landslides and roadblocks are common.
  - Helicopter services often suspended.
  - Trekking path becomes slippery and dangerous.
  - **Not recommended for elderly or first-timers.**

## Post-Monsoon / Autumn (September - October) 🍂
**Crowd:** Moderate | **Weather:** Clear & Crisp

- **Pros:**
  - **Best Time:** Clear skies, stunning views of peaks.
  - Moderate crowd compared to May/June.
  - Stable weather for helicopters.
- **Cons:**
  - Nights start getting very cold (sub-zero).
  - Need heavy woolens.

## Closing Time (Late October - Early November) ❄️
**Crowd:** High (Diwali time) | **Weather:** Very Cold

- **Pros:**
  - Witness the closing ceremony (Samadhi Puja).
  - Festive atmosphere.
- **Cons:**
  - Extreme cold; temperatures drop to -5°C or lower.
  - Risk of early snowfall blocking paths.

## Summary Table

| Month | Weather | Crowd | Recommendation |
| :--- | :--- | :--- | :--- |
| **May** | Pleasant | Very High | Book 2 months ahead |
| **June** | Pleasant | High | Book early |
| **July** | Rainy | Low | Avoid if possible |
| **August** | Rainy | Low | Avoid if possible |
| **Sept** | Clear/Cold | Moderate | **Highly Recommended** |
| **Oct** | Cold | Moderate | **Highly Recommended** |
| **Nov** | Freezing | High | For closing ceremony |

## Winter (November - April)
- **Temple Closed.**
- The deity is moved to Ukhimath.
- Kedarnath is covered in deep snow and inaccessible.

**Verdict:** For the best balance of weather and safety, aim for **mid-September to mid-October**.',
  true,
  145,
  9
FROM help_categories WHERE slug = 'travel-guide'
ON CONFLICT (slug) DO NOTHING;

-- Article 10: How to Reach Kedarnath (Corrected category: travel-guide)
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'how-to-reach-kedarnath',
  'How to Reach Kedarnath: Route & Transport Guide',
  '# How to Reach Kedarnath

Reaching Kedarnath involves a combination of road travel and a steep trek. Here is the complete route guide.

## Step 1: Reach Haridwar or Rishikesh
These are the gateway cities to the Char Dham Yatra.
- **By Train:** Nearest railway station is **Haridwar (HW)** or **Rishikesh (RKSH)**.
- **By Air:** Nearest airport is **Jolly Grant Airport, Dehradun (DED)**.
- **By Bus:** Direct buses available from Delhi ISBT Kashmere Gate to Haridwar/Rishikesh.

## Step 2: Road Journey to Sonprayag/Gaurikund
From Haridwar/Rishikesh, you need to travel by road to **Sonprayag**.

- **Route:** Haridwar → Rishikesh → Devprayag → Srinagar → Rudraprayag → Guptkashi → Sonprayag.
- **Distance:** Approx. 210-230 km.
- **Travel Time:** 8-10 hours (Mountain roads).
- **Transport:**
  - **Bus:** GMOU and Roadways buses available (early morning).
  - **Taxi:** Private taxis or shared jeeps (Maxx/Bolero).

*Note: Private vehicles are usually stopped at Sonprayag. You must take a local shared jeep from Sonprayag to Gaurikund (5 km).*

## Step 3: The Trek (Gaurikund to Kedarnath)
The motorable road ends at **Gaurikund**. From here, the trek begins.

- **Trek Distance:** Approx. 16-18 km.
- **Difficulty:** Moderate to Steep.
- **Time Required:** 6-9 hours (uphill).

### Trekking Options:
1. **By Foot:** Free. Requires good fitness.
2. **Pony/Mule (Kandi):** Available at Gaurikund booking counter.
   - Cost: ₹2500 - ₹3500 (one way).
3. **Palki/Dandi:** Carried by 4 porters.
   - Cost: ₹8000 - ₹12000 (depending on weight).
4. **Pitthu:** Porter carries your bag or small child.

## Step 4: Helicopter Option
Skip the trek by flying from Guptkashi, Phata, or Sersi.

- **Flight Time:** 7-10 minutes.
- **Landing:** Kedarnath Helipad (500m from temple).
- **Booking:** Must be done online via IRCTC HeliYatra website.

## Important Route Tips
- **Start Early:** Start the road journey from Haridwar by 5:00 AM to reach Sonprayag by evening.
- **Night Driving:** Avoid driving at night in the hills.
- **Registration:** Char Dham Yatra Registration (e-Pass) is mandatory. Check points are at Haridwar and Sonprayag.
- **Acclimatization:** Don''t rush. Take breaks to adjust to the altitude.

**Safe Travels!**',
  true,
  110,
  10
FROM help_categories WHERE slug = 'travel-guide'
ON CONFLICT (slug) DO NOTHING;

-- Article 11: Weather Updates and Packing List (Corrected category: travel-guide)
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
FROM help_categories WHERE slug = 'travel-guide'
ON CONFLICT (slug) DO NOTHING;

-- Article 12: Helicopter Booking Guide (Corrected category: travel-guide)
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
FROM help_categories WHERE slug = 'travel-guide'
ON CONFLICT (slug) DO NOTHING;

-- Article 13: Safety Tips for Yatra (Corrected category: travel-guide)
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
FROM help_categories WHERE slug = 'travel-guide'
ON CONFLICT (slug) DO NOTHING;

-- Article 14: Medical Facilities (Corrected category: travel-guide)
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
FROM help_categories WHERE slug = 'travel-guide'
ON CONFLICT (slug) DO NOTHING;
