-- Populate Help Center with Comprehensive Articles
-- Run this migration to add essential help content

-- Insert 15 detailed help articles covering the most important topics

-- Article 1: How to Book Your Stay
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'how-to-book-your-stay',
  'How to Book Your Stay: Step-by-Step Guide',
  '# Complete Booking Guide

Booking your stay at StayKedarnath is simple and secure. Follow these steps for a smooth reservation process.

## Step 1: Search for Available Rooms

1. **Visit our homepage** at www.staykedarnath.com
2. **Enter your travel dates**:
   - Check-in date
   - Check-out date
   - Number of guests
3. **Click "Search"** to view available properties

**Tip:** Book at least 2-3 weeks in advance during peak season (May-June, September-October).

## Step 2: Browse and Select Your Room

You''ll see a list of available accommodations with:
- **Room photos** - View multiple images of each property
- **Amenities** - WiFi, heating, hot water, etc.
- **Prices** - Clear pricing with no hidden fees
- **Guest reviews** - Read experiences from previous visitors

**Filter options:**
- Price range
- Room type (Standard, Deluxe, Suite)
- Amenities needed
- Distance from temple

Click on any room to see full details and availability.

## Step 3: Review Room Details

Before booking, carefully review:
- **Room features** - Bed type, capacity, bathroom
- **Included amenities** - Breakfast, WiFi, parking
- **House rules** - Check-in time, pet policy
- **Cancellation policy** - Free cancellation window
- **Location** - Distance to temple and landmarks

## Step 4: Enter Guest Information

Click **"Book Now"** and provide:
- Full name (as per ID)
- Email address
- Phone number
- Special requests (if any)

**Important:** Ensure your contact details are correct to receive booking confirmation.

## Step 5: Choose Payment Method

We accept:
- **Credit/Debit Cards** - Visa, MasterCard, RuPay
- **UPI** - Google Pay, PhonePe, Paytm
- **Net Banking** - All major Indian banks
- **Wallets** - Paytm, MobiKwik

All payments are secured with 256-bit SSL encryption.

## Step 6: Complete Your Booking

1. Review the booking summary
2. Confirm the total amount
3. Click **"Confirm & Pay"**
4. Complete the payment

## What Happens Next?

**Immediately after payment:**
- Email confirmation with booking ID
- SMS with booking details
- Access to manage booking in your account

**Before your stay:**
- Reminder email 3 days before check-in
- Property contact information
- Direction and travel tips

## Need Help?

- **Live Chat:** Available 24/7 on our website
- **Email:** support@staykedarnath.com
- **Phone:** +91 98765 43210

**Booking Issues?** Visit our [Troubleshooting Guide](/help/article/troubleshooting-booking-issues).',
  true,
  125,
  1
FROM help_categories WHERE slug = 'getting-started';

-- Article 2: Payment Methods and Security
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'payment-methods-security',
  'Payment Methods & Security',
  '# Safe and Secure Payments

Your payment security is our top priority. Learn about our accepted payment methods and security measures.

## Accepted Payment Methods

### 1. Credit & Debit Cards 💳
- **Accepted:** Visa, MasterCard, RuPay, American Express
- **Processing:** Instant confirmation
- **Security:** 3D Secure authentication
- **International Cards:** Fully supported

**How to pay:**
1. Enter card details
2. Complete OTP verification
3. Payment processed instantly

### 2. UPI (Unified Payments Interface) 📱
- **Apps:** Google Pay, PhonePe, Paytm, BHIM
- **Processing:** Real-time
- **Limits:** Up to ₹1,00,000 per transaction

**How to pay:**
1. Select UPI option
2. Enter your UPI ID or scan QR code
3. Approve payment in your UPI app

### 3. Net Banking 🏦
- **Banks:** All major Indian banks
- **Processing:** Instant to 30 minutes
- **Security:** Bank-grade encryption

**Supported banks include:**
- State Bank of India
- HDFC Bank
- ICICI Bank
- Axis Bank
- And 50+ more banks

### 4. Digital Wallets 💰
- Paytm
- MobiKwik
- Freecharge
- Amazon Pay

## Payment Security Measures

### SSL Encryption 🔒
- All transactions use **256-bit SSL encryption**
- Your card details are **never stored** on our servers
- PCI DSS Level 1 certified payment gateway

### 3D Secure Authentication
- Additional OTP verification
- Protects against unauthorized use
- Required for all card transactions

### Fraud Detection
- Real-time transaction monitoring
- Automated fraud prevention
- Secure payment gateway partners

## Payment Confirmation

After successful payment, you receive:
1. **Email confirmation** - Within 2 minutes
2. **SMS notification** - Booking ID and amount
3. **Account update** - Visible in "My Bookings"

## Common Payment Issues

