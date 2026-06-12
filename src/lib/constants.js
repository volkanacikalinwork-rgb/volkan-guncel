// ─── Istanbul Districts ────────────────────────────────────────────────────────
export const ISTANBUL_EUROPEAN = [
    'Beylikduzu','Kagithane','Basaksehir','Buyukcekmece','Eyupsultan',
    'Kucukcekmece','Bagcilar','Zeytinburnu','Sariyer','Sisli','Beyoglu',
    'Esenyurt','Bakirkoy','Bahcelievler','Avcilar','Silivri',
    'Gaziosmanpasa','Sultangazi','Gungoren'
  ];
  
  export const ISTANBUL_ASIAN = [
    'Kadikoy','Kartal','Umraniye','Uskudar','Pendik','Maltepe',
    'Besiktas','Beykoz','Atasehir','Cekmekoy','Sancaktepe','Tuzla','Sile'
  ];
  
  export const DISTRICTS_BY_CITY = {
    istanbul: [...ISTANBUL_EUROPEAN, ...ISTANBUL_ASIAN],
    alanya: ['Mahmutlar','Kargicak','Oba','Tepe','Avsallar','Kestel','Cikcilli','Demirtas','Tosmur'],
    antalya: ['Lara','Konyaalti','Kepez','Muratpasa','Dosemealti'],
    bodrum: ['Yalikavak','Turkbuku','Golturkbuku','Gumusluk','Turgutreis','Gundogan'],
    fethiye: ['Calis','Ovacik','Hisaronu','Kayakoy','Uzumlu'],
    izmir: ['Alsancak','Bornova','Buca','Cigli','Karsiyaka','Konak','Narlidere'],
    ankara: ['Cankaya','Kecioren','Mamak','Yenimahalle'],
    side: ['Colakli','Kumkoy','Evrenseki'],
    kas: [],
    other: []
  };
  
  // ─── Property Features ─────────────────────────────────────────────────────────
  export const ALL_FEATURES = [
    'Pool','Seafront','Security','Elevator','Outdoor Parking','Indoor Parking',
    'Indoor Pool','Private Pool','Private Garden','Garden','Gym','Playground',
    'Spa','Citizenship','City View','Air Conditioning','Nature View','Caretaker',
    'Camera','Floor Heating','Mosque','Cable TV / Satellite','Turkish Bath',
    'Beach Transfer Service','Game Room','Furniture','Natural Gas Infrastructure',
    'Residence Permit','White Goods','Rental Guarantee','Basketball','Football',
    'Tennis','Concierge Service','Alarm','Jacuzzi','Sea View','Private Parking',
    'City Center','Steam Room','Barbecue','Children\'s Pool','Generator',
    'Infinity Pool','Salt Room','Volleyball','Waterslide','Table Tennis',
    'En-suite Bathroom','Outdoor Cinema','Fire Alarm','Sauna','Cinema',
    'Social Facilities','Near the Sea','Winter Garden','Near to Metro',
    'Short Term Rent (Airbnb)','Wheelchair Access Ramp','Kids Play Area',
    'Bathroom Window','Invest in Turkey','Laundry Room','Ready in Alanya','Golf',
    'Billiards','Lobby','Cafe','Water Fountain','Dance Studio',
    'Vehicle Charging Station','Library','Residence in Complex','Terrace',
    'Temperature Controlled Pool','Lazy River','Petting Farm','Paintball',
    'Motor Town','Malibu Beach','Bike Track','Horse Riding','Fishing Lake',
    'Market','Bathtub','Go-Kart','Cricket','Surf','Skate Park','Restaurant',
    'Near Bus Stop','Jogging and Walking Track','Beach','Disabled Friendly',
    'Bowling','Relax Room','Snow Room','Sports Town','Pergolas',
    'International School','Dressing Room','Poolside Bar','Conference Room',
    'Water Town','Shops','Penthouse','Events','Natural Gas Basement',
    'Massage Room','Smart Home','Butterfly Garden','Yoga','Wellness Club'
  ];
  
  // ─── Languages ─────────────────────────────────────────────────────────────────
  export const DEFAULT_LANGUAGES = [
    { name: 'English',    code: 'en', native_name: 'English',      flag_emoji: '🇬🇧', rtl: false, order: 1,  is_default: true,  is_active: true },
    { name: 'Turkish',    code: 'tr', native_name: 'Türkçe',       flag_emoji: '🇹🇷', rtl: false, order: 2,  is_default: false, is_active: true },
    { name: 'German',     code: 'de', native_name: 'Deutsch',      flag_emoji: '🇩🇪', rtl: false, order: 3,  is_default: false, is_active: true },
    { name: 'French',     code: 'fr', native_name: 'Français',     flag_emoji: '🇫🇷', rtl: false, order: 4,  is_default: false, is_active: true },
    { name: 'Russian',    code: 'ru', native_name: 'Русский',      flag_emoji: '🇷🇺', rtl: false, order: 5,  is_default: false, is_active: true },
    { name: 'Arabic',     code: 'ar', native_name: 'العربية',      flag_emoji: '🇸🇦', rtl: true,  order: 6,  is_default: false, is_active: true },
    { name: 'Persian',    code: 'fa', native_name: 'فارسی',        flag_emoji: '🇮🇷', rtl: true,  order: 7,  is_default: false, is_active: true },
    { name: 'Bosnian',    code: 'bs', native_name: 'Bosanski',     flag_emoji: '🇧🇦', rtl: false, order: 8,  is_default: false, is_active: true },
    { name: 'Polish',     code: 'pl', native_name: 'Polski',       flag_emoji: '🇵🇱', rtl: false, order: 9,  is_default: false, is_active: false },
    { name: 'Swedish',    code: 'sv', native_name: 'Svenska',      flag_emoji: '🇸🇪', rtl: false, order: 10, is_default: false, is_active: false },
    { name: 'Dutch',      code: 'nl', native_name: 'Nederlands',   flag_emoji: '🇳🇱', rtl: false, order: 11, is_default: false, is_active: false },
    { name: 'Norwegian',  code: 'no', native_name: 'Norsk',        flag_emoji: '🇳🇴', rtl: false, order: 12, is_default: false, is_active: false },
    { name: 'Slovak',     code: 'sk', native_name: 'Slovenčina',   flag_emoji: '🇸🇰', rtl: false, order: 13, is_default: false, is_active: false },
    { name: 'Finnish',    code: 'fi', native_name: 'Suomi',        flag_emoji: '🇫🇮', rtl: false, order: 14, is_default: false, is_active: false },
    { name: 'Chinese',    code: 'zh', native_name: '中文',          flag_emoji: '🇨🇳', rtl: false, order: 15, is_default: false, is_active: false },
    { name: 'Danish',     code: 'da', native_name: 'Dansk',        flag_emoji: '🇩🇰', rtl: false, order: 16, is_default: false, is_active: false },
    { name: 'Lithuanian', code: 'lt', native_name: 'Lietuvių',     flag_emoji: '🇱🇹', rtl: false, order: 17, is_default: false, is_active: false },
    { name: 'Albanian',   code: 'sq', native_name: 'Shqip',        flag_emoji: '🇦🇱', rtl: false, order: 18, is_default: false, is_active: false },
    { name: 'Hebrew',     code: 'he', native_name: 'עברית',        flag_emoji: '🇮🇱', rtl: true,  order: 19, is_default: false, is_active: false },
    { name: 'Ukrainian',  code: 'uk', native_name: 'Українська',   flag_emoji: '🇺🇦', rtl: false, order: 20, is_default: false, is_active: false },
    { name: 'Serbian',    code: 'sr', native_name: 'Српски',       flag_emoji: '🇷🇸', rtl: false, order: 21, is_default: false, is_active: false },
    { name: 'Spanish',    code: 'es', native_name: 'Español',      flag_emoji: '🇪🇸', rtl: false, order: 22, is_default: false, is_active: false },
    { name: 'Portuguese', code: 'pt', native_name: 'Português',    flag_emoji: '🇵🇹', rtl: false, order: 23, is_default: false, is_active: false },
    { name: 'Kazakh',     code: 'kk', native_name: 'Қазақ',        flag_emoji: '🇰🇿', rtl: false, order: 24, is_default: false, is_active: false },
    { name: 'Tajik',      code: 'tg', native_name: 'Тоҷикӣ',       flag_emoji: '🇹🇯', rtl: false, order: 25, is_default: false, is_active: false },
    { name: 'Azeri',      code: 'az', native_name: 'Azərbaycan',   flag_emoji: '🇦🇿', rtl: false, order: 26, is_default: false, is_active: false },
    { name: 'Italian',    code: 'it', native_name: 'Italiano',     flag_emoji: '🇮🇹', rtl: false, order: 27, is_default: false, is_active: false },
    { name: 'Hindi',      code: 'hi', native_name: 'हिन्दी',        flag_emoji: '🇮🇳', rtl: false, order: 28, is_default: false, is_active: false },
    { name: 'Urdu',       code: 'ur', native_name: 'اردو',          flag_emoji: '🇵🇰', rtl: true,  order: 29, is_default: false, is_active: false },
    { name: 'Bengali',    code: 'bn', native_name: 'বাংলা',         flag_emoji: '🇧🇩', rtl: false, order: 30, is_default: false, is_active: false },
    { name: 'Malay',      code: 'ms', native_name: 'Bahasa Melayu', flag_emoji: '🇲🇾', rtl: false, order: 31, is_default: false, is_active: false },
    { name: 'Uzbek',      code: 'uz', native_name: "O'zbek",        flag_emoji: '🇺🇿', rtl: false, order: 32, is_default: false, is_active: false },
    { name: 'Bulgarian',  code: 'bg', native_name: 'Български',    flag_emoji: '🇧🇬', rtl: false, order: 33, is_default: false, is_active: false },
    { name: 'Irish',      code: 'ga', native_name: 'Gaeilge',      flag_emoji: '🇮🇪', rtl: false, order: 34, is_default: false, is_active: false },
    { name: 'Hungarian',  code: 'hu', native_name: 'Magyar',       flag_emoji: '🇭🇺', rtl: false, order: 35, is_default: false, is_active: false },
    { name: 'Romanian',   code: 'ro', native_name: 'Română',       flag_emoji: '🇷🇴', rtl: false, order: 36, is_default: false, is_active: false },
    { name: 'Slovenian',  code: 'sl', native_name: 'Slovenščina',  flag_emoji: '🇸🇮', rtl: false, order: 37, is_default: false, is_active: false },
    { name: 'Indonesian', code: 'id', native_name: 'Bahasa Indonesia', flag_emoji: '🇮🇩', rtl: false, order: 38, is_default: false, is_active: false },
    { name: 'Japanese',   code: 'ja', native_name: '日本語',          flag_emoji: '🇯🇵', rtl: false, order: 39, is_default: false, is_active: false },
    { name: 'Korean',     code: 'ko', native_name: '한국어',           flag_emoji: '🇰🇷', rtl: false, order: 40, is_default: false, is_active: false },
    { name: 'Kyrgyz',     code: 'ky', native_name: 'Кыргызча',     flag_emoji: '🇰🇬', rtl: false, order: 41, is_default: false, is_active: false }
  ];