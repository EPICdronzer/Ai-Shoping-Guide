/**
 * Sample fuel price dataset for Indian cities and towns.
 *
 * NOTE: These are *approximate* illustrative values. Actual retail fuel
 * prices in India are revised daily by Oil Marketing Companies (IOCL,
 * BPCL, HPCL) and vary based on state VAT, freight, and dealer
 * commission. Swap in a live data source if you have one.
 *
 * Fields:
 *   name     - city/town name
 *   state    - Indian state / UT
 *   lat, lng - coordinates
 *   petrol   - INR per litre
 *   diesel   - INR per litre
 */
window.FUEL_DATA = [
  // --- Delhi ---
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, petrol: 94.77, diesel: 87.67 },
  { name: "Dwarka (Delhi)", state: "Delhi", lat: 28.5921, lng: 77.0460, petrol: 94.80, diesel: 87.70 },

  // --- Maharashtra ---
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, petrol: 103.44, diesel: 89.97 },
  { name: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781, petrol: 103.56, diesel: 90.10 },
  { name: "Navi Mumbai", state: "Maharashtra", lat: 19.0330, lng: 73.0297, petrol: 103.50, diesel: 90.03 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, petrol: 103.98, diesel: 90.55 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, petrol: 102.93, diesel: 89.55 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898, petrol: 103.21, diesel: 89.79 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433, petrol: 103.72, diesel: 90.30 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.7050, lng: 74.2433, petrol: 104.10, diesel: 90.70 },
  { name: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064, petrol: 103.85, diesel: 90.42 },
  { name: "Amravati", state: "Maharashtra", lat: 20.9374, lng: 77.7796, petrol: 103.65, diesel: 90.24 },
  { name: "Sangli", state: "Maharashtra", lat: 16.8524, lng: 74.5815, petrol: 104.02, diesel: 90.60 },
  { name: "Jalgaon", state: "Maharashtra", lat: 21.0077, lng: 75.5626, petrol: 103.48, diesel: 90.05 },
  { name: "Ratnagiri", state: "Maharashtra", lat: 16.9944, lng: 73.3002, petrol: 104.28, diesel: 90.88 },
  { name: "Latur", state: "Maharashtra", lat: 18.4088, lng: 76.5604, petrol: 103.92, diesel: 90.50 },
  { name: "Akola", state: "Maharashtra", lat: 20.7002, lng: 77.0082, petrol: 103.55, diesel: 90.15 },
  { name: "Chandrapur", state: "Maharashtra", lat: 19.9615, lng: 79.2961, petrol: 103.05, diesel: 89.68 },

  // --- Karnataka ---
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, petrol: 102.86, diesel: 88.94 },
  { name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394, petrol: 102.70, diesel: 88.80 },
  { name: "Mangaluru", state: "Karnataka", lat: 12.9141, lng: 74.8560, petrol: 102.95, diesel: 89.05 },
  { name: "Hubballi", state: "Karnataka", lat: 15.3647, lng: 75.1240, petrol: 103.12, diesel: 89.22 },
  { name: "Belagavi", state: "Karnataka", lat: 15.8497, lng: 74.4977, petrol: 103.20, diesel: 89.30 },
  { name: "Davangere", state: "Karnataka", lat: 14.4644, lng: 75.9218, petrol: 103.05, diesel: 89.15 },
  { name: "Ballari", state: "Karnataka", lat: 15.1394, lng: 76.9214, petrol: 103.18, diesel: 89.28 },
  { name: "Shivamogga", state: "Karnataka", lat: 13.9299, lng: 75.5681, petrol: 102.98, diesel: 89.08 },
  { name: "Tumakuru", state: "Karnataka", lat: 13.3379, lng: 77.1022, petrol: 102.90, diesel: 88.99 },
  { name: "Udupi", state: "Karnataka", lat: 13.3409, lng: 74.7421, petrol: 103.02, diesel: 89.12 },
  { name: "Hassan", state: "Karnataka", lat: 13.0033, lng: 76.1004, petrol: 103.08, diesel: 89.18 },
  { name: "Kalaburagi", state: "Karnataka", lat: 17.3297, lng: 76.8343, petrol: 103.25, diesel: 89.35 },
  { name: "Bidar", state: "Karnataka", lat: 17.9133, lng: 77.5301, petrol: 103.30, diesel: 89.40 },
  { name: "Raichur", state: "Karnataka", lat: 16.2076, lng: 77.3463, petrol: 103.22, diesel: 89.32 },
  { name: "Chikkamagaluru", state: "Karnataka", lat: 13.3161, lng: 75.7720, petrol: 103.10, diesel: 89.20 },

  // --- Tamil Nadu ---
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, petrol: 100.85, diesel: 92.44 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, petrol: 101.29, diesel: 92.88 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, petrol: 101.67, diesel: 93.24 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7905, lng: 78.7047, petrol: 101.52, diesel: 93.11 },
  { name: "Salem", state: "Tamil Nadu", lat: 11.6643, lng: 78.1460, petrol: 101.40, diesel: 92.99 },
  { name: "Tirunelveli", state: "Tamil Nadu", lat: 8.7139, lng: 77.7567, petrol: 101.78, diesel: 93.35 },
  { name: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325, petrol: 101.08, diesel: 92.66 },
  { name: "Erode", state: "Tamil Nadu", lat: 11.3410, lng: 77.7172, petrol: 101.35, diesel: 92.94 },
  { name: "Tiruppur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411, petrol: 101.32, diesel: 92.91 },
  { name: "Thanjavur", state: "Tamil Nadu", lat: 10.7870, lng: 79.1378, petrol: 101.58, diesel: 93.17 },
  { name: "Dindigul", state: "Tamil Nadu", lat: 10.3624, lng: 77.9695, petrol: 101.62, diesel: 93.20 },
  { name: "Nagercoil", state: "Tamil Nadu", lat: 8.1788, lng: 77.4334, petrol: 101.85, diesel: 93.42 },
  { name: "Kanchipuram", state: "Tamil Nadu", lat: 12.8342, lng: 79.7036, petrol: 101.00, diesel: 92.58 },
  { name: "Cuddalore", state: "Tamil Nadu", lat: 11.7480, lng: 79.7714, petrol: 101.18, diesel: 92.77 },
  { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.6950, petrol: 101.55, diesel: 93.13 },

  // --- Kerala ---
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, petrol: 107.51, diesel: 96.41 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, petrol: 105.70, diesel: 94.67 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804, petrol: 106.34, diesel: 95.24 },
  { name: "Thrissur", state: "Kerala", lat: 10.5276, lng: 76.2144, petrol: 106.18, diesel: 95.08 },
  { name: "Kollam", state: "Kerala", lat: 8.8932, lng: 76.6141, petrol: 107.15, diesel: 96.08 },
  { name: "Alappuzha", state: "Kerala", lat: 9.4981, lng: 76.3388, petrol: 106.55, diesel: 95.44 },
  { name: "Kottayam", state: "Kerala", lat: 9.5916, lng: 76.5222, petrol: 106.62, diesel: 95.50 },
  { name: "Palakkad", state: "Kerala", lat: 10.7867, lng: 76.6548, petrol: 106.25, diesel: 95.14 },
  { name: "Kannur", state: "Kerala", lat: 11.8745, lng: 75.3704, petrol: 106.52, diesel: 95.40 },
  { name: "Malappuram", state: "Kerala", lat: 11.0510, lng: 76.0711, petrol: 106.40, diesel: 95.30 },
  { name: "Kasaragod", state: "Kerala", lat: 12.4996, lng: 74.9869, petrol: 106.68, diesel: 95.56 },
  { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595, petrol: 106.90, diesel: 95.78 },

  // --- Telangana ---
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, petrol: 109.66, diesel: 97.82 },
  { name: "Warangal", state: "Telangana", lat: 17.9689, lng: 79.5941, petrol: 109.94, diesel: 98.10 },
  { name: "Nizamabad", state: "Telangana", lat: 18.6725, lng: 78.0941, petrol: 110.12, diesel: 98.26 },
  { name: "Karimnagar", state: "Telangana", lat: 18.4386, lng: 79.1288, petrol: 109.85, diesel: 98.00 },
  { name: "Khammam", state: "Telangana", lat: 17.2473, lng: 80.1514, petrol: 109.72, diesel: 97.88 },
  { name: "Mahbubnagar", state: "Telangana", lat: 16.7480, lng: 77.9860, petrol: 109.78, diesel: 97.94 },
  { name: "Adilabad", state: "Telangana", lat: 19.6640, lng: 78.5320, petrol: 110.20, diesel: 98.35 },

  // --- Andhra Pradesh ---
  { name: "Amaravati", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480, petrol: 109.29, diesel: 97.04 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, petrol: 108.95, diesel: 96.71 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480, petrol: 109.11, diesel: 96.88 },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192, petrol: 109.40, diesel: 97.15 },
  { name: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365, petrol: 109.20, diesel: 96.96 },
  { name: "Rajahmundry", state: "Andhra Pradesh", lat: 17.0005, lng: 81.8040, petrol: 109.05, diesel: 96.81 },
  { name: "Kurnool", state: "Andhra Pradesh", lat: 15.8281, lng: 78.0373, petrol: 109.35, diesel: 97.10 },
  { name: "Nellore", state: "Andhra Pradesh", lat: 14.4426, lng: 79.9865, petrol: 109.25, diesel: 97.00 },
  { name: "Kadapa", state: "Andhra Pradesh", lat: 14.4753, lng: 78.8298, petrol: 109.32, diesel: 97.07 },
  { name: "Anantapur", state: "Andhra Pradesh", lat: 14.6819, lng: 77.6006, petrol: 109.28, diesel: 97.03 },
  { name: "Ongole", state: "Andhra Pradesh", lat: 15.5057, lng: 80.0499, petrol: 109.18, diesel: 96.94 },
  { name: "Chittoor", state: "Andhra Pradesh", lat: 13.2172, lng: 79.1003, petrol: 109.38, diesel: 97.12 },

  // --- West Bengal ---
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, petrol: 103.94, diesel: 90.76 },
  { name: "Howrah", state: "West Bengal", lat: 22.5958, lng: 88.2636, petrol: 103.92, diesel: 90.74 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953, petrol: 104.55, diesel: 91.40 },
  { name: "Durgapur", state: "West Bengal", lat: 23.5204, lng: 87.3119, petrol: 104.20, diesel: 91.05 },
  { name: "Asansol", state: "West Bengal", lat: 23.6739, lng: 86.9524, petrol: 104.28, diesel: 91.13 },
  { name: "Darjeeling", state: "West Bengal", lat: 27.0360, lng: 88.2627, petrol: 104.72, diesel: 91.58 },
  { name: "Malda", state: "West Bengal", lat: 25.0109, lng: 88.1411, petrol: 104.40, diesel: 91.25 },
  { name: "Kharagpur", state: "West Bengal", lat: 22.3460, lng: 87.2320, petrol: 104.05, diesel: 90.90 },
  { name: "Bardhaman", state: "West Bengal", lat: 23.2324, lng: 87.8615, petrol: 104.12, diesel: 90.98 },

  // --- Gujarat ---
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, petrol: 94.49, diesel: 90.17 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, petrol: 94.55, diesel: 90.22 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812, petrol: 94.62, diesel: 90.30 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022, petrol: 94.71, diesel: 90.39 },
  { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369, petrol: 94.52, diesel: 90.20 },
  { name: "Bhuj", state: "Gujarat", lat: 23.2420, lng: 69.6669, petrol: 94.95, diesel: 90.62 },
  { name: "Jamnagar", state: "Gujarat", lat: 22.4707, lng: 70.0577, petrol: 94.80, diesel: 90.48 },
  { name: "Bhavnagar", state: "Gujarat", lat: 21.7645, lng: 72.1519, petrol: 94.76, diesel: 90.44 },
  { name: "Junagadh", state: "Gujarat", lat: 21.5222, lng: 70.4579, petrol: 94.88, diesel: 90.56 },
  { name: "Anand", state: "Gujarat", lat: 22.5645, lng: 72.9289, petrol: 94.58, diesel: 90.26 },
  { name: "Dwarka", state: "Gujarat", lat: 22.2394, lng: 68.9678, petrol: 95.10, diesel: 90.78 },
  { name: "Porbandar", state: "Gujarat", lat: 21.6417, lng: 69.6293, petrol: 94.92, diesel: 90.60 },

  // --- Rajasthan ---
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, petrol: 104.88, diesel: 90.36 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243, petrol: 104.76, diesel: 90.23 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125, petrol: 105.12, diesel: 90.58 },
  { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648, petrol: 104.95, diesel: 90.41 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399, petrol: 104.82, diesel: 90.28 },
  { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119, petrol: 105.30, diesel: 90.75 },
  { name: "Alwar", state: "Rajasthan", lat: 27.5530, lng: 76.6346, petrol: 104.70, diesel: 90.18 },
  { name: "Bharatpur", state: "Rajasthan", lat: 27.2152, lng: 77.4977, petrol: 104.65, diesel: 90.13 },
  { name: "Sikar", state: "Rajasthan", lat: 27.6094, lng: 75.1399, petrol: 104.92, diesel: 90.39 },
  { name: "Pali", state: "Rajasthan", lat: 25.7711, lng: 73.3234, petrol: 105.05, diesel: 90.52 },
  { name: "Sri Ganganagar", state: "Rajasthan", lat: 29.9094, lng: 73.8800, petrol: 105.42, diesel: 90.87 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083, petrol: 105.65, diesel: 91.08 },
  { name: "Mount Abu", state: "Rajasthan", lat: 24.5926, lng: 72.7156, petrol: 105.22, diesel: 90.68 },
  { name: "Pushkar", state: "Rajasthan", lat: 26.4899, lng: 74.5511, petrol: 104.86, diesel: 90.32 },

  // --- Uttar Pradesh ---
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, petrol: 94.65, diesel: 87.83 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, petrol: 94.72, diesel: 87.89 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, petrol: 94.78, diesel: 87.96 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, petrol: 95.08, diesel: 88.25 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, petrol: 94.68, diesel: 87.79 },
  { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538, petrol: 94.64, diesel: 87.75 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463, petrol: 94.96, diesel: 88.12 },
  { name: "Meerut", state: "Uttar Pradesh", lat: 28.9845, lng: 77.7064, petrol: 94.70, diesel: 87.85 },
  { name: "Aligarh", state: "Uttar Pradesh", lat: 27.8974, lng: 78.0880, petrol: 94.76, diesel: 87.92 },
  { name: "Moradabad", state: "Uttar Pradesh", lat: 28.8386, lng: 78.7733, petrol: 94.74, diesel: 87.90 },
  { name: "Bareilly", state: "Uttar Pradesh", lat: 28.3670, lng: 79.4304, petrol: 94.82, diesel: 87.98 },
  { name: "Saharanpur", state: "Uttar Pradesh", lat: 29.9680, lng: 77.5552, petrol: 94.80, diesel: 87.96 },
  { name: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732, petrol: 95.02, diesel: 88.18 },
  { name: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lng: 77.6737, petrol: 94.72, diesel: 87.88 },
  { name: "Vrindavan", state: "Uttar Pradesh", lat: 27.5805, lng: 77.7008, petrol: 94.74, diesel: 87.90 },
  { name: "Ayodhya", state: "Uttar Pradesh", lat: 26.7922, lng: 82.1998, petrol: 94.90, diesel: 88.06 },
  { name: "Jhansi", state: "Uttar Pradesh", lat: 25.4484, lng: 78.5685, petrol: 94.85, diesel: 88.00 },
  { name: "Firozabad", state: "Uttar Pradesh", lat: 27.1592, lng: 78.3957, petrol: 94.80, diesel: 87.96 },

  // --- Madhya Pradesh ---
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, petrol: 106.42, diesel: 91.75 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, petrol: 106.57, diesel: 91.88 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828, petrol: 106.80, diesel: 92.11 },
  { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864, petrol: 106.65, diesel: 91.95 },
  { name: "Ujjain", state: "Madhya Pradesh", lat: 23.1793, lng: 75.7849, petrol: 106.52, diesel: 91.83 },
  { name: "Sagar", state: "Madhya Pradesh", lat: 23.8388, lng: 78.7378, petrol: 106.70, diesel: 92.00 },
  { name: "Satna", state: "Madhya Pradesh", lat: 24.5854, lng: 80.8305, petrol: 106.78, diesel: 92.08 },
  { name: "Rewa", state: "Madhya Pradesh", lat: 24.5373, lng: 81.3042, petrol: 106.82, diesel: 92.13 },
  { name: "Khajuraho", state: "Madhya Pradesh", lat: 24.8318, lng: 79.9199, petrol: 106.88, diesel: 92.18 },
  { name: "Chhindwara", state: "Madhya Pradesh", lat: 22.0574, lng: 78.9382, petrol: 106.62, diesel: 91.92 },

  // --- Bihar ---
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, petrol: 105.58, diesel: 92.38 },
  { name: "Gaya", state: "Bihar", lat: 24.7914, lng: 85.0002, petrol: 105.80, diesel: 92.60 },
  { name: "Muzaffarpur", state: "Bihar", lat: 26.1197, lng: 85.3910, petrol: 105.72, diesel: 92.52 },
  { name: "Bhagalpur", state: "Bihar", lat: 25.2425, lng: 86.9842, petrol: 105.85, diesel: 92.64 },
  { name: "Darbhanga", state: "Bihar", lat: 26.1542, lng: 85.8918, petrol: 105.78, diesel: 92.58 },
  { name: "Purnia", state: "Bihar", lat: 25.7771, lng: 87.4753, petrol: 105.90, diesel: 92.70 },
  { name: "Begusarai", state: "Bihar", lat: 25.4182, lng: 86.1272, petrol: 105.75, diesel: 92.55 },
  { name: "Ara", state: "Bihar", lat: 25.5541, lng: 84.6630, petrol: 105.68, diesel: 92.48 },

  // --- Punjab ---
  { name: "Chandigarh", state: "Chandigarh (UT)", lat: 30.7333, lng: 76.7794, petrol: 94.30, diesel: 82.45 },
  { name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573, petrol: 96.36, diesel: 86.85 },
  { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, petrol: 96.48, diesel: 86.97 },
  { name: "Jalandhar", state: "Punjab", lat: 31.3260, lng: 75.5762, petrol: 96.40, diesel: 86.90 },
  { name: "Patiala", state: "Punjab", lat: 30.3398, lng: 76.3869, petrol: 96.44, diesel: 86.93 },
  { name: "Bathinda", state: "Punjab", lat: 30.2110, lng: 74.9455, petrol: 96.52, diesel: 87.01 },
  { name: "Pathankot", state: "Punjab", lat: 32.2746, lng: 75.6521, petrol: 96.58, diesel: 87.08 },
  { name: "Mohali", state: "Punjab", lat: 30.7046, lng: 76.7179, petrol: 96.38, diesel: 86.87 },

  // --- Haryana ---
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266, petrol: 95.44, diesel: 88.30 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178, petrol: 95.52, diesel: 88.37 },
  { name: "Panipat", state: "Haryana", lat: 29.3909, lng: 76.9635, petrol: 95.60, diesel: 88.44 },
  { name: "Hisar", state: "Haryana", lat: 29.1492, lng: 75.7217, petrol: 95.66, diesel: 88.50 },
  { name: "Karnal", state: "Haryana", lat: 29.6857, lng: 76.9905, petrol: 95.58, diesel: 88.42 },
  { name: "Ambala", state: "Haryana", lat: 30.3782, lng: 76.7767, petrol: 95.62, diesel: 88.46 },
  { name: "Rohtak", state: "Haryana", lat: 28.8955, lng: 76.6066, petrol: 95.56, diesel: 88.40 },
  { name: "Rewari", state: "Haryana", lat: 28.1972, lng: 76.6194, petrol: 95.50, diesel: 88.34 },
  { name: "Sonipat", state: "Haryana", lat: 28.9931, lng: 77.0151, petrol: 95.54, diesel: 88.38 },

  // --- Odisha ---
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, petrol: 101.06, diesel: 92.64 },
  { name: "Cuttack", state: "Odisha", lat: 20.4625, lng: 85.8828, petrol: 101.12, diesel: 92.70 },
  { name: "Rourkela", state: "Odisha", lat: 22.2604, lng: 84.8536, petrol: 101.35, diesel: 92.93 },
  { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312, petrol: 101.18, diesel: 92.76 },
  { name: "Berhampur", state: "Odisha", lat: 19.3150, lng: 84.7941, petrol: 101.28, diesel: 92.86 },
  { name: "Sambalpur", state: "Odisha", lat: 21.4669, lng: 83.9812, petrol: 101.30, diesel: 92.88 },
  { name: "Balasore", state: "Odisha", lat: 21.4934, lng: 86.9335, petrol: 101.22, diesel: 92.80 },

  // --- Assam ---
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, petrol: 98.19, diesel: 89.42 },
  { name: "Dibrugarh", state: "Assam", lat: 27.4728, lng: 94.9120, petrol: 98.80, diesel: 90.02 },
  { name: "Silchar", state: "Assam", lat: 24.8333, lng: 92.7789, petrol: 98.55, diesel: 89.78 },
  { name: "Jorhat", state: "Assam", lat: 26.7509, lng: 94.2037, petrol: 98.65, diesel: 89.88 },
  { name: "Tezpur", state: "Assam", lat: 26.6528, lng: 92.7926, petrol: 98.42, diesel: 89.66 },
  { name: "Nagaon", state: "Assam", lat: 26.3510, lng: 92.6765, petrol: 98.35, diesel: 89.58 },
  { name: "Tinsukia", state: "Assam", lat: 27.4922, lng: 95.3468, petrol: 98.90, diesel: 90.12 },

  // --- Jharkhand ---
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, petrol: 97.77, diesel: 92.42 },
  { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029, petrol: 97.90, diesel: 92.55 },
  { name: "Dhanbad", state: "Jharkhand", lat: 23.7957, lng: 86.4304, petrol: 97.85, diesel: 92.50 },
  { name: "Bokaro", state: "Jharkhand", lat: 23.6693, lng: 86.1511, petrol: 97.82, diesel: 92.47 },
  { name: "Hazaribagh", state: "Jharkhand", lat: 23.9971, lng: 85.3616, petrol: 97.88, diesel: 92.53 },
  { name: "Deoghar", state: "Jharkhand", lat: 24.4820, lng: 86.6996, petrol: 97.95, diesel: 92.60 },

  // --- Chhattisgarh ---
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, petrol: 101.19, diesel: 94.30 },
  { name: "Bilaspur", state: "Chhattisgarh", lat: 22.0797, lng: 82.1409, petrol: 101.35, diesel: 94.45 },
  { name: "Durg", state: "Chhattisgarh", lat: 21.1938, lng: 81.2849, petrol: 101.22, diesel: 94.33 },
  { name: "Korba", state: "Chhattisgarh", lat: 22.3595, lng: 82.7501, petrol: 101.42, diesel: 94.52 },
  { name: "Jagdalpur", state: "Chhattisgarh", lat: 19.0778, lng: 82.0239, petrol: 101.60, diesel: 94.70 },

  // --- Uttarakhand ---
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, petrol: 93.41, diesel: 88.32 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642, petrol: 93.50, diesel: 88.40 },
  { name: "Nainital", state: "Uttarakhand", lat: 29.3919, lng: 79.4542, petrol: 93.80, diesel: 88.70 },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676, petrol: 93.45, diesel: 88.36 },
  { name: "Mussoorie", state: "Uttarakhand", lat: 30.4598, lng: 78.0664, petrol: 93.75, diesel: 88.65 },
  { name: "Rudrapur", state: "Uttarakhand", lat: 28.9845, lng: 79.4141, petrol: 93.60, diesel: 88.50 },
  { name: "Kashipur", state: "Uttarakhand", lat: 29.2176, lng: 78.9593, petrol: 93.58, diesel: 88.48 },

  // --- Himachal Pradesh ---
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, petrol: 95.96, diesel: 87.94 },
  { name: "Manali", state: "Himachal Pradesh", lat: 32.2396, lng: 77.1887, petrol: 96.40, diesel: 88.35 },
  { name: "Dharamshala", state: "Himachal Pradesh", lat: 32.2190, lng: 76.3234, petrol: 96.20, diesel: 88.18 },
  { name: "Kullu", state: "Himachal Pradesh", lat: 31.9578, lng: 77.1094, petrol: 96.30, diesel: 88.26 },
  { name: "Solan", state: "Himachal Pradesh", lat: 30.9045, lng: 77.0967, petrol: 96.05, diesel: 88.03 },
  { name: "Mandi", state: "Himachal Pradesh", lat: 31.7080, lng: 76.9318, petrol: 96.12, diesel: 88.10 },
  { name: "Bilaspur HP", state: "Himachal Pradesh", lat: 31.3316, lng: 76.7644, petrol: 96.08, diesel: 88.06 },

  // --- Jammu & Kashmir ---
  { name: "Srinagar", state: "Jammu & Kashmir (UT)", lat: 34.0837, lng: 74.7973, petrol: 100.81, diesel: 86.48 },
  { name: "Jammu", state: "Jammu & Kashmir (UT)", lat: 32.7266, lng: 74.8570, petrol: 99.90, diesel: 85.68 },
  { name: "Anantnag", state: "Jammu & Kashmir (UT)", lat: 33.7311, lng: 75.1487, petrol: 100.95, diesel: 86.60 },
  { name: "Baramulla", state: "Jammu & Kashmir (UT)", lat: 34.1994, lng: 74.3635, petrol: 101.05, diesel: 86.70 },
  { name: "Udhampur", state: "Jammu & Kashmir (UT)", lat: 32.9237, lng: 75.1417, petrol: 100.05, diesel: 85.82 },
  { name: "Katra", state: "Jammu & Kashmir (UT)", lat: 32.9916, lng: 74.9315, petrol: 100.10, diesel: 85.87 },
  { name: "Pahalgam", state: "Jammu & Kashmir (UT)", lat: 34.0151, lng: 75.3182, petrol: 101.15, diesel: 86.78 },
  { name: "Gulmarg", state: "Jammu & Kashmir (UT)", lat: 34.0484, lng: 74.3805, petrol: 101.22, diesel: 86.85 },

  // --- Ladakh ---
  { name: "Leh", state: "Ladakh (UT)", lat: 34.1526, lng: 77.5770, petrol: 103.95, diesel: 88.56 },

  // --- Goa ---
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278, petrol: 97.09, diesel: 89.50 },
  { name: "Margao", state: "Goa", lat: 15.2832, lng: 73.9862, petrol: 97.18, diesel: 89.58 },
  { name: "Vasco da Gama", state: "Goa", lat: 15.3958, lng: 73.8157, petrol: 97.14, diesel: 89.54 },
  { name: "Mapusa", state: "Goa", lat: 15.5937, lng: 73.8142, petrol: 97.12, diesel: 89.52 },

  // --- North East ---
  { name: "Imphal", state: "Manipur", lat: 24.8170, lng: 93.9368, petrol: 99.12, diesel: 87.68 },
  { name: "Agartala", state: "Tripura", lat: 23.8315, lng: 91.2868, petrol: 97.57, diesel: 87.22 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933, petrol: 96.83, diesel: 87.60 },
  { name: "Tura", state: "Meghalaya", lat: 25.5138, lng: 90.2201, petrol: 97.10, diesel: 87.88 },
  { name: "Aizawl", state: "Mizoram", lat: 23.7271, lng: 92.7176, petrol: 93.93, diesel: 80.58 },
  { name: "Kohima", state: "Nagaland", lat: 25.6751, lng: 94.1086, petrol: 97.74, diesel: 90.93 },
  { name: "Dimapur", state: "Nagaland", lat: 25.9091, lng: 93.7266, petrol: 97.68, diesel: 90.88 },
  { name: "Itanagar", state: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053, petrol: 90.94, diesel: 80.41 },
  { name: "Tawang", state: "Arunachal Pradesh", lat: 27.5859, lng: 91.8594, petrol: 91.55, diesel: 81.00 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3314, lng: 88.6138, petrol: 101.75, diesel: 89.43 },
  { name: "Namchi", state: "Sikkim", lat: 27.1670, lng: 88.3637, petrol: 101.85, diesel: 89.52 },

  // --- Island UTs ---
  { name: "Port Blair", state: "A&N Islands (UT)", lat: 11.6234, lng: 92.7265, petrol: 82.42, diesel: 78.01 },
  { name: "Kavaratti", state: "Lakshadweep (UT)", lat: 10.5593, lng: 72.6358, petrol: 99.86, diesel: 92.32 },

  // --- Puducherry ---
  { name: "Puducherry", state: "Puducherry (UT)", lat: 11.9416, lng: 79.8083, petrol: 96.08, diesel: 86.38 },
  { name: "Karaikal", state: "Puducherry (UT)", lat: 10.9254, lng: 79.8380, petrol: 96.12, diesel: 86.42 },
  { name: "Yanam", state: "Puducherry (UT)", lat: 16.7330, lng: 82.2170, petrol: 96.18, diesel: 86.48 },
  { name: "Mahe", state: "Puducherry (UT)", lat: 11.7011, lng: 75.5363, petrol: 96.15, diesel: 86.45 },
];
