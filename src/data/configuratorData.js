// @note Dummy data for grow tent configurator - no backend calls
export const tentShapes = [
  {
    id: '60x60',
    name: '60x60cm',
    description: 'Kompakt - ideal für kleine Räume',
    footprint: '60x60',
    minPlants: 1,
    maxPlants: 2,
    visualWidth: 60,
    visualDepth: 60
  },
  {
    id: '80x80',
    name: '80x80cm',
    description: 'Mittel - perfekte Balance',
    footprint: '80x80',
    minPlants: 2,
    maxPlants: 4,
    visualWidth: 80,
    visualDepth: 80
  },
  {
    id: '100x100',
    name: '100x100cm',
    description: 'Groß - für erfahrene Grower',
    footprint: '100x100',
    minPlants: 4,
    maxPlants: 6,
    visualWidth: 100,
    visualDepth: 100
  },
  {
    id: '120x60',
    name: '120x60cm',
    description: 'Rechteckig - maximale Raumnutzung',
    footprint: '120x60',
    minPlants: 3,
    maxPlants: 6,
    visualWidth: 120,
    visualDepth: 60
  }
];

export const tentSizes = [
  // 60x60 tents
  {
    id: 'tent_60x60x140',
    name: 'Basic 140cm',
    description: 'Einsteigermodell',
    price: 89.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '60x60x140cm',
    coverage: '1-2 Pflanzen',
    shapeId: '60x60',
    height: 140
  },
  {
    id: 'tent_60x60x160',
    name: 'Premium 160cm',
    description: 'Mehr Höhe für größere Pflanzen',
    price: 109.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '60x60x160cm',
    coverage: '1-2 Pflanzen',
    shapeId: '60x60',
    height: 160
  },
  // 80x80 tents
  {
    id: 'tent_80x80x160',
    name: 'Standard 160cm',
    description: 'Beliebtes Mittelklasse-Modell',
    price: 129.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '80x80x160cm',
    coverage: '2-4 Pflanzen',
    shapeId: '80x80',
    height: 160
  },
  {
    id: 'tent_80x80x180',
    name: 'Pro 180cm',
    description: 'Extra Höhe für optimales Wachstum',
    price: 149.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '80x80x180cm',
    coverage: '2-4 Pflanzen',
    shapeId: '80x80',
    height: 180
  },
  // 100x100 tents
  {
    id: 'tent_100x100x180',
    name: 'Professional 180cm',
    description: 'Für anspruchsvolle Projekte',
    price: 189.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '100x100x180cm',
    coverage: '4-6 Pflanzen',
    shapeId: '100x100',
    height: 180
  },
  {
    id: 'tent_100x100x200',
    name: 'Expert 200cm',
    description: 'Maximum an Wuchshöhe',
    price: 219.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '100x100x200cm',
    coverage: '4-6 Pflanzen',
    shapeId: '100x100',
    height: 200
  },
  // 120x60 tents
  {
    id: 'tent_120x60x160',
    name: 'Rectangular 160cm',
    description: 'Platzsparend und effizient',
    price: 139.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '120x60x160cm',
    coverage: '3-6 Pflanzen',
    shapeId: '120x60',
    height: 160
  },
  {
    id: 'tent_120x60x180',
    name: 'Rectangular Pro 180cm',
    description: 'Optimale Raumausnutzung',
    price: 169.99,
    image: '/assets/images/nopicture.jpg',
    dimensions: '120x60x180cm',
    coverage: '3-6 Pflanzen',
    shapeId: '120x60',
    height: 180
  }
];

