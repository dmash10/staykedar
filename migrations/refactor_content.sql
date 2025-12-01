-- Split "Best Time to Visit Kedarnath" into modular articles

-- 1. Get the category ID for "Travel Guide" (assuming it exists, or we'll use the one from the existing article)
DO $$
DECLARE
    travel_guide_id UUID;
    bookings_id UUID;
BEGIN
    -- Find category IDs (adjust names if needed based on your actual data)
    SELECT id INTO travel_guide_id FROM help_categories WHERE slug = 'travel-guide' LIMIT 1;
    SELECT id INTO bookings_id FROM help_categories WHERE slug = 'bookings' LIMIT 1;

    -- If categories don't exist, we might need to create them or handle it. 
    -- For now, assuming they exist as per previous migrations.

    ---------------------------------------------------------
    -- SPLIT: Best Time to Visit Kedarnath
    ---------------------------------------------------------
    -- Delete the old long article
    DELETE FROM help_articles WHERE slug = 'best-time-to-visit-kedarnath';

    -- Insert new modular articles
    INSERT INTO help_articles (category_id, title, slug, content, is_published, helpful_count)
    VALUES 
    (travel_guide_id, 'Peak Season Guide (May-June)', 'peak-season-guide-may-june', 
    '# Peak Season: May & June ☀️
    
    The temple doors open in **May**, marking the start of the Char Dham Yatra. This is the most popular time to visit.
    
    ## Weather & Atmosphere
    - **Temperature**: Pleasant 10°C to 15°C during the day.
    - **Sky**: Mostly clear, offering stunning views of the Kedar Dome.
    - **Snow**: Remnants of winter snow can still be seen in early May.
    
    ## What to Expect
    - **Crowds**: Extremely high. Expect long queues for Darshan (4-10 hours).
    - **Costs**: Helicopter tickets and hotels are at their peak prices.
    - **Booking**: Must book 2-3 months in advance.
    
    ## Verdict
    Best for those who want safe weather and don''t mind crowds.', true, 120),

    (travel_guide_id, 'Monsoon Travel Risks (July-August)', 'monsoon-travel-risks-july-august',
    '# Monsoon Season: July & August 🌧️
    
    As the rains arrive, the valley turns lush green, but the journey becomes perilous.
    
    ## The Risks
    - **Landslides**: Frequent roadblocks on the Rudraprayag-Gaurikund highway.
    - **Slippery Trek**: The 16km trek becomes muddy and slippery.
    - **Helicopters**: Services are often suspended due to low visibility.
    
    ## The Rewards
    - **Solitude**: Very few pilgrims. You can have a quick Darshan.
    - **Scenery**: Waterfalls are in full flow, and the valley is vibrant.
    - **Cost**: Lowest prices for hotels.
    
    ## Verdict
    **Not recommended** for first-timers, elderly, or families. Only for experienced trekkers who can handle delays.', true, 45),

    (travel_guide_id, 'Post-Monsoon & Closing (Sept-Oct)', 'post-monsoon-autumn-september-october',
    '# Autumn: September & October 🍂
    
    After the rains recede, Kedarnath offers the clearest views of the year before closing for winter.
    
    ## Weather
    - **Crisp & Cold**: Days are sunny but nights drop to sub-zero.
    - **Views**: Crystal clear skies. The peaks look majestic.
    
    ## Closing Ceremony
    - The temple usually closes on **Bhai Dooj** (late Oct or early Nov).
    - The closing ceremony is a grand event with flowers and music.
    
    ## Verdict
    **Highly Recommended**. It balances good weather with manageable crowds (though crowds increase near closing).', true, 95);


    ---------------------------------------------------------
    -- SPLIT: Cancellation & Refund Policy
    ---------------------------------------------------------
    -- Delete the old long article
    DELETE FROM help_articles WHERE slug = 'cancellation-and-refund-policy';

    -- Insert new modular articles
    INSERT INTO help_articles (category_id, title, slug, content, is_published, helpful_count)
    VALUES
    (bookings_id, 'Free Cancellation Policy', 'free-cancellation-policy',
    '# Free Cancellation Window ✅
    
    You can cancel your booking for free if you act in time.
    
    ## The Rule
    - **Timeframe**: Up to **48 hours** before your scheduled check-in time.
    - **Refund**: 100% of the booking amount.
    - **Processing Time**: 5-7 business days to your original payment method.
    
    ## How to Cancel
    1. Go to **My Bookings**.
    2. Select your trip.
    3. Click **Cancel Booking**.
    
    If you cancel within 48 hours, standard charges apply. See [Partial Refunds](/help/article/partial-refund-policy).', true, 340),

    (bookings_id, 'Partial Refunds & Late Cancellations', 'partial-refund-policy',
    '# Late Cancellations ⚠️
    
    Life happens, but late cancellations hurt hotel operations. Here is how we handle them.
    
    ## 24-48 Hours Before Check-in
    - **Refund**: 50% of the booking amount.
    - **Fee**: 50% cancellation fee.
    
    ## Less than 24 Hours
    - **Refund**: **No Refund** (0%).
    - **Reason**: The room cannot be re-booked at such short notice.
    
    ## Emergency Exceptions
    In cases of proven medical emergencies or natural disasters (official alerts), please [Contact Support](/support/raise) for a case-by-case review.', true, 210),

    (bookings_id, 'Refund Processing Timelines', 'refund-processing-timelines',
    '# When will I get my money back? 💸
    
    Once a refund is initiated, it takes some time to reflect in your account.
    
    ## Timelines by Method
    - **UPI / GPay / PhonePe**: Instant to 24 hours.
    - **Credit/Debit Cards**: 5-7 business days (depends on your bank).
    - **Net Banking**: 3-5 business days.
    
    ## Haven''t received it?
    If 7 days have passed, please share your **Transaction ID** with our support team.', true, 150);

END $$;
