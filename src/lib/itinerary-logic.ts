/**
 * Itinerary Generation Logic v3
 * Complete trip planning with:
 * - Arrival mode (flight/train/road)
 * - Stay duration options (1 or 2 nights)
 * - Smart return routing based on remaining time
 */

import { IndiaCity, getCityByName, calculateDistance, estimateTravelTime } from '@/data/india-cities';

export type TravelPace = 'fast' | 'comfort' | 'relaxed';
export type ArrivalMode = 'flight' | 'train' | 'road';
export type StayDuration = 1 | 2; // nights at destination

export interface TripOptions {
    pace: TravelPace;
    stayNights: StayDuration; // nights at Kedarnath/Badrinath
}

export interface ItineraryDay {
    day: number;
    date?: string;
    from: string;
    to: string;
    via?: string[];
    distance: number;
    duration: number;
    terrain: 'plains' | 'hills' | 'mountains';
    activities: string[];
    overnight: string;
    tips: string[];
    title?: string;
    travelMode?: 'flight' | 'train' | 'road' | 'trek';
}

export interface ItineraryResult {
    totalDays: number;
    totalDistance: number;
    route: ItineraryDay[];
    estimatedCost: CostEstimate;
    warnings: string[];
    recommendations: string[];
    arrivalInfo?: {
        mode: ArrivalMode;
        gateway: string;
        suggestion: string;
    };
}

export interface CostEstimate {
    transport: { min: number; max: number };
    accommodation: { min: number; max: number };
    food: { min: number; max: number };
    misc: { min: number; max: number };
    total: { min: number; max: number };
}

// ======================
// DISTANCE THRESHOLDS
// ======================
const ARRIVAL_THRESHOLDS = {
    roadReasonable: 400,     // Up to 400km - can drive
    trainReasonable: 800,    // Up to 800km - train is good
    flightRecommended: 800   // Beyond 800km - fly
};

// Cities with airports near Uttarakhand
const AIRPORTS = {
    'Dehradun': 'Jolly Grant Airport (DED)',
    'Delhi': 'IGI Airport (DEL)',
};

// Cities with train stations
const TRAIN_STATIONS = {
    'Haridwar': 'Haridwar Junction (HW)',
    'Rishikesh': 'Rishikesh Railway Station',
    'Dehradun': 'Dehradun Railway Station',
    'Delhi': 'New Delhi / Nizamuddin'
};

// ======================
// TERRAIN & TIMING
// ======================
function getTerrainType(cityName: string): 'plains' | 'hills' | 'mountains' {
    const mountainCities = [
        'Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Gaurikund',
        'Sonprayag', 'Guptkashi', 'Chopta', 'Joshimath', 'Uttarkashi',
        'Chamoli', 'Pipalkoti', 'Ukhimath', 'Phata', 'Sitapur', 'Barkot'
    ];
    const hillCities = [
        'Rishikesh', 'Devprayag', 'Srinagar Garhwal', 'Rudraprayag',
        'Karnaprayag', 'Dehradun', 'Mussoorie'
    ];

    if (mountainCities.includes(cityName)) return 'mountains';
    if (hillCities.includes(cityName)) return 'hills';
    return 'plains';
}

// Estimate remaining daylight hours
function getRemainingDaylight(startHour: number): number {
    const sunsetHour = 18; // 6 PM average
    return Math.max(0, sunsetHour - startHour);
}

// ======================
// DETERMINE ARRIVAL MODE
// ======================
function determineArrivalMode(sourceCity: string): {
    mode: ArrivalMode;
    gateway: string;
    suggestion: string;
} {
    const source = getCityByName(sourceCity);
    if (!source) return { mode: 'road', gateway: 'Haridwar', suggestion: '' };

    const haridwar = getCityByName('Haridwar')!;
    const dehradun = getCityByName('Dehradun')!;
    const delhi = getCityByName('Delhi')!;

    const distToHaridwar = calculateDistance(source, haridwar);
    const distToDelhi = calculateDistance(source, delhi);
    const distToDehradun = calculateDistance(source, dehradun);

    // Calculate distances
    if (distToHaridwar <= ARRIVAL_THRESHOLDS.roadReasonable) {
        return {
            mode: 'road',
            gateway: 'Haridwar',
            suggestion: `Drive directly to Haridwar (${Math.round(distToHaridwar)} km)`
        };
    }

    if (distToHaridwar <= ARRIVAL_THRESHOLDS.trainReasonable) {
        return {
            mode: 'train',
            gateway: 'Haridwar',
            suggestion: `Take train to Haridwar Junction. Many trains from major cities (10-14 hrs typical).`
        };
    }

    // For distant cities, recommend flight
    if (distToDehradun < distToDelhi) {
        return {
            mode: 'flight',
            gateway: 'Dehradun',
            suggestion: `Fly to Dehradun (Jolly Grant Airport). Then 45 min drive to Rishikesh.`
        };
    } else {
        return {
            mode: 'flight',
            gateway: 'Delhi',
            suggestion: `Fly to Delhi. Take early morning Shatabdi to Haridwar (4.5 hrs) or drive (5-6 hrs).`
        };
    }
}

