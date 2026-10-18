export type ComponentId =
  | 'bezel'
  | 'display'
  | 'input-cover'
  | 'mainboard'
  | 'cooling'
  | 'memory'
  | 'storage'
  | 'battery'
  | 'expansion-cards'
  | 'bottom-chassis';

export interface ExplodedPartSpec {
  id: ComponentId;
  code: string;
  name: string;
  shortLabel: string;
  category: string;
  specSummary: string;
  description: string;
  fastenerInfo: string;
  explodeOffset: [number, number, number];
  explodeRotation?: [number, number, number];
  annotationAnchor: [number, number, number];
}

export const EXPLODED_PARTS: ExplodedPartSpec[] = [
  {
    id: 'bezel',
    code: 'MOD-01 · BEZEL',
    name: 'Magnetic Display Bezel',
    shortLabel: 'Magnetic Bezel',
    category: 'Enclosure & Customization',
    specSummary: 'Tool-free magnetic snap · 5 colors or 3D-printable',
    description:
      'Snaps into place magnetically over the display panel with alignment pins. Swap between Translucent, Solid, Pastel, or Loud colors in seconds.',
    fastenerInfo: '0 screws · Magnetic retention',
    explodeOffset: [0, 1.45, 1.35],
    explodeRotation: [-0.15, 0, 0],
    annotationAnchor: [1.95, 1.65, 0.85],
  },
  {
    id: 'display',
    code: 'MOD-02 · DISPLAY',
    name: '2880 × 1920 120 Hz Matte Display & CNC Lid',
    shortLabel: '120 Hz Matte Display',
    category: 'Visual Output',
    specSummary: '2880 × 1920 matte · 120 Hz · 13.5" / 16" · Color-accurate',
    description:
      'High-resolution matte panel housed in a CNC-machined aluminum lid. Attached via replaceable hinges and a single eDP display cable—no glued glass.',
    fastenerInfo: '4× T5 Torx fasteners · QR-coded replacement guide',
    explodeOffset: [0, 1.75, -1.1],
    explodeRotation: [-0.22, 0, 0],
    annotationAnchor: [-2.0, 2.1, -0.8],
  },
  {
    id: 'input-cover',
    code: 'MOD-03 · INPUT DECK',
    name: 'Input Cover, Keyboard & Hot-Swappable Modules',
    shortLabel: 'Input Cover & Deck',
    category: 'Human Interface',
    specSummary: 'Captive T5 screws · Magnetic Numpad, LED Matrix (34×9), RGB Macropad',
    description:
      'Top cover lifts off cleanly on Laptop 13, while Laptop 16 features magnetic rails supporting hot-swappable Numpad, 34×9 LED Matrix, RGB Macropad, and Spacers.',
    fastenerInfo: '5× captive T5 Torx screws (chassis underside)',
    explodeOffset: [0, 1.15, 0.15],
    explodeRotation: [0.06, 0, 0],
    annotationAnchor: [2.1, 1.15, 0.2],
  },
  {
    id: 'cooling',
    code: 'MOD-04 · THERMALS',
    name: 'Thermal Cooling System (Fan & Copper Heatpipes)',
    shortLabel: 'Cooling Assembly',
    category: 'Thermal Architecture',
    specSummary: 'High-efficiency blower fan · Dual copper heatpipes · Fin stack',
    description:
      'Modular thermal dissipation assembly engineered for sustained boost clocks across generations of mobile silicon, plus optional RTX 5070 Graphics Bay on Laptop 16.',
    fastenerInfo: 'Captive spring-tensioned heatsink screws',
    explodeOffset: [-0.25, 0.72, -0.45],
    explodeRotation: [0, 0.08, 0],
    annotationAnchor: [-2.1, 0.85, -0.45],
  },
  {
    id: 'memory',
    code: 'MOD-05 · MEMORY',
    name: 'Socketed DDR5 Memory (Up to 96 GB)',
    shortLabel: '96 GB Socketed DDR5',
    category: 'System Memory',
    specSummary: 'Up to 96 GB DDR5 · Dual-channel SO-DIMM · Swappable',
    description:
      'Unlike soldered ultrabooks, Framework uses standard socketed DDR5 SO-DIMM slots with protective mylar shields and printed QR guides.',
    fastenerInfo: '0 screws · Dual tool-free spring latches',
    explodeOffset: [0.85, 0.62, -0.1],
    explodeRotation: [0, 0, -0.08],
    annotationAnchor: [2.15, 0.65, -0.1],
  },
  {
    id: 'storage',
    code: 'MOD-06 · STORAGE',
    name: 'M.2 NVMe Storage (Up to 8 TB)',
    shortLabel: '8 TB NVMe SSD',
    category: 'Non-Volatile Storage',
    specSummary: 'Up to 8 TB PCIe NVMe · Replace the drive, not the laptop',
    description:
      'Standard M.2 2280 NVMe slot positioned for immediate access under the input cover. Keep your data and upgrade capacity in under two minutes.',
    fastenerInfo: '1× labeled T5 Torx retention fastener',
    explodeOffset: [-0.95, 0.55, 0.05],
    explodeRotation: [0, 0, 0.06],
    annotationAnchor: [-2.15, 0.55, 0.15],
  },
  {
    id: 'mainboard',
    code: 'MOD-07 · MAINBOARD',
    name: 'Replaceable Mainboard (AMD Ryzen AI 300)',
    shortLabel: 'Ryzen AI 300 Mainboard',
    category: 'Core Compute Platform',
    specSummary: 'Up to 12 CPU cores · AMD Ryzen AI 300 · Public schematics & EC firmware',
    description:
      'Every fastener is silkscreen-labeled directly on the PCB. When next year’s silicon arrives, swap only the mainboard—and reuse the old board as a standalone desktop.',
    fastenerInfo: '5× color-coded T5 Torx mainboard screws',
    explodeOffset: [0, 0.15, -0.15],
    explodeRotation: [0, 0, 0],
    annotationAnchor: [-2.15, 0.15, -0.25],
  },
  {
    id: 'battery',
    code: 'MOD-08 · BATTERY',
    name: 'No-Glue Li-Ion Battery Pack',
    shortLabel: 'Screw-Mounted Battery',
    category: 'Power Subsystem',
    specSummary: 'Zero glue · Captive fasteners · On-module QR repair guide',
    description:
      'Consumable lithium-ion pack secured strictly with captive fasteners and a pull-tab connector—never glued into the palmrest.',
    fastenerInfo: 'Captive T5 Torx screws · Zero adhesive',
    explodeOffset: [0, -0.22, 0.72],
    explodeRotation: [0.05, 0, 0],
    annotationAnchor: [2.1, -0.25, 0.75],
  },
  {
    id: 'expansion-cards',
    code: 'MOD-09 · PORTS',
    name: 'Hot-Swappable USB-C Expansion Cards (4 / 6 Slots)',
    shortLabel: 'Expansion Cards',
    category: 'Modular I/O System',
    specSummary: '4 slots (Laptop 13) / 6 slots (Laptop 16) · 10 card types · Open reference designs',
    description:
      'USB-C-based Expansion Cards slide directly into recessed chassis bays on either side—even while the machine is powered on. No reboot, no tools.',
    fastenerInfo: 'Bottom latch release button · Tool-free hot-swap',
    explodeOffset: [1.55, -0.15, 0.1],
    explodeRotation: [0, 0, 0],
    annotationAnchor: [2.25, -0.55, 0.1],
  },
  {
    id: 'bottom-chassis',
    code: 'MOD-10 · CHASSIS',
    name: 'CNC Aluminum Bottom Cover',
    shortLabel: 'CNC Aluminum Chassis',
    category: 'Structural Enclosure',
    specSummary: 'Formed & milled recycled aluminum · Captive fasteners · Integrated speakers',
    description:
      'Engineered to outlast multiple upgrade cycles. Houses captive T5 screws that stay attached to the cover so you never lose a fastener during a repair.',
    fastenerInfo: '5× captive T5 Torx screws · Included Framework Screwdriver',
    explodeOffset: [0, -0.78, 0],
    explodeRotation: [0, 0, 0],
    annotationAnchor: [-2.1, -0.8, 0.2],
  },
];