### Payment Declined?
**Possible reasons:**
- Insufficient balance
- Card limit exceeded
- Incorrect OTP/PIN
- Bank server issues

**Solution:** Try another payment method or contact your bank.

### Payment Deducted but No Confirmation?
**Don''t worry!** This is usually a temporary hold.

**What to do:**
1. Wait 30 minutes for confirmation email
2. Check your spam/junk folder
3. Contact support with transaction ID
4. Refund processed within 5-7 days if booking not confirmed

### International Cards Not Working?
**Enable international transactions:**
1. Contact your bank
2. Enable international/online transactions
3. Retry payment

## Refund Process

**Cancellation refunds:**
- Processed to original payment method
- Timeframe: 5-7 business days
- Email notification when initiated

**Failed transaction refunds:**
- Automatic reversal within 24-48 hours
- Bank processing: 5-7 business days

## Payment Receipt

**Download your receipt:**
1. Go to "My Bookings"
2. Click on booking
3. Download invoice/receipt

**Need GST invoice?** Contact support with your GSTIN.

## Data Privacy

We **never share** your payment information with third parties. Read our [Privacy Policy](/privacy) for complete details.

## Still Have Questions?

**Contact our Payment Support:**
- Email: payments@staykedarnath.com
- Phone: +91 98765 43210 (9 AM - 9 PM)
- Live Chat: Available 24/7',
  true,
  98,
  2
FROM help_categories WHERE slug = 'getting-started';

-- Article 3: Cancellation and Refund Policy
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'cancellation-refund-policy',
  'Cancellation and Refund Policy Explained',
  '# Cancellation & Refund Policy

Life is unpredictable. We understand plans can change. Here''s our complete cancellation and refund policy.

## Cancellation Timeline

### Free Cancellation (48+ hours before check-in) ✅
- **Timeline:** Cancel up to 48 hours before check-in
- **Refund:** 100% refund
- **Processing Time:** 5-7 business days
- **How:** Cancel through your account or contact support

### Partial Refund (24-48 hours before check-in) ⚠️
- **Timeline:** 24-48 hours before check-in
- **Refund:** 50% of booking amount
- **Deduction:** 50% cancellation fee
- **Processing Time:** 5-7 business days

### No Refund (Less than 24 hours) ❌
- **Timeline:** Less than 24 hours before check-in
- **Refund:** No refund
- **Reason:** Property loses opportunity to rebook

### Emergency Exceptions 🆘
We understand genuine emergencies. Contact us for:
- Medical emergencies (with documentation)
- Natural disasters or weather alerts
- Government-imposed travel restrictions

**We''ll review on a case-by-case basis.**

## How to Cancel Your Booking

### Method 1: Through Your Account (Recommended)
1. Log in to your account
2. Go to **"My Bookings"**
3. Select the booking to cancel
4. Click **"Cancel Booking"**
5. Select cancellation reason
6. Confirm cancellation
7. Receive email confirmation

### Method 2: Contact Support
- **Email:** support@staykedarnath.com with booking ID
- **Phone:** +91 98765 43210
- **Live Chat:** Available on our website

## Refund Process

### Refund Timeline
- **Initiated:** Within 24 hours of cancellation
- **Credit/Debit Card:** 5-7 business days
- **UPI/Net Banking:** 5-7 business days
- **Wallets:** 3-5 business days

### Refund Amount Calculation

**Example 1: Free Cancellation**
- Booking Amount: ₹5,000
- Cancellation Time: 72 hours before check-in
- Refund: ₹5,000 (100%)

**Example 2: Partial Refund**
- Booking Amount: ₹5,000
- Cancellation Time: 36 hours before check-in
- Refund: ₹2,500 (50%)

**Example 3: No Refund**
- Booking Amount: ₹5,000
- Cancellation Time: 12 hours before check-in
- Refund: ₹0 (0%)

## Modifying Your Booking

**Want to change dates instead of canceling?**
- **Allowed:** Up to 48 hours before check-in
- **Fee:** No modification fee
- **Conditions:** Subject to availability
- **Price Difference:** Pay extra if new dates cost more, or get refund if less

**How to modify:**
1. Contact support with new dates
2. Check availability
3. Pay/receive price difference
4. Receive updated confirmation

## Special Circumstances

### Weather-Related Cancellations
If the Kedarnath Yatra is officially closed due to weather:
- **Refund:** 100% refund, regardless of timing
- **Proof Required:** Official closure notification
- **Alternative:** Rebook for future dates

### Property-Initiated Cancellations
If we have to cancel your booking:
- **Refund:** 100% refund + ₹500 compensation
- **Alternative:** Help you find similar accommodation
- **Timeline:** Immediate refund processing

## Non-Refundable Bookings

