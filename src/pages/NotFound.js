// NotFound.js (With background darkening overlay)

import React from 'react';
import { Helmet } from 'react-helmet-async'; 

// --- 1. Essential Global CSS and Hover/Media Queries ---
const essentialStyles = `
    /* 1. Global Reset (Required for full-screen layout) */
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      /* FIX: Prevents scrolling on the page */
      overflow: hidden; 
      font-family: Arial, sans-serif;
    }

    /* 2. Hover Effect (Cannot be inline) */
    .btn:hover {
      background-color: #ffc155df !important; 
      filter: none;
    }

    /* 3. Media Queries (Cannot be inline) */
    @media (max-width: 600px) {
      /* Apply body/container padding adjustment */
      #not-found-container {
        padding-top: 5vh !important; 
      }
      /* Adjust font and padding for mobile blurb */
      .blurb-mobile-adjust {
        font-size: 1.2rem !important;
        padding: 0.8rem 1rem !important;
      }
      /* Adjust font and padding for mobile buttons */
      .btn-mobile-adjust {
        padding: 0.6rem 1.5rem !important;
        font-size: 1rem !important;
      }
      /* Stack buttons vertically on small screens */
      .btn-group-mobile-stack {
        flex-direction: column !important;
        gap: 0.5rem !important;
      }
    }
`;

// --- 2. Inline Style Objects ---

const containerStyle = {
  // Styles for the content container, replacing the old 'body' styles
  
  // 💡 NEW: Use multiple background values to layer a dark gradient over the image.
  // The first value (linear-gradient) is the dark overlay (black, 0.5 alpha).
  // The second value is your existing image.
  background: `
    linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), 
    url('/404notfound.png')
  `,
  
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundAttachment: 'fixed',
  backgroundSize: 'cover',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start', 
  alignItems: 'center',
  textAlign: 'center',
  color: '#ffffff',
  textShadow: '1px 1px 5px rgba(0,0,0,0.7)',
  paddingTop: '10vh',
  minHeight: '100vh', 
};

const blurbStyle = {
  fontSize: '1.5rem',
  marginBottom: '2rem',
  maxWidth: '600px',
  backgroundColor: 'rgba(255, 193, 85, 0.51)', // #ffc15583
  padding: '1rem 1.5rem',
  borderRadius: '10px',
  opacity: 1,
  color: '#fff',
};

const btnGroupStyle = {
  display: 'flex', 
  gap: '1rem',
};

const btnStyle = {
  textDecoration: 'none',
  color: '#fff',
  backgroundColor: 'rgba(255, 193, 85, 0.51)', // #ffc15583
  padding: '0.8rem 2rem',
  borderRadius: '5px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  transition: 'background-color 0.3s ease',
  cursor: 'pointer',
};


function NotFound() {
  return (
    <div> 
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>404 Not Found - Catholic Parishes</title>
        <style type="text/css">{essentialStyles}</style>
      </Helmet>

      <div id="not-found-container" style={containerStyle}>
        
        <div 
          className="blurb-mobile-adjust" 
          style={blurbStyle}
        >
          404 Not Found: The page you are looking for does not exist. If you think this is an inherent website error, please reach out to me to let me know using the button below. God Bless!
        </div>
        
        <div 
          className="btn-group-mobile-stack" 
          style={btnGroupStyle}
        >
          <a 
            href="/" 
            className="btn btn-mobile-adjust" 
            style={btnStyle}
          >
            Return to Map
          </a> 
          <a 
            href="/contact" 
            className="btn btn-mobile-adjust" 
            style={btnStyle}
          >
            Report an Error
          </a>
        </div>
      </div>
    </div>
  );
}

export default NotFound;