export const lightTypes = [
  {
    id: 'led_quantum_board',
    name: 'LED Quantum Board',
    description: 'Energieeffizient, geringe Wärmeentwicklung',
    price: 159.99,
    image: '/assets/images/nopicture.jpg',
    wattage: '240W',
    coverage: 'Bis 100x100cm',
    spectrum: 'Vollspektrum',
    efficiency: 'Sehr hoch'
  },
  {
    id: 'led_cob',
    name: 'LED COB',
    description: 'Hochintensive COB-LEDs',
    price: 199.99,
    image: '/assets/images/nopicture.jpg',
    wattage: '300W',
    coverage: 'Bis 120x120cm',
    spectrum: 'Vollspektrum',
    efficiency: 'Hoch'
  },
  {
    id: 'hps_400w',
    name: 'HPS 400W',
    description: 'Bewährte Natriumdampflampe',
    price: 89.99,
    image: '/assets/images/nopicture.jpg',
    wattage: '400W',
    coverage: 'Bis 80x80cm',
    spectrum: 'Blüte-optimiert',
    efficiency: 'Mittel'
  },
  {
    id: 'cmh_315w',
    name: 'CMH 315W',
    description: 'Keramik-Metallhalogenid',
    price: 129.99,
    image: '/assets/images/nopicture.jpg',
    wattage: '315W',
    coverage: 'Bis 90x90cm',
    spectrum: 'Natürlich',
    efficiency: 'Hoch'
  }
];

export const ventilationTypes = [
  {
    id: 'basic_exhaust',
    name: 'Basic Abluft-Set',
    description: 'Lüfter + Aktivkohlefilter',
    price: 79.99,
    image: '/assets/images/nopicture.jpg',
    airflow: '187 m³/h',
    noiseLevel: '35 dB',
    includes: ['Rohrventilator', 'Aktivkohlefilter', 'Aluflexrohr']
  },
  {
    id: 'premium_ventilation',
    name: 'Premium Klima-Set',
    description: 'Komplette Klimakontrolle',
    price: 159.99,
    image: '/assets/images/nopicture.jpg',
    airflow: '280 m³/h',
    noiseLevel: '28 dB',
    includes: ['EC-Lüfter', 'Aktivkohlefilter', 'Thermostat', 'Feuchtigkeitsmesser']
  },
  {
    id: 'pro_climate',
    name: 'Profi Klima-System',
    description: 'Automatisierte Klimasteuerung',
    price: 299.99,
    image: '/assets/images/nopicture.jpg',
    airflow: '420 m³/h',
    noiseLevel: '25 dB',
    includes: ['Digitaler Controller', 'EC-Lüfter', 'Aktivkohlefilter', 'Zu-/Abluft']
  }
];

export const extras = [
  {
    id: 'ph_tester',
    name: 'pH-Messgerät',
    description: 'Digitales pH-Meter',
    price: 29.99,
    image: '/assets/images/nopicture.jpg',
    category: 'Messung'
  },
  {
    id: 'nutrients_starter',
    name: 'Dünger Starter-Set',
    description: 'Komplettes Nährstoff-Set',
    price: 39.99,
    image: '/assets/images/nopicture.jpg',
    category: 'Nährstoffe'
  },
  {
    id: 'grow_pots',
    name: 'Grow-Töpfe Set (5x)',
    description: '5x Stofftöpfe 11L',
    price: 24.99,
    image: '/assets/images/nopicture.jpg',
    category: 'Töpfe'
  },
  {
    id: 'timer_socket',
    name: 'Zeitschaltuhr',
    description: 'Digitale Zeitschaltuhr',
    price: 19.99,
    image: '/assets/images/nopicture.jpg',
    category: 'Steuerung'
  },
  {
    id: 'thermometer',
    name: 'Thermo-Hygrometer',
    description: 'Min/Max Temperatur & Luftfeuchtigkeit',
    price: 14.99,
    image: '/assets/images/nopicture.jpg',
    category: 'Messung'
  },
  {
    id: 'pruning_shears',
    name: 'Gartenschere',
    description: 'Präzisions-Gartenschere',
    price: 16.99,
    image: '/assets/images/nopicture.jpg',
    category: 'Werkzeug'
  }
]; 