export interface BezelSwatch {
  id: string;
  name: string;
  hex: string;
  styleNote: string;
}

export const BEZEL_SWATCHES: BezelSwatch[] = [
  { id: 'black', name: 'Matte Black', hex: '#1A1F2B', styleNote: 'Solid stealth finish' },
  { id: 'purple', name: 'Translucent Purple', hex: '#6B4FBB', styleNote: 'Translucent atomic purple' },
  { id: 'lime', name: 'Signal Lime', hex: '#C8FF3A', styleNote: 'Loud high-visibility accent' },
  { id: 'lavender', name: 'Pastel Lavender', hex: '#E1D8F0', styleNote: 'Soft pastel matte' },
  { id: 'orange', name: 'Framework Orange', hex: '#FF7A4F', styleNote: 'Signature industrial orange' },
];

export interface InputModuleOption {
  id: 'numpad' | 'led-matrix' | 'rgb-macropad' | 'spacers';
  code: string;
  title: string;
  description: string;
}

export const INPUT_MODULES: InputModuleOption[] = [
  {
    id: 'numpad',
    code: 'MODULE 01',
    title: 'Numpad',
    description: 'Full numpad, magnetic.',
  },
  {
    id: 'led-matrix',
    code: 'MODULE 02',
    title: 'LED Matrix',
    description: '34 × 9 grid, open firmware.',
  },
  {
    id: 'rgb-macropad',
    code: 'MODULE 03',
    title: 'RGB Macropad',
    description: 'Custom keys, custom lights.',
  },
  {
    id: 'spacers',
    code: 'MODULE 04',
    title: 'Spacers',
    description: 'Color-shift, blank, your call.',
  },
];

