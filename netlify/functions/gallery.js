import { loadTenantConfig } from './lib/tenant-config.js';

export async function handler(event) {
  const { tenant, projectId, skipLead } = event.queryStringParameters || {};

  if (!tenant || !projectId) {
    return {
      statusCode: 400,
      body: 'Missing tenant or projectId parameter'
    };
  }

  const shouldSkipLead = skipLead === 'true';

  try {
    // Load tenant configuration
    const config = loadTenantConfig();
    const tenantConfig = config.tenants[tenant];

    if (!tenantConfig) {
      return {
        statusCode: 404,
        body: 'Tenant not found'
      };
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>View Your Project Photos - ${tenantConfig.name}</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Outfit', -apple-system, system-ui, sans-serif;
      background: #f5f5f5;
      color: #212529;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, #2C2C2C 0%, #1a1a1a 100%);
      padding: 30px 40px;
      text-align: center;
      color: white;
    }

    .logo {
      max-width: 134px;
      height: auto;
      margin: 0 auto 20px;
      display: block;
    }

    .company-name {
      font-size: 32px;
      font-weight: 700;
      color: white;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    /* Lead Capture Form */
    .lead-capture {
      display: none;
    }

    .lead-capture h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 15px;
      color: #212529;
    }

    .lead-capture .subtitle {
      color: #6C757D;
      font-size: 18px;
      margin-bottom: 35px;
      line-height: 1.6;
    }

    .input-group {
      margin-bottom: 20px;
      text-align: left;
    }

    label {
      display: block;
      color: #212529;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    input[type="text"],
    input[type="email"],
    input[type="tel"] {
      width: 100%;
      padding: 16px;
      background: #FFFFFF;
      border: 2px solid #E5E5E5;
      border-radius: 8px;
      color: #212529;
      font-size: 16px;
      font-family: 'Outfit', sans-serif;
      transition: all 0.2s;
    }

    input[type="text"]:focus,
    input[type="email"]:focus,
    input[type="tel"]:focus {
      outline: none;
      border-color: ${tenantConfig.colors.primary};
      box-shadow: 0 0 0 4px ${tenantConfig.colors.primary}20;
    }

    .btn {
      width: 100%;
      padding: 18px;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 10px;
      background: ${tenantConfig.colors.primary};
      color: #212529;
    }

    .btn:hover {
      background: ${tenantConfig.colors.primaryHover};
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${tenantConfig.colors.primary}60;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Photo Gallery */
    .gallery-container {
      display: block;
    }

    .project-info {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .project-info h2 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .project-info .address {
      color: #6C757D;
      font-size: 18px;
      margin-bottom: 15px;
    }

    .photo-count {
      color: #6C757D;
      font-size: 16px;
      font-weight: 600;
    }

    .photo-grid {
      position: relative;
      width: 100%;
      overflow: hidden;
      margin-bottom: 40px;
    }

    .carousel-container {
      display: flex;
      transition: transform 0.3s ease-out;
      gap: 20px;
    }

    .photo-item {
      flex: 0 0 100%;
      max-width: 100%;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      cursor: pointer;
    }

    .photo-item img {
      width: 100%;
      height: 500px;
      object-fit: contain;
      background: #000;
      display: block;
    }

    .carousel-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      z-index: 10;
      transition: background 0.3s;
    }

    .carousel-nav:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .carousel-nav.prev {
      left: 20px;
    }

    .carousel-nav.next {
      right: 20px;
    }

    .carousel-indicators {
      text-align: center;
      padding: 20px 0;
      color: #6C757D;
      font-size: 14px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .photo-item img {
        height: 400px;
      }

      .carousel-nav {
        width: 40px;
        height: 40px;
        font-size: 20px;
      }

      .carousel-nav.prev {
        left: 10px;
      }

      .carousel-nav.next {
        right: 10px;
      }
    }

    .photo-info {
      padding: 15px;
    }

    .photo-date {
      color: #6C757D;
      font-size: 14px;
      font-weight: 500;
    }

    /* Lightbox */
    .lightbox {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }

    .lightbox.active {
      display: flex;
    }

    .lightbox img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
    }

    .lightbox-close {
      position: absolute;
      top: 30px;
      right: 40px;
      color: white;
      font-size: 40px;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      line-height: 1;
      transition: opacity 0.3s;
    }

    .lightbox-close:hover {
      opacity: 0.7;
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 48px;
      padding: 20px 25px;
      cursor: pointer;
      transition: background 0.3s;
      border-radius: 8px;
    }

    .lightbox-nav:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .lightbox-nav.prev {
      left: 30px;
    }

    .lightbox-nav.next {
      right: 30px;
    }

    .loader {
      display: inline-block;
      border: 4px solid #F8F9FA;
      border-top: 4px solid ${tenantConfig.colors.primary};
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 50px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .contact-cta {
      background: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      margin-top: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .contact-cta h3 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .contact-cta p {
      color: #6C757D;
      margin-bottom: 25px;
      font-size: 17px;
    }

    .contact-cta .btn {
      max-width: 300px;
      margin: 0 auto;
      display: block;
      text-decoration: none;
      background: #28A745;
      color: white;
    }

    .contact-cta .btn:hover {
      background: #218838;
    }

    @media (max-width: 768px) {
      .lightbox-nav {
        font-size: 32px;
        padding: 15px 20px;
      }

      .lightbox-nav.prev {
        left: 10px;
      }

      .lightbox-nav.next {
        right: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    ${tenantConfig.logo ? `<img src="${tenantConfig.logo}" alt="${tenantConfig.name}" class="logo">` : `<div class="company-name">${tenantConfig.name}</div>`}
  </div>

  <!-- Lead Capture Form -->
  <div class="lead-capture" id="leadCapture">
    <h1>We Found Your Project!</h1>
    <p class="subtitle">Enter your information to view your project photos</p>

    <form id="leadForm">
      <div class="input-group">
        <label for="firstName">First Name</label>
        <input type="text" id="firstName" required>
      </div>

      <div class="input-group">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" required>
      </div>

      <div class="input-group">
        <label for="email">Email</label>
        <input type="email" id="email" required>
      </div>

      <div class="input-group">
        <label for="phone">Phone</label>
        <input type="tel" id="phone" required>
      </div>

      <button type="submit" class="btn">View My Photos</button>
    </form>
  </div>

  <!-- Photo Gallery (hidden until form submitted) -->
  <div class="container">
    <div class="gallery-container" id="galleryContainer">
      <div class="project-info">
        <h2 id="projectName">Loading...</h2>
        <div class="address" id="projectAddress"></div>
        <div class="photo-count" id="photoCount"></div>
      </div>

      <div class="photo-grid" id="photoGrid">
        <div class="loader"></div>
      </div>

      <div class="contact-cta">
        <h3>Ready to get started?</h3>
        <p>Call us at <a href="tel:${tenantConfig.phone}" style="color: #28A745; text-decoration: none; font-weight: 600;">${tenantConfig.phone}</a> or click below.</p>
        <a href="/.netlify/functions/lead-form?tenant=${tenant}&projectId=${projectId}" class="btn">Schedule an Appointment</a>
      </div>
    </div>
  </div>

  <!-- Lightbox -->
  <div class="lightbox" id="lightbox">
    <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
    <button class="lightbox-nav prev" onclick="navigatePhoto(-1)">‹</button>
    <img id="lightboxImage" src="" alt="">
    <button class="lightbox-nav next" onclick="navigatePhoto(1)">›</button>
  </div>

  <script>
    const tenant = '${tenant}';
    const projectId = '${projectId}';
    let photos = [];
    let currentPhotoIndex = 0;

    // Automatically load photos on page load
    document.addEventListener('DOMContentLoaded', () => {
      loadPhotos();
    });

    async function loadPhotos() {
      try {
        console.log('Loading photos for tenant:', tenant, 'projectId:', projectId);
        const response = await fetch(\`/.netlify/functions/photos?tenant=\${tenant}&projectId=\${projectId}\`);
        const data = await response.json();

        console.log('Photos response:', response.ok, 'data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load photos');
        }

        photos = data.photos;
        const project = data.project;

        console.log('Loaded photos:', photos.length, photos);

        // Update project info
        document.getElementById('projectName').textContent = project.name || project.address?.street_address_1 || 'Your Project';
        document.getElementById('projectAddress').textContent = formatAddress(project.address);
        document.getElementById('photoCount').textContent = \`\${photos.length} Item\${photos.length !== 1 ? 's' : ''}\`;

        // Render photos
        console.log('About to render photos...');
        renderPhotos();
        console.log('Photos rendered');

      } catch (error) {
        console.error('Error loading photos:', error);
        document.getElementById('photoGrid').innerHTML = \`
          <div style="text-align: center; padding: 40px; color: #DC3545;">
            <p>Failed to load photos. Please try again later.</p>
            <p style="font-size: 14px; margin-top: 10px;">Error: \${error.message}</p>
          </div>
        \`;
      }
    }

    function formatAddress(address) {
      if (!address) return '';
      const parts = [
        address.street_address_1,
        address.city,
        address.state,
        address.postal_code
      ].filter(Boolean);
      return parts.join(', ');
    }

    function renderPhotos() {
      console.log('renderPhotos called with', photos.length, 'items');
      const grid = document.getElementById('photoGrid');

      if (!grid) {
        console.error('photoGrid element not found!');
        return;
      }

      grid.innerHTML = '';

      if (photos.length === 0) {
        console.log('No photos to render');
        grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #6C757D;">No media found for this project.</div>';
        return;
      }

      // Sort media: videos first, then photos
      photos = [...photos].sort((a, b) => {
        if (a.media_type === 'video' && b.media_type !== 'video') return -1;
        if (a.media_type !== 'video' && b.media_type === 'video') return 1;
        return 0;
      });

      console.log('Rendering', photos.length, 'photos...');

      // Create carousel container
      const carousel = document.createElement('div');
      carousel.className = 'carousel-container';
      carousel.id = 'carouselContainer';

      photos.forEach((photo, index) => {
        console.log('Rendering photo', index, photo.media_type);
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.onclick = () => openLightbox(index);

        // Handle videos differently from photos
        if (photo.media_type === 'video') {
          // Create video element with poster/thumbnail
          const video = document.createElement('video');
          video.src = photo.uris?.find(uri => uri.type === 'video/mp4' || uri.type === 'video')?.uri || photo.uris?.[0]?.uri || '';
          video.style.width = '100%';
          video.style.height = '500px';
          video.style.objectFit = 'contain';
          video.style.background = '#000';
          video.controls = false;
          video.muted = true;
          video.preload = 'metadata';

          // Add play icon overlay
          const playIcon = document.createElement('div');
          playIcon.style.position = 'absolute';
          playIcon.style.top = '50%';
          playIcon.style.left = '50%';
          playIcon.style.transform = 'translate(-50%, -50%)';
          playIcon.style.fontSize = '64px';
          playIcon.style.color = 'white';
          playIcon.style.textShadow = '0 2px 10px rgba(0,0,0,0.5)';
          playIcon.innerHTML = '▶';

          photoItem.style.position = 'relative';
          photoItem.appendChild(video);
          photoItem.appendChild(playIcon);
        } else {
          const img = document.createElement('img');
          img.src = photo.uris?.find(uri => uri.size === 768)?.uri || photo.uris?.[0]?.uri || '';
          img.alt = 'Project photo';
          img.loading = 'lazy';
          photoItem.appendChild(img);
        }

        carousel.appendChild(photoItem);
      });

      grid.appendChild(carousel);

      // Add navigation buttons
      if (photos.length > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-nav prev';
        prevBtn.innerHTML = '‹';
        prevBtn.onclick = () => navigateCarousel(-1);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-nav next';
        nextBtn.innerHTML = '›';
        nextBtn.onclick = () => navigateCarousel(1);

        grid.appendChild(prevBtn);
        grid.appendChild(nextBtn);
      }

      // Add indicators
      const indicators = document.createElement('div');
      indicators.className = 'carousel-indicators';
      indicators.id = 'carouselIndicators';
      indicators.textContent = \`1 / \${photos.length}\`;
      grid.appendChild(indicators);

      // Initialize carousel
      currentPhotoIndex = 0;
      updateCarousel();
    }

    function navigateCarousel(direction) {
      currentPhotoIndex += direction;
      if (currentPhotoIndex < 0) currentPhotoIndex = photos.length - 1;
      if (currentPhotoIndex >= photos.length) currentPhotoIndex = 0;
      updateCarousel();
    }

    function updateCarousel() {
      const carousel = document.getElementById('carouselContainer');
      const indicators = document.getElementById('carouselIndicators');
      if (carousel) {
        carousel.style.transform = \`translateX(-\${currentPhotoIndex * 100}%)\`;
      }
      if (indicators) {
        indicators.textContent = \`\${currentPhotoIndex + 1} / \${photos.length}\`;
      }
    }

    // Add touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('DOMContentLoaded', () => {
      const grid = document.getElementById('photoGrid');
      if (grid) {
        grid.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
        });

        grid.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowLeft') navigateCarousel(-1);
          if (e.key === 'ArrowRight') navigateCarousel(1);
        });
      }
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) {
        navigateCarousel(1); // Swipe left
      }
      if (touchEndX > touchStartX + swipeThreshold) {
        navigateCarousel(-1); // Swipe right
      }
    }

    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    function openLightbox(index) {
      currentPhotoIndex = index;
      const photo = photos[index];
      const lightbox = document.getElementById('lightbox');
      const lightboxImg = document.getElementById('lightboxImage');

      // Handle videos in lightbox
      if (photo.media_type === 'video') {
        // Replace img with video element for playback
        const currentElement = document.getElementById('lightboxImage');
        if (currentElement.tagName !== 'VIDEO') {
          const video = document.createElement('video');
          video.id = 'lightboxImage';
          video.src = '';
          currentElement.replaceWith(video);
        }

        const video = document.getElementById('lightboxImage');
        video.src = photo.uris?.find(uri => uri.type === 'video/mp4' || uri.type === 'video')?.uri || photo.uris?.[0]?.uri || '';
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = '90%';
        video.style.maxHeight = '90%';
        video.style.objectFit = 'contain';
      } else {
        // If current element is video, replace with img
        const currentElement = document.getElementById('lightboxImage');
        if (currentElement.tagName === 'VIDEO') {
          const img = document.createElement('img');
          img.id = 'lightboxImage';
          img.src = '';
          img.alt = '';
          currentElement.replaceWith(img);
        }

        const lightboxImage = document.getElementById('lightboxImage');
        lightboxImage.src = photo.uris?.find(uri => uri.size === 2048)?.uri || photo.uris?.[photo.uris.length - 1]?.uri || '';
      }

      lightbox.classList.add('active');
    }

    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
    }

    function navigatePhoto(direction) {
      currentPhotoIndex += direction;
      if (currentPhotoIndex < 0) currentPhotoIndex = photos.length - 1;
      if (currentPhotoIndex >= photos.length) currentPhotoIndex = 0;
      openLightbox(currentPhotoIndex);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('lightbox').classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigatePhoto(-1);
      if (e.key === 'ArrowRight') navigatePhoto(1);
    });
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      },
      body: html
    };

  } catch (error) {
    console.error('Error generating gallery page:', error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`
    };
  }
}
