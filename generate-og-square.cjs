const sharp = require('sharp');

const svgCode = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <!-- white background, like LK21 -->
  <rect width="500" height="500" fill="#ffffff" />
  
  <g transform="translate(100, 100) scale(0.585)">
    <!-- 300x300 logo box -> 512 * 0.585 = 299.52 -->
    <rect width="512" height="512" rx="100" fill="#050505" stroke="#333" stroke-width="4"/>
    <path d="M140 160 h 60 v 140 h 100 v 50 h -160 z" fill="#fff" />
    <path d="M260 160 h 140 v 50 l -80 90 h 80 v 50 h -150 v -50 l 80 -90 h -70 z" fill="#d90429" />
  </g>
</svg>
`;

sharp(Buffer.from(svgCode))
  .jpeg({ quality: 95 })
  .toFile('public/og-image.jpg')
  .then(() => console.log('Created square og-image.jpg (500x500)'))
  .catch(err => console.error(err));