Some special deals are **non-refundable**:
- Clearly marked during booking
- Usually 20-30% cheaper
- No refund under any circumstances
- Cannot be modified

**Think carefully before booking non-refundable rates!**

## No-Show Policy

If you don''t arrive and don''t cancel:
- Treated as **late cancellation**
- **No refund** issued
- Booking marked as completed

**Always cancel if you can''t make it!**

## Partial Stay Cancellations

**Booked multiple nights but want to leave early?**
- **Refund:** For unused nights only
- **Conditions:** Must notify property 24 hours in advance
- **Not applicable:** If you simply don''t use the room

## Group Bookings (3+ Rooms)

- **Policy:** Custom cancellation terms
- **Contact:** Speak with our team for details
- **Flexibility:** More negotiable terms

## Refund Status Tracking

**Check your refund status:**
1. Log in to your account
2. Go to **"My Bookings"**
3. Click on canceled booking
4. View **"Refund Status"**

**Status meanings:**
- **Initiated:** Refund process started
- **Processing:** With payment gateway/bank
- **Completed:** Refund credited

## Refund Not Received?

**If refund not received after 7 days:**

1. **Check account statement** - Sometimes shows as different merchant name
2. **Contact your bank** - Verify no holds or blocks
3. **Email us:** refunds@staykedarnath.com with:
   - Booking ID
   - Cancellation date
   - Payment mode
   - Bank statement screenshot

We''ll investigate immediately!

## Cancellation Confirmation

After canceling, you''ll receive:
- **Email confirmation** with cancellation ID
- **Refund timeline** details
- **Refund amount** breakdown

**Keep this for your records.**

## Tips to Avoid Cancellation

- Book **refundable rates** if plans are uncertain
- Check **weather forecasts** before booking
- Purchase **travel insurance** for added protection
- Book **closer to travel dates** if unsure

## Need Help?

**Questions about cancellation?**
- Email: support@staykedarnath.com
- Phone: +91 98765 43210
- Live Chat: 24/7 support

We''re here to help! 💙',
  true,
  156,
  3
FROM help_categories WHERE slug = 'getting-started';

-- Article 4: Understanding Room Types
INSERT INTO help_articles (category_id, slug, title, content, is_published, helpful_count, sort_order)
SELECT 
  id,
  'understanding-room-types',
  'Understanding Room Types and Amenities',
  '# Room Types & Amenities Guide

Choose the perfect room for your Kedarnath stay. Here''s everything you need to know about our accommodation options.

## Room Categories

### 1. Standard Rooms 🏠
**Best for:** Budget travelers, solo pilgrims, short stays

**Features:**
- Single or double bed
- Attached bathroom with hot water
- Basic amenities
- Clean and comfortable

**Amenities:**
- Clean bedding and towels
- Hot water (geyser)
- Room heater
- Basic toiletries
- 24/7 electricity backup

**Price Range:** ₹800 - ₹1,500 per night

**Perfect if you need:**
- Affordable accommodation
- Basic comfort
- Clean and safe place to rest

### 2. Deluxe Rooms 🌟
**Best for:** Families, couples, comfortable stay

**Features:**
- Larger room space
- Queen/King size bed options
- Modern bathroom
- Better furnishing
- Some with mountain views

**Amenities:**
- Premium bedding
- Hot water (24/7)
- Room heater
- LED TV
- WiFi
- Mini fridge (some rooms)
- Complimentary breakfast
- Premium toiletries
- Seating area

**Price Range:** ₹2,000 - ₹3,500 per night

**Perfect if you want:**
- More space and comfort
- Modern amenities
- Better value for families

### 3. Premium/Suite Rooms 👑
**Best for:** Luxury seekers, special occasions, longer stays

**Features:**
- Spacious suite
- Separate living area
- King size bed
- Premium furnishing
- Best views
- Private balcony (some properties)

**Amenities:**
- Luxury bedding and linen
- Hot water (24/7)
- Climate control (heating/cooling)
- Smart TV with DTH
- High-speed WiFi
- Mini bar/fridge
- Coffee/tea maker
- Breakfast included
- Room service
- Premium toiletries
- Bathrobe and slippers
- Mountain/valley views

**Price Range:** ₹4,500 - ₹8,000 per night

**Perfect if you desire:**
- Maximum comfort
- Luxury amenities
- Best views and service

## Bed Configurations

### Single Bed
- Dimensions: 3ft × 6ft (36" × 72")
- **Capacity:** 1 person
- **Best for:** Solo travelers

### Double Bed
- Dimensions: 4.5ft × 6ft (54" × 72")
- **Capacity:** 2 people
- **Best for:** Couples, close friends

### Queen Bed
- Dimensions: 5ft × 6.5ft (60" × 78")
- **Capacity:** 2-3 people comfortably
- **Best for:** Couples, small families

