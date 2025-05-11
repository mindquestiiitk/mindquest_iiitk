const fs = require('fs');
const https = require('https');
const path = require('path');

// Avatar URLs (using DiceBear API for consistent, free avatars)
const avatarUrls = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dustin&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=c1e1c5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=ffeba1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=d1d4f9',
];

// Download function
const downloadAvatar = (url, filename) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filename);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filename, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Main function
const downloadAllAvatars = async () => {
  try {
    // Create avatars directory if it doesn't exist
    const avatarsDir = path.join(__dirname);
    
    // Download each avatar
    const downloadPromises = avatarUrls.map((url, index) => {
      const filename = path.join(avatarsDir, `avatar-${index + 1}.svg`);
      return downloadAvatar(url, filename);
    });
    
    // Download default avatar
    downloadPromises.push(
      downloadAvatar(
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=d1d4f9',
        path.join(avatarsDir, 'default-avatar.svg')
      )
    );
    
    await Promise.all(downloadPromises);
    console.log('All avatars downloaded successfully!');
  } catch (error) {
    console.error('Error downloading avatars:', error);
  }
};

// Run the download
downloadAllAvatars();