// ======================
// SMART ROUTE BUILDER
// ======================
function buildSmartRoute(
    source: string,
    destination: 'kedarnath' | 'badrinath' | 'do-dham' | 'char-dham',
    options: TripOptions
): ItineraryDay[] {
    const days: ItineraryDay[] = [];
    const arrivalInfo = determineArrivalMode(source);
    const sourceCity = getCityByName(source);

    if (!sourceCity) return [];

    let dayNum = 0;
    let currentLocation = source;

    // ======================
    // PHASE 1: REACH GATEWAY
    // ======================
    const haridwar = getCityByName('Haridwar')!;
    const rishikesh = getCityByName('Rishikesh')!;
    const dehradun = getCityByName('Dehradun')!;
    const distToHaridwar = calculateDistance(sourceCity, haridwar);

    if (arrivalInfo.mode === 'flight') {
        // Day 0: Arrival at airport city
        if (arrivalInfo.gateway === 'Delhi') {
            dayNum++;
            days.push({
                day: dayNum,
                from: source,
                to: 'Delhi',
                distance: 0, // Flight
                duration: 2,
                terrain: 'plains',
                travelMode: 'flight',
                activities: ['Fly to Delhi', 'Check into hotel near railway station', 'Early dinner & rest'],
                overnight: 'Delhi',
                tips: ['Book early morning Shatabdi or start driving by 5 AM next day'],
                title: 'Arrival - Fly to Delhi'
            });

            // Day 1: Delhi → Rishikesh
            dayNum++;
            days.push({
                day: dayNum,
                from: 'Delhi',
                to: 'Rishikesh',
                via: ['Haridwar'],
                distance: 250,
                duration: 6,
                terrain: 'plains',
                travelMode: 'road',
                activities: ['Morning departure 5 AM', 'Reach Rishikesh by noon', 'Triveni Ghat Aarti'],
                overnight: 'Rishikesh',
                tips: ['Start early to maximize mountain driving hours', 'Options: Shatabdi train or private taxi'],
                title: 'Delhi to Gateway'
            });
            currentLocation = 'Rishikesh';

        } else {
            // Dehradun arrival
            dayNum++;
            days.push({
                day: dayNum,
                from: source,
                to: 'Rishikesh',
                via: ['Dehradun Airport'],
                distance: 45,
                duration: 3,
                terrain: 'plains',
                travelMode: 'flight',
                activities: ['Fly to Dehradun', 'Drive to Rishikesh (45 min)', 'Lakshman Jhula, Ram Jhula'],
                overnight: 'Rishikesh',
                tips: ['Book early morning flight to maximize the day', 'Airport taxi to Rishikesh ₹1,200-1,500'],
                title: 'Arrival - Fly to Dehradun'
            });
            currentLocation = 'Rishikesh';
        }

    } else if (arrivalInfo.mode === 'train') {
        dayNum++;
        const trainDuration = Math.min(14, Math.round(distToHaridwar / 60)); // Approx train time
        days.push({
            day: dayNum,
            from: source,
            to: 'Haridwar',
            distance: Math.round(distToHaridwar),
            duration: trainDuration,
            terrain: 'plains',
            travelMode: 'train',
            activities: ['Overnight train to Haridwar', 'Arrive early morning', 'Har Ki Pauri Ganga Aarti'],
            overnight: 'Haridwar',
            tips: ['Book AC 2-tier or 3-tier for comfort', 'Morning arrival trains are best'],
            title: 'Train to Gateway'
        });
        currentLocation = 'Haridwar';

    } else {
        // Road - direct drive
        if (distToHaridwar > 300) {
            // Long drive, might need stop
            const delhi = getCityByName('Delhi')!;
            const distToDelhi = calculateDistance(sourceCity, delhi);

            if (source !== 'Delhi' && distToDelhi < distToHaridwar * 0.7) {
                // Via Delhi makes sense
                dayNum++;
                days.push({
                    day: dayNum,
                    from: source,
                    to: 'Delhi',
                    distance: Math.round(distToDelhi),
                    duration: estimateTravelTime(distToDelhi, 'plains'),
                    terrain: 'plains',
                    travelMode: 'road',
                    activities: ['Drive to Delhi', 'Rest'],
                    overnight: 'Delhi',
                    tips: ['Long drive - take breaks every 2 hours'],
                    title: 'Drive to Delhi'
                });

                dayNum++;
                days.push({
                    day: dayNum,
                    from: 'Delhi',
                    to: 'Rishikesh',
                    via: ['Haridwar'],
                    distance: 250,
                    duration: 6,
                    terrain: 'plains',
                    travelMode: 'road',
                    activities: ['Early morning start', 'Breakfast at Murthal', 'Reach Rishikesh by noon'],
                    overnight: 'Rishikesh',
                    tips: ['Leave by 5 AM to avoid traffic'],
                    title: 'Delhi to Gateway'
                });
                currentLocation = 'Rishikesh';
            } else {
                // Direct long drive
                dayNum++;
                days.push({
                    day: dayNum,
                    from: source,
                    to: 'Haridwar',
                    distance: Math.round(distToHaridwar),
                    duration: estimateTravelTime(distToHaridwar, 'plains'),
                    terrain: 'plains',
                    travelMode: 'road',
                    activities: ['Drive to Haridwar', 'Har Ki Pauri evening Aarti'],
                    overnight: 'Haridwar',
                    tips: ['Start early, it\'s a long drive'],
                    title: 'Drive to Gateway'
                });
                currentLocation = 'Haridwar';
            }
        } else {
            // Short drive
            dayNum++;
            days.push({
                day: dayNum,
                from: source,
                to: 'Rishikesh',
                distance: Math.round(calculateDistance(sourceCity, rishikesh)),
                duration: estimateTravelTime(calculateDistance(sourceCity, rishikesh), 'plains'),
                terrain: 'plains',
                travelMode: 'road',
                activities: ['Drive to Rishikesh', 'Lakshman Jhula', 'Evening Aarti'],
                overnight: 'Rishikesh',
                tips: ['Easy drive, enjoy the journey'],
                title: 'Drive to Gateway'
            });
            currentLocation = 'Rishikesh';
        }
    }

    // ======================
    // PHASE 2: GATEWAY → BASECAMP
    // ======================
    const currentCity = getCityByName(currentLocation)!;
    const guptkashi = getCityByName('Guptkashi')!;
    const sonprayag = getCityByName('Sonprayag');

    if (destination === 'kedarnath' || destination === 'do-dham' || destination === 'char-dham') {
        // Push as close as possible to Sonprayag
        const targetStop = options.pace === 'fast'
            ? (sonprayag ? 'Sonprayag' : 'Guptkashi')
            : 'Guptkashi';

        const targetCity = getCityByName(targetStop) || guptkashi;
        const distToTarget = calculateDistance(currentCity, targetCity);

        dayNum++;
        days.push({
            day: dayNum,
            from: currentLocation,
            to: targetStop,
            via: ['Devprayag', 'Rudraprayag'],
            distance: Math.round(distToTarget),
            duration: estimateTravelTime(distToTarget, 'hills'),
            terrain: 'hills',
            travelMode: 'road',
            activities: [
                'Start early (5 AM recommended)',
                'Scenic drive through Garhwal',
                'Sangam view at Devprayag & Rudraprayag',
                'Reach basecamp by afternoon'
            ],
            overnight: targetStop,
            tips: [
                'Road is winding - motion sickness medicine recommended',
                'Book accommodation in advance - limited options',
                'Carry snacks - limited good food stops'
            ],
            title: 'Gateway to Kedarnath Basecamp'
        });
        currentLocation = targetStop;

        // ======================
        // PHASE 3: TREK TO KEDARNATH
        // ======================
        dayNum++;
        days.push({
            day: dayNum,
            from: currentLocation,
            to: 'Kedarnath',
            via: ['Gaurikund'],
            distance: 18,
            duration: 7,
            terrain: 'mountains',
            travelMode: 'trek',
            activities: [
                'Drive to Gaurikund (if from Guptkashi)',
                'Register at biometric counter',
                '18 km trek to Kedarnath',
                'Evening Aarti at temple'
            ],
            overnight: 'Kedarnath',
            tips: [
                'Start trek by 5 AM',
                'Ponies ₹2,500-3,000 one way | Palki ₹6,000+',
                'Helicopter from Phata ₹5,500+ (book in advance)',
                'Carry rain gear - weather changes rapidly'
            ],
            title: 'Trek to Kedarnath'
        });

        // Stay at Kedarnath (1 or 2 nights)
        if (options.stayNights === 2) {
            dayNum++;
            days.push({
                day: dayNum,
                from: 'Kedarnath',
                to: 'Kedarnath',
                distance: 0,
                duration: 0,
                terrain: 'mountains',
                activities: [
                    'Early morning Abhishek darshan (4 AM)',
                    'Explore Kedarnath valley',
                    'Bhairav Temple',
                    'Gandhi Sarovar (optional trek)',
                    'Rest and acclimatization'
                ],
                overnight: 'Kedarnath',
                tips: [
                    'Attend morning Aarti for spiritual experience',
                    'Extra day helps with altitude adjustment'
                ],
                title: 'Kedarnath Darshan Day'
            });
        }

        // ======================
        // PHASE 4: DESCEND + NEXT MOVE
        // ======================
        if (destination === 'kedarnath') {
            // Return trek + push toward gateway
            dayNum++;
            // After descending from Kedarnath (starts ~5-6 AM, reaches Gaurikund by 11-12 PM)
            // Remaining daylight: ~6 hours of driving possible
            // Can reach Rudraprayag (~80 km, 3 hrs) or even Haridwar if pushing

            const returnStop = options.pace === 'fast' ? 'Rishikesh' : 'Rudraprayag';
            const returnDist = options.pace === 'fast' ? 200 : 80;

            days.push({
                day: dayNum,
                from: 'Kedarnath',
                to: returnStop,
                via: ['Gaurikund', 'Guptkashi'],
                distance: 18 + returnDist,
                duration: 6 + (options.pace === 'fast' ? 6 : 3),
                terrain: options.pace === 'fast' ? 'hills' : 'mountains',
                travelMode: 'trek',
                activities: [
                    'Early morning descent (5 AM)',
                    'Reach Gaurikund by noon',
                    `Drive to ${returnStop}`,
                    returnStop === 'Rishikesh' ? 'Evening Aarti at Triveni Ghat' : 'Rest'
                ],
                overnight: returnStop,
                tips: [
                    'Descending is faster (4-5 hrs)',
                    options.pace === 'fast'
                        ? 'Long day but covers maximum distance'
                        : 'Take it easy after the trek'
                ],
                title: 'Descend & Return'
            });
            currentLocation = returnStop;

        } else {
            // Descend + head toward Badrinath
            dayNum++;
            // After descending, push toward Joshimath (Badrinath basecamp)
            // Guptkashi -> Chopta -> Pipalkoti -> Joshimath is ~180 km, 6-7 hrs

            const chopta = getCityByName('Chopta');
            const joshimath = getCityByName('Joshimath')!;

            const returnStop = options.pace === 'fast' ? 'Pipalkoti' : 'Chopta';

            days.push({
                day: dayNum,
                from: 'Kedarnath',
                to: returnStop,
                via: ['Gaurikund', 'Guptkashi'],
                distance: 18 + 100,
                duration: 6 + 4,
                terrain: 'mountains',
                travelMode: 'trek',
                activities: [
                    'Early descent from Kedarnath',
                    'Drive via beautiful Chopta meadows',
                    returnStop === 'Chopta' ? 'Tungnath view (optional)' : 'Continue to Pipalkoti'
                ],
                overnight: returnStop,
                tips: [
                    'Chopta route is scenic but narrow',
                    'Alternative: Guptkashi → Rudraprayag → Karnaprayag → Pipalkoti (longer but wider road)'
                ],
                title: 'Descend & Head to Badrinath'
            });
            currentLocation = returnStop;
        }
    }

    // ======================
    // PHASE 5: BADRINATH (for Do Dham / Badrinath only)
    // ======================
    if (destination === 'do-dham' || destination === 'badrinath') {
        const joshimath = getCityByName('Joshimath')!;
        const badrinath = getCityByName('Badrinath')!;
        const currentPos = getCityByName(currentLocation)!;

        // Reach Joshimath if not there
        if (currentLocation !== 'Joshimath') {
            const distToJoshi = calculateDistance(currentPos, joshimath);
            dayNum++;
            days.push({
                day: dayNum,
                from: currentLocation,
                to: 'Joshimath',
                distance: Math.round(distToJoshi),
                duration: estimateTravelTime(distToJoshi, 'mountains'),
                terrain: 'mountains',
                travelMode: 'road',
                activities: [
                    'Drive to Joshimath',
                    'Narsingh Temple',
                    'Shankaracharya Math'
                ],
                overnight: 'Joshimath',
                tips: ['Road opens early - start by 6 AM', 'Badrinath road can close due to landslides'],
                title: 'To Badrinath Basecamp'
            });
            currentLocation = 'Joshimath';
        }

        // Joshimath → Badrinath (45 km)
        dayNum++;
        days.push({
            day: dayNum,
            from: 'Joshimath',
            to: 'Badrinath',
            distance: 45,
            duration: 2,
            terrain: 'mountains',
            travelMode: 'road',
            activities: [
                'Early morning drive (road opens 6 AM)',
                'Tapt Kund hot spring bath',
                'Badrinath Temple Darshan',
                'Mana Village - Last Indian Village'
            ],
            overnight: 'Badrinath',
            tips: [
                'Temple opens 4:30 AM for Abhishek',
                'Carry warm clothes - very cold',
                'ATMs may not work - carry cash'
            ],
            title: 'Badrinath Darshan'
        });

        if (options.stayNights === 2) {
            dayNum++;
            days.push({
                day: dayNum,
                from: 'Badrinath',
                to: 'Badrinath',
                distance: 0,
                duration: 0,
                terrain: 'mountains',
                activities: [
                    'Morning Aarti',
                    'Vasudhara Falls trek (optional)',
                    'Vyas Gufa & Ganesh Gufa',
                    'Bheem Pul'
                ],
                overnight: 'Badrinath',
                tips: ['Extra day for proper darshan and exploration'],
                title: 'Badrinath Exploration Day'
            });
        }

        currentLocation = 'Badrinath';
    }

    // ======================
    // PHASE 6: RETURN HOME
    // ======================
    const finalCity = getCityByName(currentLocation)!;
    const distToRishikesh = calculateDistance(finalCity, rishikesh);

    // Return to Rishikesh/Haridwar
    dayNum++;
    days.push({
        day: dayNum,
        from: currentLocation,
        to: 'Rishikesh',
        via: destination.includes('badri') || destination === 'do-dham'
            ? ['Joshimath', 'Chamoli', 'Karnaprayag', 'Rudraprayag']
            : ['Rudraprayag', 'Devprayag'],
        distance: Math.round(distToRishikesh),
        duration: estimateTravelTime(distToRishikesh, 'hills'),
        terrain: 'hills',
        travelMode: 'road',
        activities: [
            'Start early morning',
            'Long scenic drive back',
            'Evening Aarti at Rishikesh'
        ],
        overnight: 'Rishikesh',
        tips: ['It\'s a long drive - take breaks', 'Stock up on snacks'],
        title: 'Return to Gateway'
    });

    // Final return home (if not already there)
    if (source !== 'Haridwar' && source !== 'Rishikesh' && source !== 'Dehradun') {
        const distToHome = calculateDistance(rishikesh, sourceCity);

        if (arrivalInfo.mode === 'flight') {
            dayNum++;
            if (arrivalInfo.gateway === 'Delhi') {
                days.push({
                    day: dayNum,
                    from: 'Rishikesh',
                    to: source,
                    via: ['Delhi Airport'],
                    distance: 250,
                    duration: 8,
                    terrain: 'plains',
                    travelMode: 'flight',
                    activities: [
                        'Drive to Delhi (5-6 hrs)',
                        'Flight back home'
                    ],
                    overnight: source,
                    tips: ['Book evening flight to have buffer time'],
                    title: 'Return Home'
                });
            } else {
                days.push({
                    day: dayNum,
                    from: 'Rishikesh',
                    to: source,
                    via: ['Dehradun Airport'],
                    distance: 45,
                    duration: 4,
                    terrain: 'plains',
                    travelMode: 'flight',
                    activities: ['Drive to Dehradun Airport (1 hr)', 'Flight home'],
                    overnight: source,
                    tips: ['Dehradun has limited flights - check schedule'],
                    title: 'Return Home'
                });
            }
        } else if (arrivalInfo.mode === 'train') {
            dayNum++;
            days.push({
                day: dayNum,
                from: 'Haridwar',
                to: source,
                distance: Math.round(distToHome),
                duration: 12,
                terrain: 'plains',
                travelMode: 'train',
                activities: ['Train from Haridwar Junction', 'Journey home'],
                overnight: source,
                tips: ['Book return train in advance'],
                title: 'Train Home'
            });
        } else if (distToHome > 50) {
            dayNum++;
            days.push({
                day: dayNum,
                from: 'Rishikesh',
                to: source,
                distance: Math.round(distToHome),
                duration: estimateTravelTime(distToHome, 'plains'),
                terrain: 'plains',
                travelMode: 'road',
                activities: ['Drive back home'],
                overnight: source,
                tips: ['Safe travels!'],
                title: 'Drive Home'
            });
        }
    }

    return days;
}

