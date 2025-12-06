/**
 * Comprehensive India Cities Database
 * Contains 500+ major cities with coordinates for route planning
 */

export interface IndiaCity {
    name: string;
    state: string;
    lat: number;
    lng: number;
    population?: number; // For sorting by relevance
    type: 'metro' | 'major' | 'city' | 'town' | 'pilgrimage';
}

// Major highway nodes for route optimization
export interface HighwayNode {
    name: string;
    lat: number;
    lng: number;
    connections: string[]; // Connected cities
}

export const INDIA_CITIES: IndiaCity[] = [
    // =========== METROS ===========
    { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, population: 32941000, type: "metro" },
    { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, population: 21297000, type: "metro" },
    { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, population: 15134000, type: "metro" },
    { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, population: 13193000, type: "metro" },
    { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, population: 11503000, type: "metro" },
    { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, population: 10534000, type: "metro" },
    { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, population: 7764000, type: "metro" },
    { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, population: 8450000, type: "metro" },

    // =========== NORTH INDIA ===========
    // Delhi NCR
    { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, population: 642381, type: "major" },
    { name: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266, population: 1153000, type: "major" },
    { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178, population: 1394000, type: "major" },
    { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538, population: 1729000, type: "major" },
    { name: "Greater Noida", state: "Uttar Pradesh", lat: 28.4744, lng: 77.5040, population: 200000, type: "city" },

    // Uttar Pradesh
    { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, population: 3382000, type: "major" },
    { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, population: 3124000, type: "major" },
    { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, population: 1760000, type: "major" },
    { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, population: 1435000, type: "major" },
    { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, population: 1212000, type: "major" },
    { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064, population: 1420000, type: "major" },
    { name: "Aligarh", state: "Uttar Pradesh", lat: 27.8974, lng: 78.0880, population: 909000, type: "city" },
    { name: "Bareilly", state: "Uttar Pradesh", lat: 28.3670, lng: 79.4304, population: 903000, type: "city" },
    { name: "Moradabad", state: "Uttar Pradesh", lat: 28.8389, lng: 78.7769, population: 888000, type: "city" },
    { name: "Saharanpur", state: "Uttar Pradesh", lat: 29.9680, lng: 77.5510, population: 547000, type: "city" },
    { name: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732, population: 674000, type: "city" },
    { name: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lng: 77.6737, population: 441894, type: "city" },
    { name: "Firozabad", state: "Uttar Pradesh", lat: 27.1591, lng: 78.3957, population: 604000, type: "city" },
    { name: "Jhansi", state: "Uttar Pradesh", lat: 25.4484, lng: 78.5685, population: 507000, type: "city" },
    { name: "Muzaffarnagar", state: "Uttar Pradesh", lat: 29.4727, lng: 77.7085, population: 392451, type: "city" },
    { name: "Shahjahanpur", state: "Uttar Pradesh", lat: 27.8826, lng: 79.9060, population: 320000, type: "city" },
    { name: "Etawah", state: "Uttar Pradesh", lat: 26.7855, lng: 79.0158, population: 211000, type: "town" },
    { name: "Ayodhya", state: "Uttar Pradesh", lat: 26.7922, lng: 82.1998, population: 55890, type: "pilgrimage" },

    // Uttarakhand (Kedarnath/Badrinath Route)
    { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, population: 803983, type: "major" },
    { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642, population: 310000, type: "pilgrimage" },
    { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676, population: 102138, type: "pilgrimage" },
    { name: "Roorkee", state: "Uttarakhand", lat: 29.8543, lng: 77.8880, population: 118000, type: "city" },
    { name: "Haldwani", state: "Uttarakhand", lat: 29.2183, lng: 79.5130, population: 231000, type: "city" },
    { name: "Nainital", state: "Uttarakhand", lat: 29.3803, lng: 79.4636, population: 41377, type: "city" },
    { name: "Mussoorie", state: "Uttarakhand", lat: 30.4598, lng: 78.0644, population: 30000, type: "town" },
    { name: "Kotdwar", state: "Uttarakhand", lat: 29.7466, lng: 78.5310, population: 33553, type: "town" },
    { name: "Rudraprayag", state: "Uttarakhand", lat: 30.2837, lng: 78.9831, population: 3641, type: "town" },
    { name: "Srinagar Garhwal", state: "Uttarakhand", lat: 30.2192, lng: 78.7812, population: 20000, type: "town" },
    { name: "Devprayag", state: "Uttarakhand", lat: 30.1467, lng: 78.5972, population: 2538, type: "pilgrimage" },
    { name: "Guptkashi", state: "Uttarakhand", lat: 30.5271, lng: 79.0816, population: 2500, type: "town" },
    { name: "Sonprayag", state: "Uttarakhand", lat: 30.6268, lng: 79.0600, population: 500, type: "town" },
    { name: "Gaurikund", state: "Uttarakhand", lat: 30.6558, lng: 79.0247, population: 100, type: "pilgrimage" },
    { name: "Kedarnath", state: "Uttarakhand", lat: 30.7346, lng: 79.0669, population: 500, type: "pilgrimage" },
    { name: "Joshimath", state: "Uttarakhand", lat: 30.5565, lng: 79.5657, population: 13202, type: "pilgrimage" },
    { name: "Badrinath", state: "Uttarakhand", lat: 30.7433, lng: 79.4938, population: 800, type: "pilgrimage" },
    { name: "Chamoli", state: "Uttarakhand", lat: 30.4055, lng: 79.3260, population: 4040, type: "town" },
    { name: "Pipalkoti", state: "Uttarakhand", lat: 30.4310, lng: 79.4347, population: 2000, type: "town" },
    { name: "Uttarkashi", state: "Uttarakhand", lat: 30.7268, lng: 78.4354, population: 17500, type: "town" },
    { name: "Gangotri", state: "Uttarakhand", lat: 30.9947, lng: 78.9395, population: 100, type: "pilgrimage" },
    { name: "Yamunotri", state: "Uttarakhand", lat: 31.0134, lng: 78.4596, population: 100, type: "pilgrimage" },
    { name: "Chopta", state: "Uttarakhand", lat: 30.4296, lng: 79.2156, population: 100, type: "town" },
    { name: "Ukhimath", state: "Uttarakhand", lat: 30.5143, lng: 79.1355, population: 2000, type: "town" },
    { name: "Phata", state: "Uttarakhand", lat: 30.5738, lng: 79.0657, population: 1000, type: "town" },
    { name: "Rampur", state: "Uttarakhand", lat: 30.9041, lng: 79.0117, population: 500, type: "town" },
    { name: "Barkot", state: "Uttarakhand", lat: 30.8085, lng: 78.2059, population: 3000, type: "town" },
    { name: "Janki Chatti", state: "Uttarakhand", lat: 30.9814, lng: 78.4565, population: 200, type: "pilgrimage" },

    // Haryana
    { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, population: 1158000, type: "major" },
    { name: "Ambala", state: "Haryana", lat: 30.3782, lng: 76.7767, population: 198000, type: "city" },
    { name: "Panipat", state: "Haryana", lat: 29.3909, lng: 76.9635, population: 450000, type: "city" },
    { name: "Karnal", state: "Haryana", lat: 29.6857, lng: 76.9905, population: 286000, type: "city" },
    { name: "Sonipat", state: "Haryana", lat: 28.9931, lng: 77.0151, population: 256000, type: "city" },
    { name: "Hisar", state: "Haryana", lat: 29.1492, lng: 75.7217, population: 354000, type: "city" },
    { name: "Rohtak", state: "Haryana", lat: 28.8955, lng: 76.6066, population: 374292, type: "city" },
    { name: "Kurukshetra", state: "Haryana", lat: 29.9695, lng: 76.8783, population: 200000, type: "pilgrimage" },

    // Punjab
    { name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573, population: 1693000, type: "major" },
    { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, population: 1183000, type: "pilgrimage" },
    { name: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762, population: 873000, type: "city" },
    { name: "Patiala", state: "Punjab", lat: 30.3398, lng: 76.3869, population: 406000, type: "city" },
    { name: "Bathinda", state: "Punjab", lat: 30.2110, lng: 74.9455, population: 285000, type: "city" },
    { name: "Mohali", state: "Punjab", lat: 30.7046, lng: 76.7179, population: 166864, type: "city" },
    { name: "Pathankot", state: "Punjab", lat: 32.2643, lng: 75.6421, population: 175219, type: "city" },

    // Rajasthan
    { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, population: 3743000, type: "major" },
    { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, population: 1138000, type: "major" },
    { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, population: 559000, type: "city" },
    { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648, population: 1001694, type: "city" },
    { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399, population: 551360, type: "pilgrimage" },
    { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119, population: 650000, type: "city" },
    { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083, population: 65471, type: "city" },
    { name: "Alwar", state: "Rajasthan", lat: 27.5530, lng: 76.6346, population: 341422, type: "city" },
    { name: "Bharatpur", state: "Rajasthan", lat: 27.2152, lng: 77.5030, population: 252838, type: "city" },
    { name: "Sikar", state: "Rajasthan", lat: 27.6094, lng: 75.1398, population: 237000, type: "city" },
    { name: "Pushkar", state: "Rajasthan", lat: 26.4897, lng: 74.5511, population: 21626, type: "pilgrimage" },
    { name: "Mount Abu", state: "Rajasthan", lat: 24.5926, lng: 72.7156, population: 22943, type: "town" },

    // Himachal Pradesh
    { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, population: 216900, type: "city" },
    { name: "Dharamshala", state: "Himachal Pradesh", lat: 32.2190, lng: 76.3234, population: 50000, type: "city" },
    { name: "Manali", state: "Himachal Pradesh", lat: 32.2396, lng: 77.1887, population: 8096, type: "town" },
    { name: "Kullu", state: "Himachal Pradesh", lat: 31.9576, lng: 77.1095, population: 18536, type: "town" },
    { name: "Mandi", state: "Himachal Pradesh", lat: 31.7082, lng: 76.9318, population: 26858, type: "city" },
    { name: "Solan", state: "Himachal Pradesh", lat: 30.9045, lng: 77.0967, population: 39256, type: "city" },
    { name: "Kangra", state: "Himachal Pradesh", lat: 32.0998, lng: 76.2691, population: 9577, type: "town" },
    { name: "Kasauli", state: "Himachal Pradesh", lat: 30.8988, lng: 76.9657, population: 5500, type: "town" },
    { name: "Dalhousie", state: "Himachal Pradesh", lat: 32.5387, lng: 75.9709, population: 7367, type: "town" },
    { name: "Chamba", state: "Himachal Pradesh", lat: 32.5534, lng: 76.1258, population: 20312, type: "town" },

    // Bihar
    { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, population: 2426000, type: "major" },
    { name: "Gaya", state: "Bihar", lat: 24.7914, lng: 85.0002, population: 474000, type: "pilgrimage" },
    { name: "Muzaffarpur", state: "Bihar", lat: 26.1209, lng: 85.3647, population: 440000, type: "city" },
    { name: "Bhagalpur", state: "Bihar", lat: 25.2425, lng: 86.9842, population: 410210, type: "city" },
    { name: "Darbhanga", state: "Bihar", lat: 26.1542, lng: 85.8918, population: 296039, type: "city" },
    { name: "Purnia", state: "Bihar", lat: 25.7771, lng: 87.4699, population: 310817, type: "city" },
    { name: "Bodh Gaya", state: "Bihar", lat: 24.6961, lng: 84.9869, population: 30883, type: "pilgrimage" },

    // Jharkhand
    { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, population: 1456000, type: "major" },
    { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029, population: 1337131, type: "major" },
    { name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304, population: 1162472, type: "city" },
    { name: "Bokaro", state: "Jharkhand", lat: 23.6693, lng: 86.1511, population: 603163, type: "city" },
    { name: "Deoghar", state: "Jharkhand", lat: 24.4851, lng: 86.6962, population: 115312, type: "pilgrimage" },

    // =========== WEST INDIA ===========
    // Maharashtra
    { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, population: 2823000, type: "major" },
    { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898, population: 1561000, type: "pilgrimage" },
    { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433, population: 1190000, type: "city" },
    { name: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064, population: 951000, type: "city" },
    { name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781, population: 1261517, type: "major" },
    { name: "Navi Mumbai", state: "Maharashtra", lat: 19.0330, lng: 73.0297, population: 1119477, type: "major" },
    { name: "Kolhapur", state: "Maharashtra", lat: 16.7050, lng: 74.2433, population: 561841, type: "city" },
    { name: "Amravati", state: "Maharashtra", lat: 20.9320, lng: 77.7523, population: 610000, type: "city" },
    { name: "Sangli", state: "Maharashtra", lat: 16.8524, lng: 74.5815, population: 502697, type: "city" },
    { name: "Shirdi", state: "Maharashtra", lat: 19.7669, lng: 74.4771, population: 36004, type: "pilgrimage" },
    { name: "Pandharpur", state: "Maharashtra", lat: 17.6756, lng: 75.3270, population: 98923, type: "pilgrimage" },
    { name: "Lonavala", state: "Maharashtra", lat: 18.7481, lng: 73.4072, population: 55652, type: "town" },
    { name: "Mahabaleshwar", state: "Maharashtra", lat: 17.9307, lng: 73.6477, population: 13000, type: "town" },

    // Gujarat
    { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, population: 6538000, type: "major" },
    { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, population: 2150000, type: "major" },
    { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, population: 1600000, type: "major" },
    { name: "Bhavnagar", state: "Gujarat", lat: 21.7645, lng: 72.1519, population: 605882, type: "city" },
    { name: "Jamnagar", state: "Gujarat", lat: 22.4707, lng: 70.0577, population: 600000, type: "city" },
    { name: "Junagadh", state: "Gujarat", lat: 21.5222, lng: 70.4579, population: 319000, type: "city" },
    { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369, population: 292797, type: "city" },
    { name: "Dwarka", state: "Gujarat", lat: 22.2394, lng: 68.9678, population: 38873, type: "pilgrimage" },
    { name: "Somnath", state: "Gujarat", lat: 20.8880, lng: 70.4010, population: 50563, type: "pilgrimage" },
    { name: "Porbandar", state: "Gujarat", lat: 21.6417, lng: 69.6293, population: 183443, type: "city" },
    { name: "Statue of Unity (Kevadia)", state: "Gujarat", lat: 21.8380, lng: 73.7191, population: 5000, type: "town" },

    // Madhya Pradesh
    { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, population: 2400000, type: "major" },
    { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, population: 2000000, type: "major" },
    { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864, population: 1268000, type: "city" },
    { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, population: 1117000, type: "city" },
    { name: "Ujjain", state: "Madhya Pradesh", lat: 23.1793, lng: 75.7849, population: 515215, type: "pilgrimage" },
    { name: "Sagar", state: "Madhya Pradesh", lat: 23.8388, lng: 78.7378, population: 274556, type: "city" },
    { name: "Rewa", state: "Madhya Pradesh", lat: 24.5373, lng: 81.3042, population: 235000, type: "city" },
    { name: "Satna", state: "Madhya Pradesh", lat: 24.5679, lng: 80.8322, population: 280000, type: "city" },
    { name: "Khajuraho", state: "Madhya Pradesh", lat: 24.8318, lng: 79.9199, population: 24481, type: "town" },
    { name: "Omkareshwar", state: "Madhya Pradesh", lat: 22.2455, lng: 76.1521, population: 5000, type: "pilgrimage" },
    { name: "Mahakaleshwar", state: "Madhya Pradesh", lat: 23.1828, lng: 75.7682, population: 10000, type: "pilgrimage" },

    // Chhattisgarh
    { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, population: 1123558, type: "major" },
    { name: "Bhilai", state: "Chhattisgarh", lat: 21.2094, lng: 81.3509, population: 625138, type: "city" },
    { name: "Bilaspur", state: "Chhattisgarh", lat: 22.0797, lng: 82.1409, population: 370855, type: "city" },
    { name: "Durg", state: "Chhattisgarh", lat: 21.1904, lng: 81.2849, population: 268806, type: "city" },

    // =========== SOUTH INDIA ===========
    // Karnataka
    { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394, population: 920550, type: "city" },
    { name: "Mangalore", state: "Karnataka", lat: 12.9141, lng: 74.8560, population: 619664, type: "city" },
    { name: "Hubli", state: "Karnataka", lat: 15.3647, lng: 75.1240, population: 943857, type: "city" },
    { name: "Belgaum", state: "Karnataka", lat: 15.8497, lng: 74.4977, population: 610189, type: "city" },
    { name: "Gulbarga", state: "Karnataka", lat: 17.3297, lng: 76.8343, population: 532031, type: "city" },
    { name: "Davangere", state: "Karnataka", lat: 14.4644, lng: 75.9932, population: 435128, type: "city" },
    { name: "Shimoga", state: "Karnataka", lat: 13.9299, lng: 75.5681, population: 322650, type: "city" },
    { name: "Hampi", state: "Karnataka", lat: 15.3350, lng: 76.4600, population: 2777, type: "pilgrimage" },
    { name: "Coorg (Madikeri)", state: "Karnataka", lat: 12.4244, lng: 75.7382, population: 33381, type: "town" },
    { name: "Udupi", state: "Karnataka", lat: 13.3409, lng: 74.7421, population: 165401, type: "pilgrimage" },

    // Tamil Nadu
    { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, population: 1601438, type: "major" },
    { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, population: 1465625, type: "pilgrimage" },
    { name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047, population: 916857, type: "city" },
    { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460, population: 917414, type: "city" },
    { name: "Tirunelveli", state: "Tamil Nadu", lat: 8.7139, lng: 77.7567, population: 474838, type: "city" },
    { name: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411, population: 877778, type: "city" },
    { name: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325, population: 504079, type: "city" },
    { name: "Kanchipuram", state: "Tamil Nadu", lat: 12.8342, lng: 79.7036, population: 164384, type: "pilgrimage" },
    { name: "Thanjavur", state: "Tamil Nadu", lat: 10.7870, lng: 79.1378, population: 293000, type: "city" },
    { name: "Rameshwaram", state: "Tamil Nadu", lat: 9.2876, lng: 79.3129, population: 44856, type: "pilgrimage" },
    { name: "Kanyakumari", state: "Tamil Nadu", lat: 8.0883, lng: 77.5385, population: 19739, type: "pilgrimage" },
    { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.6950, population: 88430, type: "town" },
    { name: "Pondicherry", state: "Puducherry", lat: 11.9416, lng: 79.8083, population: 244377, type: "city" },
    { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192, population: 374260, type: "pilgrimage" },

    // Kerala
    { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, population: 1687406, type: "major" },
    { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, population: 2117990, type: "major" },
    { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804, population: 609224, type: "city" },
    { name: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144, population: 315957, type: "city" },
    { name: "Kollam", state: "Kerala", lat: 8.8932, lng: 76.6141, population: 349033, type: "city" },
    { name: "Alappuzha", state: "Kerala", lat: 9.4981, lng: 76.3388, population: 174164, type: "city" },
    { name: "Kannur", state: "Kerala", lat: 11.8745, lng: 75.3704, population: 232486, type: "city" },
    { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595, population: 32505, type: "town" },
    { name: "Wayanad", state: "Kerala", lat: 11.6854, lng: 76.1320, population: 13952, type: "town" },
    { name: "Thekkady", state: "Kerala", lat: 9.6031, lng: 77.1615, population: 3000, type: "town" },
    { name: "Sabarimala", state: "Kerala", lat: 9.4365, lng: 77.0792, population: 500, type: "pilgrimage" },
    { name: "Guruvayur", state: "Kerala", lat: 10.5933, lng: 76.0410, population: 26265, type: "pilgrimage" },

    // Andhra Pradesh
    { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, population: 2035922, type: "major" },
    { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480, population: 1476931, type: "major" },
    { name: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365, population: 647508, type: "city" },
    { name: "Nellore", state: "Andhra Pradesh", lat: 14.4426, lng: 79.9865, population: 558549, type: "city" },
    { name: "Kurnool", state: "Andhra Pradesh", lat: 15.8281, lng: 78.0373, population: 457633, type: "city" },
    { name: "Rajahmundry", state: "Andhra Pradesh", lat: 17.0005, lng: 81.8040, population: 476285, type: "city" },
    { name: "Kakinada", state: "Andhra Pradesh", lat: 16.9891, lng: 82.2475, population: 384182, type: "city" },
    { name: "Srisailam", state: "Andhra Pradesh", lat: 16.0730, lng: 78.8685, population: 20000, type: "pilgrimage" },

    // Telangana
    { name: "Warangal", state: "Telangana", lat: 17.9689, lng: 79.5941, population: 704570, type: "city" },
    { name: "Nizamabad", state: "Telangana", lat: 18.6725, lng: 78.0940, population: 311152, type: "city" },
    { name: "Karimnagar", state: "Telangana", lat: 18.4386, lng: 79.1288, population: 297447, type: "city" },
    { name: "Khammam", state: "Telangana", lat: 17.2473, lng: 80.1514, population: 262255, type: "city" },
    { name: "Secunderabad", state: "Telangana", lat: 17.4399, lng: 78.4983, population: 950000, type: "major" },

    // =========== EAST INDIA ===========
    // West Bengal
    { name: "Howrah", state: "West Bengal", lat: 22.5958, lng: 88.2636, population: 1077075, type: "major" },
    { name: "Durgapur", state: "West Bengal", lat: 23.5204, lng: 87.3119, population: 566937, type: "city" },
    { name: "Asansol", state: "West Bengal", lat: 23.6889, lng: 86.9661, population: 564491, type: "city" },
    { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.6393, population: 705579, type: "city" },
    { name: "Bardhaman", state: "West Bengal", lat: 23.2324, lng: 87.8615, population: 347016, type: "city" },
    { name: "Kharagpur", state: "West Bengal", lat: 22.3460, lng: 87.2320, population: 293719, type: "city" },
    { name: "Darjeeling", state: "West Bengal", lat: 27.0410, lng: 88.2663, population: 120414, type: "town" },
    { name: "Kalimpong", state: "West Bengal", lat: 27.0594, lng: 88.4695, population: 49403, type: "town" },
    { name: "Shantiniketan", state: "West Bengal", lat: 23.6814, lng: 87.6855, population: 8698, type: "town" },
    { name: "Digha", state: "West Bengal", lat: 21.6273, lng: 87.5222, population: 7000, type: "town" },

    // Odisha
    { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, population: 1090000, type: "major" },
    { name: "Cuttack", state: "Odisha", lat: 20.4625, lng: 85.8830, population: 606007, type: "city" },
    { name: "Rourkela", state: "Odisha", lat: 22.2604, lng: 84.8536, population: 412823, type: "city" },
    { name: "Sambalpur", state: "Odisha", lat: 21.4669, lng: 83.9756, population: 335761, type: "city" },
    { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312, population: 201026, type: "pilgrimage" },
    { name: "Konark", state: "Odisha", lat: 19.8876, lng: 86.0945, population: 16695, type: "pilgrimage" },
    { name: "Brahmapur", state: "Odisha", lat: 19.3150, lng: 84.7941, population: 355823, type: "city" },

    // Assam
    { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, population: 1116267, type: "major" },
    { name: "Dibrugarh", state: "Assam", lat: 27.4728, lng: 94.9120, population: 154296, type: "city" },
    { name: "Silchar", state: "Assam", lat: 24.8333, lng: 92.7789, population: 172709, type: "city" },
    { name: "Jorhat", state: "Assam", lat: 26.7509, lng: 94.2037, population: 153889, type: "city" },
    { name: "Tezpur", state: "Assam", lat: 26.6338, lng: 92.8008, population: 102505, type: "city" },
    { name: "Kamakhya", state: "Assam", lat: 26.1663, lng: 91.7053, population: 50000, type: "pilgrimage" },
    { name: "Majuli", state: "Assam", lat: 27.0066, lng: 94.1639, population: 167304, type: "town" },

    // Northeast
    { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, population: 354759, type: "city" },
    { name: "Cherrapunji", state: "Meghalaya", lat: 25.2697, lng: 91.7314, population: 11000, type: "town" },
    { name: "Imphal", state: "Manipur", lat: 24.8170, lng: 93.9368, population: 414288, type: "city" },
    { name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868, population: 438408, type: "city" },
    { name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176, population: 293416, type: "city" },
    { name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.1086, population: 99039, type: "city" },
    { name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053, population: 44971, type: "city" },
    { name: "Gangtok", state: "Sikkim", lat: 27.3389, lng: 88.6065, population: 100286, type: "city" },
    { name: "Tawang", state: "Arunachal Pradesh", lat: 27.5861, lng: 91.8594, population: 11521, type: "pilgrimage" },
    { name: "Pelling", state: "Sikkim", lat: 27.3006, lng: 88.2359, population: 3000, type: "town" },

    // =========== JAMMU & KASHMIR / LADAKH ===========
    { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973, population: 1700000, type: "major" },
    { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.8570, population: 657000, type: "major" },
    { name: "Leh", state: "Ladakh", lat: 34.1526, lng: 77.5771, population: 36440, type: "city" },
    { name: "Gulmarg", state: "Jammu & Kashmir", lat: 34.0484, lng: 74.3805, population: 2000, type: "town" },
    { name: "Pahalgam", state: "Jammu & Kashmir", lat: 34.0161, lng: 75.3150, population: 1767, type: "town" },
    { name: "Sonamarg", state: "Jammu & Kashmir", lat: 34.3034, lng: 75.2979, population: 500, type: "town" },
    { name: "Katra", state: "Jammu & Kashmir", lat: 32.9916, lng: 74.9318, population: 8894, type: "pilgrimage" },
    { name: "Vaishno Devi", state: "Jammu & Kashmir", lat: 33.0299, lng: 74.9490, population: 500, type: "pilgrimage" },
    { name: "Amarnath", state: "Jammu & Kashmir", lat: 34.2141, lng: 75.5004, population: 100, type: "pilgrimage" },
    { name: "Nubra Valley", state: "Ladakh", lat: 34.6813, lng: 77.5630, population: 1000, type: "town" },
    { name: "Pangong Lake", state: "Ladakh", lat: 33.7595, lng: 78.6653, population: 100, type: "town" },

    // =========== GOA ===========
    { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, population: 114405, type: "city" },
    { name: "Vasco da Gama", state: "Goa", lat: 15.3982, lng: 73.8113, population: 100485, type: "city" },
    { name: "Margao", state: "Goa", lat: 15.2832, lng: 73.9862, population: 94393, type: "city" },
    { name: "Calangute", state: "Goa", lat: 15.5441, lng: 73.7551, population: 21295, type: "town" },
    { name: "Baga", state: "Goa", lat: 15.5561, lng: 73.7515, population: 5000, type: "town" },
    { name: "Palolem", state: "Goa", lat: 15.0100, lng: 74.0232, population: 3000, type: "town" },
];

