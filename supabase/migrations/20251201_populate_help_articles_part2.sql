-- Populate Help Center with Comprehensive Articles (Part 2)
-- Articles 6-10

-- Article 6: Resetting Your Password
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
FROM help_categories WHERE slug = 'account-help';

-- Article 7: Check-in and Check-out Times
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'check-in-check-out-times',
  'Standard Check-in and Check-out Policies',
  '# Check-in & Check-out Policies

To ensure a smooth experience for all guests, please adhere to the standard timings.

## Standard Timings

- **Check-in Time:** 12:00 PM (Noon)
- **Check-out Time:** 10:00 AM

*Note: Specific properties may have slightly different timings. Please check your booking confirmation email for exact details.*

## Early Check-in

Arriving early? Here''s what you need to know:

- **Subject to Availability:** Early check-in depends on whether the room is ready and vacant.
- **0-2 Hours Early:** Usually complimentary (if available).
- **2-6 Hours Early:** May incur a half-day charge.
- **Before 6:00 AM:** Requires booking the room for the previous night.

**Recommendation:** Contact the property 24 hours in advance to request early check-in.

## Late Check-out

Need more time?

- **Subject to Availability:** Depends on incoming bookings.
- **Up to 1 Hour Late:** Usually complimentary (request required).
- **1-6 Hours Late:** Half-day charge applies.
- **After 4:00 PM:** Full-day charge applies.

## Luggage Storage

If you arrive early or have a late departure:
- Most properties offer **free luggage storage** at the reception.
- You can safely leave your bags and visit the temple or explore the market.
- Please carry valuables (cash, jewelry, electronics) with you.

## 24-Hour Front Desk

- Most properties in Kedarnath operate a 24-hour front desk to accommodate late arrivals due to trekking schedules.
- If you expect to arrive **after 8:00 PM**, please inform the property or our support team so they hold your room.

## ID Proof Requirement

**Mandatory for all guests (adults):**
- Aadhar Card
- Voter ID
- Driving License
- Passport

*PAN Cards are generally NOT accepted as valid address proof.*

## Questions?
Contact the property directly using the number in your booking confirmation, or reach out to StayKedar support.',
  true,
  92,
  7
FROM help_categories WHERE slug = 'bookings-payments';

-- Article 8: Property Rules and Guest Conduct
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'property-rules-guest-conduct',
  'Property Rules & Guest Conduct',
  '# Property Rules & Guest Conduct

Kedarnath is a sacred pilgrimage site. We ask all guests to respect the sanctity of the location and the comfort of other pilgrims.

## General Rules

1. **No Smoking / No Alcohol:**
   - Consumption of alcohol and non-vegetarian food is **strictly prohibited** in Kedarnath.
   - Smoking is not allowed inside rooms. Please use designated outdoor areas.

2. **Quiet Hours:**
   - **10:00 PM to 6:00 AM** are quiet hours.
   - Please keep noise levels low to allow other pilgrims to rest, especially those trekking early.

3. **Visitors:**
   - For security reasons, unregistered visitors are generally not allowed in guest rooms.
   - Please meet visitors in the lobby or common areas.

4. **Damage to Property:**
   - Guests are responsible for any damage caused to property assets (furniture, linen, electronics).
   - Charges for damages will be billed to the guest.

## Cleanliness & Hygiene

- Please use dustbins and do not litter in the beautiful Himalayan surroundings.
- Do not wash clothes in the bathroom unless facilities are provided.
- Please turn off heaters and geysers when leaving the room to save electricity.

## Safety & Security

- **Lock Your Doors:** Always lock your room when leaving.
- **Valuables:** The management is not responsible for loss of valuables kept in the room. Please use lockers if available or carry them with you.
- **Heaters:** Do not cover room heaters with clothes to dry them – this is a major fire hazard.

## Child Policy

- Children under 5 years usually stay free (sharing bed with parents).
- Children 5-12 years may be charged for an extra mattress/bed.
- Children 12+ are considered adults.

## Pet Policy

- Most properties in Kedarnath are **NOT pet-friendly** due to the terrain and temple regulations.
- Please check the specific property details before bringing a pet.

## Violation of Rules

- Serious violations (alcohol, disturbance, illegal activities) may result in **immediate eviction** without refund.
- We cooperate fully with local authorities to maintain the sanctity of the Dham.

Thank you for your cooperation in keeping Kedarnath peaceful and clean! 🙏',
  true,
  88,
  8
FROM help_categories WHERE slug = 'bookings-payments';

-- Article 9: Best Time to Visit Kedarnath
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
FROM help_categories WHERE slug = 'travel-guide';

-- Article 10: How to Reach Kedarnath
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
FROM help_categories WHERE slug = 'travel-guide';
