export const identity = {
  name: 'Shayan Mondal',
  role: 'Developer',
  location: 'Bongaon, West Bengal, India',
  email: 'sayanroman9090@gmail.com',
  github: 'https://github.com/ShayanBytes',
  linkedin: 'https://www.linkedin.com/in/shayan-mondal-1338bb340/'
};

export const routes = ['enter', 'home', 'work', 'about', 'contact'];

// Per-route accent + organism behaviour. hues = [inner, outer] HSL hue range the organism breathes through.
export const routeMeta = {
  enter:   { accent: '#ffb224', hues: [32, 52],   shapes: ['tree', 'earth', 'robot', 'helix', 'bloom', 'spiral'], glow: 1 },
  home:    { accent: '#b8f53d', hues: [82, 152],  shapes: ['tree', 'earth', 'bloom', 'brackets', 'cell'], glow: 0.55 },
  work:    { accent: '#ff6a2b', hues: [18, 42],   shapes: ['monitor', 'terminal', 'folder', 'brackets'], glow: 0.55 },
  about:   { accent: '#7b8cff', hues: [222, 262], shapes: ['profile', 'helix', 'tree', 'hand'],          glow: 0.55 },
  contact: { accent: '#ff3d55', hues: [350, 24],  shapes: ['signal', 'envelope', 'earth', 'wave'],      glow: 0.55 }
};

export const projects = [
  {
    id: 'aethel-db',
    name: 'aethel-db',
    type: 'Distributed systems · Java',
    description: 'A key-value database built without external frameworks, exploring storage engines, networking, replication, and consensus.',
    href: 'https://github.com/ShayanBytes/aethel-db',
    hues: [95, 150], shapes: ['cell', 'brackets']
  },
  {
    id: 'omnitrace',
    name: 'OmniTrace',
    type: 'Developer tooling · TypeScript / Python',
    description: 'A full-stack tracing project that joins a TypeScript interface with a Python backend.',
    href: 'https://github.com/ShayanBytes/OmniTrace',
    hues: [190, 228], shapes: ['signal', 'wave']
  },
  {
    id: 'petuk',
    name: 'Petuk',
    type: 'Product engineering · TypeScript',
    description: 'A modern TypeScript product built with a Vite-based frontend architecture.',
    href: 'https://github.com/ShayanBytes/Petuk',
    hues: [28, 48], shapes: ['bloom', 'spiral']
  },
  {
    id: 'clipperx',
    name: 'ClipperX',
    type: 'Python tooling',
    description: 'A packaged Python project with documentation, source isolation, and automated tests.',
    href: 'https://github.com/ShayanBytes/ClipperX',
    hues: [268, 308], shapes: ['monitor', 'terminal']
  }
];