// Get activities for a location
function getActivities(cityName: string): string[] {
    const activities: Record<string, string[]> = {
        'Kedarnath': ['Kedarnath Temple Darshan', 'Morning Aarti (4:00 AM)', 'Bhairav Temple'],
        'Badrinath': ['Badrinath Temple Darshan', 'Tapt Kund bath', 'Mana Village'],
        'Haridwar': ['Har Ki Pauri Ganga Aarti (7 PM)'],
        'Rishikesh': ['Triveni Ghat Aarti', 'Lakshman Jhula'],
    };
    return activities[cityName] || ['Rest and local exploration'];
}

// ======================
// MAIN GENERATOR
// ======================
export function generateItinerary(
    sourceCity: string,
    destination: 'kedarnath' | 'badrinath' | 'do-dham' | 'char-dham' | 'gangotri' | 'yamunotri',
    options: TripOptions = { pace: 'fast', stayNights: 1 }
): ItineraryResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    let destType: 'kedarnath' | 'badrinath' | 'do-dham' | 'char-dham' =
        destination === 'gangotri' || destination === 'yamunotri' ? 'char-dham' :
            destination as any;

    const route = buildSmartRoute(sourceCity, destType, options);
    const arrivalInfo = determineArrivalMode(sourceCity);

    if (route.length === 0) {
        return {
            totalDays: 0,
            totalDistance: 0,
            route: [],
            estimatedCost: {
                transport: { min: 0, max: 0 },
                accommodation: { min: 0, max: 0 },
                food: { min: 0, max: 0 },
                misc: { min: 0, max: 0 },
                total: { min: 0, max: 0 }
            },
            warnings: ['Could not find source city'],
            recommendations: []
        };
    }

    const totalDistance = route.reduce((sum, day) => sum + day.distance, 0);
    const estimatedCost = calculateCosts(route, destination, arrivalInfo.mode);

    // Context-specific guidance
    if (arrivalInfo.mode === 'flight') {
        recommendations.push(`✈️ ${arrivalInfo.suggestion}`);
    } else if (arrivalInfo.mode === 'train') {
        recommendations.push(`🚂 ${arrivalInfo.suggestion}`);
    }

    if (destination === 'kedarnath' || destination === 'do-dham') {
        warnings.push('⛰️ Kedarnath trek: 18 km each way. Helicopter available (₹5,500+)');
    }

    return {
        totalDays: route.length,
        totalDistance,
        route,
        estimatedCost,
        warnings,
        recommendations,
        arrivalInfo
    };
}