export interface ExpansionCardType {
  id: string;
  label: string;
  highlighted?: boolean;
  specDetail: string;
  color: string;
}

export const EXPANSION_CARD_TYPES: ExpansionCardType[] = [
  { id: 'usb-c', label: 'USB-C', specDetail: 'USB4 / Thunderbolt passthrough · 240W PD charging + DisplayPort Alt Mode', color: '#8A94A6' },
  { id: 'usb-a', label: 'USB-A', specDetail: 'USB 3.2 Gen 2 Type-A · 10 Gbps legacy peripheral support', color: '#707B8C' },
  { id: 'hdmi', label: 'HDMI', specDetail: 'HDMI 2.1 (3rd Gen) · 4K 60Hz external display output', color: '#647082' },
  { id: 'dp', label: 'DisplayPort', specDetail: 'DisplayPort 1.4 · High-refresh multi-monitor daisy-chaining', color: '#586475' },
  { id: 'microsd', label: 'microSD', specDetail: 'UHS-I microSD reader · Flush-fit drone & action camera ingest', color: '#7D8799' },
  { id: 'sd', label: 'SD', specDetail: 'Full-size SDXC UHS-II reader · Built for photographers & editors', color: '#9BA5B5' },
  { id: 'ethernet', label: 'Ethernet', specDetail: 'RJ45 Gigabit network interface · Low-latency wired connectivity', color: '#6B4FBB' },
  { id: '2.5gbe', label: '2.5GbE', specDetail: 'Realtek 2.5 Gigabit Ethernet · High-throughput NAS & lab networking', color: '#FF8A4F' },
  { id: 'storage', label: 'Storage', highlighted: true, specDetail: '250 GB / 1 TB NVMe flash inside a pocket-sized Expansion Card', color: '#C8FF3A' },
  { id: 'audio', label: 'Audio', highlighted: true, specDetail: 'High-SNR DAC + 3.5mm TRRS combo jack with open reference design', color: '#C8FF3A' },
];

export interface OSChoice {
  id: 'windows' | 'fedora' | 'ubuntu';
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  description: string;
  screenTheme: {
    distroTitle: string;
    kernelOrBuild: string;
    accent: string;
    terminalLines: string[];
  };
}

export const OS_CHOICES: OSChoice[] = [
  {
    id: 'windows',
    badge: 'W',
    badgeBg: '#F5F7FA',
    badgeColor: '#0B0E13',
    title: 'Windows 11',
    description:
      'Pre-installed on every Pre-built Edition. Drivers maintained, day-one support, full driver pack published.',
    screenTheme: {
      distroTitle: 'Windows 11 Pro · Framework Driver Bundle v24.10',
      kernelOrBuild: 'NT 10.0.26100 · AMD Ryzen AI 300 Verified',
      accent: '#38BDF8',
      terminalLines: [
        'PS C:\\Framework> Get-FrameworkDeviceStatus',
        'Mainboard       : FRANEDAC7 (Ryzen AI 300 · 12C/24T)',
        'Memory          : 96 GB DDR5-5600 Dual-Channel [Socketed]',
        'Expansion Bays  : 6/6 Active · Hot-Swap Ready',
      ],
    },
  },
  {
    id: 'fedora',
    badge: 'F',
    badgeBg: '#C8FF3A',
    badgeColor: '#0B0E13',
    title: 'Fedora',
    description:
      'Officially supported. Deep engineering collaboration. Ships as a target reference for Fedora Workstation on Framework.',
    screenTheme: {
      distroTitle: 'Fedora Workstation 41 · Official Reference Target',
      kernelOrBuild: 'Linux 6.11.4-301.fc41.x86_64 · Wayland',
      accent: '#C8FF3A',
      terminalLines: [
        '$ fwupdmgr get-devices --filter="Framework"',
        '├─ Framework Laptop 13/16 System Firmware (v3.05 - Open EC)',
        '├─ Expansion Card Bay Controller : Hot-swap enabled',
        '└─ Power Profile : Balanced · 120Hz Matte eDP Panel Active',
      ],
    },
  },
  {
    id: 'ubuntu',
    badge: 'U',
    badgeBg: '#8A94A6',
    badgeColor: '#0B0E13',
    title: 'Ubuntu & friends',
    description:
      'Ubuntu certified. Plus community guides for Mint, elementary, Manjaro, MX, Zorin — bring your own.',
    screenTheme: {
      distroTitle: 'Ubuntu 24.04 LTS · Certified Hardware + NixOS / Arch Ready',
      kernelOrBuild: 'Linux 6.8.0-45-generic · Open EC Firmware',
      accent: '#FF8A4F',
      terminalLines: [
        '$ ectool version && lsusb -t',
        'RO version:    framework_ec_v3.05-open-source',
        '/:  Bus 01.Port 1: USB4 Root Hub -> Expansion Cards [USB-C, 2.5GbE, Storage]',
        'Status: All schematics & reference designs available on GitHub.',
      ],
    },
  },
];

