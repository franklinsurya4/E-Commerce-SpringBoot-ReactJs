import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // import useNavigate
import "../styles/Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  const images = [
    "https://images.timesnownews.com/photo/msid-151868258/151868258.jpg",
    "https://sm.pcmag.com/t/pcmag_uk/gallery/t/the-best-a/the-best-apple-watch-bands_nqdm.1920.jpg",
    "https://static.vecteezy.com/system/resources/previews/024/576/640/non_2x/luxury-leather-backpack-for-modern-business-travel-generated-by-ai-photo.jpg",
    "https://images.pexels.com/photos/47354/the-ball-stadion-football-the-pitch-47354.jpeg?cs=srgb&dl=pexels-pixabay-47354.jpg&fm=jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to QualityProducts</h1>
        <p>Find everything you need at unbeatable prices!</p>
        <button
          className="shop-now-btn"
          onClick={() => navigate("/categories")} // navigate to categories
        >
          Shop Now
        </button>
      </div>
      <div className="hero-image-container">
        <img src={images[currentIndex]} alt="Hero Banner" className="hero-image" />
      </div>
    </section>
  );
};

export default Hero;