// Cost calculation with mode-aware pricing
function calculateCosts(
    route: ItineraryDay[],
    destination: string,
    arrivalMode: ArrivalMode
): CostEstimate {
    const days = route.length;

    const transportPerDay = { min: 2500, max: 5000 };
    const accommodationPerDay = { min: 1200, max: 4000 };
    const foodPerDay = { min: 600, max: 1500 };
    const miscPerDay = { min: 400, max: 1000 };

    let flightCost = arrivalMode === 'flight' ? 8000 : 0; // Round trip estimate
    let trainCost = arrivalMode === 'train' ? 2000 : 0;
    let heliCost = ['kedarnath', 'do-dham', 'char-dham'].includes(destination) ? 6000 : 0;

    return {
        transport: {
            min: days * transportPerDay.min + trainCost,
            max: days * transportPerDay.max + flightCost + heliCost
        },
        accommodation: {
            min: days * accommodationPerDay.min,
            max: days * accommodationPerDay.max
        },
        food: {
            min: days * foodPerDay.min,
            max: days * foodPerDay.max
        },
        misc: {
            min: days * miscPerDay.min,
            max: days * miscPerDay.max
        },
        total: {
            min: days * (transportPerDay.min + accommodationPerDay.min + foodPerDay.min + miscPerDay.min) + trainCost,
            max: days * (transportPerDay.max + accommodationPerDay.max + foodPerDay.max + miscPerDay.max) + flightCost + heliCost
        }
    };
}

export function formatCurrency(amount: number): string {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
}


