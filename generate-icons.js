const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const logoPath = './public/images/logo.png';
  
  // Apple Touch Icon (180x180) - White background with logo fitted inside
  await sharp(logoPath)
    .resize({
      width: 140,
      height: 140,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
      background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for iOS icon
    })
    .toFile('./public/apple-touch-icon.png');
    
  // Android Manifest Icon 192
  await sharp(logoPath)
    .resize({
      width: 192,
      height: 192,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile('./public/images/logo-192.png');

  // Android Manifest Icon 512
  await sharp(logoPath)
    .resize({
      width: 512,
      height: 512,
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile('./public/images/logo-512.png');

  console.log('Icons generated successfully.');
}

generateIcons().catch(console.error);