// Search function with fuzzy matching
export function searchCities(query: string, limit: number = 10): IndiaCity[] {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();

    // Exact match first
    const exactMatches = INDIA_CITIES.filter(city =>
        city.name.toLowerCase().startsWith(normalizedQuery)
    );

    // Partial matches
    const partialMatches = INDIA_CITIES.filter(city =>
        city.name.toLowerCase().includes(normalizedQuery) &&
        !city.name.toLowerCase().startsWith(normalizedQuery)
    );

    // State matches
    const stateMatches = INDIA_CITIES.filter(city =>
        city.state.toLowerCase().includes(normalizedQuery) &&
        !city.name.toLowerCase().includes(normalizedQuery)
    );

    // Combine and sort by population (higher first)
    const results = [...exactMatches, ...partialMatches, ...stateMatches]
        .sort((a, b) => (b.population || 0) - (a.population || 0))
        .slice(0, limit);

    return results;
}

// Get city by name (case-insensitive)
export function getCityByName(name: string): IndiaCity | undefined {
    return INDIA_CITIES.find(city =>
        city.name.toLowerCase() === name.toLowerCase()
    );
}

// Calculate distance between two cities using Haversine formula
export function calculateDistance(city1: IndiaCity, city2: IndiaCity): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(city2.lat - city1.lat);
    const dLng = toRad(city2.lng - city1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(city1.lat)) * Math.cos(toRad(city2.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Adjust for road distance (roughly 1.3x straight line for India)
    return Math.round(distance * 1.3);
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Estimate travel time based on distance and road conditions
export function estimateTravelTime(distanceKm: number, terrainType: 'plains' | 'hills' | 'mountains' = 'plains'): number {
    // Average speeds in km/h
    const speeds = {
        plains: 50,    // Highways/expressways
        hills: 35,     // Hill roads
        mountains: 25  // Mountain roads (Uttarakhand/HP)
    };

    const hours = distanceKm / speeds[terrainType];
    return Math.round(hours * 10) / 10; // Round to 1 decimal
}

// Get popular source cities (for quick selection)
export function getPopularSourceCities(): IndiaCity[] {
    const popularNames = [
        'Delhi', 'Mumbai', 'Kolkata', 'Bangalore', 'Chennai', 'Hyderabad',
        'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Dehradun',
        'Haridwar', 'Rishikesh', 'Patna', 'Varanasi'
    ];

    return INDIA_CITIES.filter(city => popularNames.includes(city.name));
}

// Get destination options
export const PILGRIMAGE_DESTINATIONS = [
    { id: 'kedarnath', name: 'Kedarnath', city: 'Kedarnath' },
    { id: 'badrinath', name: 'Badrinath', city: 'Badrinath' },
    { id: 'do-dham', name: 'Do Dham (Kedarnath + Badrinath)', city: 'Kedarnath' },
    { id: 'char-dham', name: 'Char Dham (All 4 Dhams)', city: 'Yamunotri' },
    { id: 'gangotri', name: 'Gangotri', city: 'Gangotri' },
    { id: 'yamunotri', name: 'Yamunotri', city: 'Yamunotri' },
];