export interface PresentationSceneMeta {
  index: number;
  id: string;
  slideNumberLabel: string;
  eyebrow: string;
  shortNavTitle: string;
  footerLeft: string;
  isExplodedFeature?: boolean;
}

export const PRESENTATION_SCENES: PresentationSceneMeta[] = [
  {
    index: 0,
    id: 'slide-01-hero',
    slideNumberLabel: '01 / 11',
    eyebrow: 'FRAMEWORK · LAPTOP 13 / 16',
    shortNavTitle: '01 · Overview',
    footerLeft: 'A keynote · the case for a computer you keep.',
  },
  {
    index: 1,
    id: 'slide-02-problem',
    slideNumberLabel: '02 / 11',
    eyebrow: 'A GROWING PROBLEM · 01',
    shortNavTitle: '02 · 62 Mt E-Waste',
    footerLeft: 'Source: UN Global E-waste Monitor 2024.',
  },
  {
    index: 2,
    id: 'slide-03-meet',
    slideNumberLabel: '03 / 11',
    eyebrow: 'MEET FRAMEWORK · 02',
    shortNavTitle: '03 · Meet Framework',
    footerLeft: 'Repairable. Upgradeable. Customizable.',
  },
  {
    index: 3,
    id: 'scene-exploded-3d',
    slideNumberLabel: '03B · 3D LAB',
    eyebrow: 'INTERACTIVE 3D ARCHITECTURE · STAGES A–E',
    shortNavTitle: '3D · Exploded View',
    footerLeft: 'Scroll or click any subsystem to inspect modular architecture.',
    isExplodedFeature: true,
  },
  {
    index: 4,
    id: 'slide-04-personas',
    slideNumberLabel: '04 / 11',
    eyebrow: 'BUILT FOR YOU · 03',
    shortNavTitle: '04 · Built For You',
    footerLeft: 'Three audiences. One laptop. Built to belong to all of them.',
  },
  {
    index: 5,
    id: 'slide-05-performance',
    slideNumberLabel: '05 / 11',
    eyebrow: 'PERFORMANCE · 04',
    shortNavTitle: '05 · Performance',
    footerLeft: 'Fast today. Faster next year.',
  },
  {
    index: 6,
    id: 'slide-06-expansion',
    slideNumberLabel: '06 / 11',
    eyebrow: 'EXPANSION CARDS · 05',
    shortNavTitle: '06 · Expansion Cards',
    footerLeft: 'Hot-swappable. Open reference designs on GitHub.',
  },
  {
    index: 7,
    id: 'slide-07-repair',
    slideNumberLabel: '07 / 11',
    eyebrow: 'REPAIR, REUSE, REPEAT · 06',
    shortNavTitle: '07 · Repair & Open',
    footerLeft: 'Framework’s founding design brief.',
  },
  {
    index: 8,
    id: 'slide-08-os',
    slideNumberLabel: '08 / 11',
    eyebrow: 'YOUR OS, YOUR RULES · 07',
    shortNavTitle: '08 · Your OS',
    footerLeft: 'Windows. Fedora. Ubuntu. Or write your own.',
  },
  {
    index: 9,
    id: 'slide-09-customize',
    slideNumberLabel: '09 / 11',
    eyebrow: 'CUSTOMIZE · 08',
    shortNavTitle: '09 · Customize',
    footerLeft: 'Designed to be customised. By you.',
  },
  {
    index: 10,
    id: 'slide-10-numbers',
    slideNumberLabel: '10 / 11',
    eyebrow: 'REAL NUMBERS · 09',
    shortNavTitle: '10 · Real Numbers',
    footerLeft: 'Indicative 12-year comparison vs typical mid-tier replace-cycle.',
  },
  {
    index: 11,
    id: 'slide-11-revolution',
    slideNumberLabel: '11 / 11',
    eyebrow: 'THE REPAIR REVOLUTION · 10',
    shortNavTitle: '11 · Finale',
    footerLeft: 'One computer. A long life. Yours.',
  },
];