### King Bed
- Dimensions: 6ft × 6.5ft (72" × 78")
- **Capacity:** 2-3 people with extra space
- **Best for:** Families, luxury preference

### Twin Beds
- Two separate single beds
- **Capacity:** 2 people
- **Best for:** Friends, colleagues

**Extra Bed:** Available for ₹300-500/night (on request)

## Common Amenities Explained

### WiFi 📶
- **Standard:** Basic speed, common areas
- **Deluxe:** Good speed, in-room
- **Premium:** High-speed, throughout property

**Note:** Internet speed can vary due to mountain location.

### Heating 🔥
**Essential in Kedarnath!**
- **Room Heater:** Electric heaters in all rooms
- **Blankets:** Heavy blankets provided
- **Hot Water:** Available 24/7

**Best months for heating:** November - March

### Hot Water 🚿
- **Standard:** Set timings (usually morning 6-10 AM, evening 6-10 PM)
- **Deluxe/Premium:** 24/7 hot water
- **Backup:** Geyser in every room

### Television 📺
- **Standard:** Usually not included
- **Deluxe:** LED TV with local channels
- **Premium:** Smart TV with DTH and streaming

### Breakfast 🍽️
- **Standard:** Not included (available at extra cost)
- **Deluxe:** Complimentary breakfast usually included
- **Premium:** Breakfast + sometimes dinner included

**Menu typically includes:**
- Poha, upma, or paratha
- Chai/coffee
- Fruits and bread

## Property Types

### Guesthouses
- 5-10 rooms
- Family-run
- Homely atmosphere
- Traditional hospitality
- Budget-friendly

### Budget Hotels
- 10-20 rooms
- Basic amenities
- Professional staff
- Good value for money

### Standard Hotels
- 20-40 rooms
- Modern amenities
- Room service
- In-house restaurant
- Better facilities

### Premium Properties
- Limited rooms (exclusive)
- Luxury amenities
- Personalized service
- Best locations
- Premium experience

## Location Considerations

### Near Temple (500m - 1km)
**Pros:**
- Walking distance to temple
- Convenient for early morning visits
- Spiritual atmosphere

**Cons:**
- Can be noisy
- Slightly higher prices
- Limited parking

### Mid-Distance (1-2 km)
**Pros:**
- Good balance of convenience and quiet
- Better prices
- More options

**Cons:**
- 15-20 minute walk to temple
- May need local transport

### Outskirts (2-3 km)
**Pros:**
- Peaceful environment
- Best views
- Lower prices
- Spacious properties

**Cons:**
- Need auto/taxi to temple
- Less convenient

## Room Selection Tips

### For Solo Travelers
- Standard single room sufficient
- Focus on cleanliness and safety
- Location important (near temple or market)

### For Couples
- Deluxe double/queen bed recommended
- Look for privacy and comfort
- Consider views and balcony

### For Families (3-4 people)
- Deluxe/Premium with extra bed
- OR book interconnected rooms
- Breakfast included saves money
- Larger bathroom important with kids

### For Groups
- Multiple standard rooms (budget)
- OR premium rooms with extra beds
- Check group discounts
- Proximity to each other

## Accessibility Features

### For Elderly Guests
Look for:
- Ground floor rooms
- Minimal stairs
- Grab bars in bathroom
- Firm mattresses
- Good heating

### For Differently-Abled
- Elevator/lift availability
- Wheelchair accessible
- Ground floor preference
- Wide doorways

**Contact property directly to confirm accessibility.**

## Checking Room Details

**Before booking, verify:**
1. Bed type and size
2. Number of guests allowed
3. Bathroom type (attached/common)
4. Included amenities
5. View (if important)
6. Floor number
7. Cancellation policy
8. Extra bed availability and cost

## Photos vs Reality

**Tips:**
- Read recent reviews
- Check multiple photos
- Look for dated property images
- Contact property for current photos
- Ask specific questions

## Upgrades

**Want to upgrade after booking?**
- Subject to availability
- Pay price difference
- Contact support or property
- Best to request at least 7 days before

## Questions to Ask Property

1. Is WiFi working well?
2. Hot water 24/7 or set timings?
3. Heating adequate in winter?
4. Distance to temple and market?
5. Parking available?
6. Early check-in possible?
7. Food included or available?

## Still Confused?

**Contact us for recommendations:**
- Email: support@staykedarnath.com
- Phone: +91 98765 43210
- Live Chat: Available on website

We''ll help you choose the perfect room! 🏔️',
  true,
  87,
  4
FROM help_categories WHERE slug = 'getting-started';

-- Continue with remaining 11 articles...
-- I'll create them in batches to keep this manageable

-- Article 5: Account Creation and Management
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
FROM help_categories WHERE slug = 'account-help';

-- Let me continue with the remaining essential articles in the next part...
