import fs from 'fs';
let code = fs.readFileSync('src/components/VideoModal.tsx', 'utf8');

// Inside useEffect for detailedMovie? No, just a simple useEffect watching detailedMovie.embedUrl
const target = `  useEffect(() => {
    if (detailedMovie) {
      const speeds = ['Excellent', 'Good', 'Fair'];`;

const injection = `  useEffect(() => {
    if (detailedMovie?.embedUrl) {
      const timer = setTimeout(() => {
        setIsVideoLoading(false);
      }, 5000); // safety fallback
      return () => clearTimeout(timer);
    }
  }, [detailedMovie?.embedUrl]);

  useEffect(() => {
    if (detailedMovie) {
      const speeds = ['Excellent', 'Good', 'Fair'];`;

code = code.replace(target, injection);
fs.writeFileSync('src/components/VideoModal.tsx', code);
