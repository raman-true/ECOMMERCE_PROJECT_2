import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom'; // Import Link

const slides = [
  {
    id: 1,
    title: 'Winter Building Sale',
    subtitle: 'Save up to 40% on building materials',
    description: 'Stock up on concrete, timber, and hardware essentials',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
    cta: 'Shop Building Materials',
    link: '/shop'
  },
  {
    id: 2,
    title: 'Professional Tools',
    subtitle: 'Power up your projects',
    description: 'Discover our range of professional-grade power tools',
    image: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
    cta: 'View Power Tools',
    link: '/shop'
  },
  {
    id: 3,
    title: 'Garden Ready',
    subtitle: 'Everything for outdoor living',
    description: 'Transform your outdoor space with our garden range',
    image: 'https://images.pexels.com/photos/296230/pexels-photo-296230.jpeg',
    cta: 'Explore Garden Range',
    link: '/shop'
  }
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-brown-900 bg-opacity-60" />
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {slide.title}
                </h1>
                <h2 className="text-xl md:text-2xl text-brown-100 mb-6">
                  {slide.subtitle}
                </h2>
                <p className="text-lg text-brown-200 mb-8">
                  {slide.description}
                </p>
                {/* Wrap the Button with Link */}
                <Link to={slide.link}>
                  <Button size="lg" className="bg-brown-500 hover:bg-brown-700 text-white">
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-brown-900 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-brown-900 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-brown-500' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

