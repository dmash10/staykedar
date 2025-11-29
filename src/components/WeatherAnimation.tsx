import React, { useEffect, useState } from 'react';
import { CloudRain, CloudSnow, CloudSun, CloudLightning, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' | 'clear' | 'partly-cloudy';
type TimeOfDay = 'day' | 'night';

interface WeatherAnimationProps {
  condition?: string;
  isDay?: number;
}

const WeatherAnimation: React.FC<WeatherAnimationProps> = ({ condition = 'clear', isDay = 1 }) => {
  const [weatherType, setWeatherType] = useState<WeatherCondition>('clear');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  
  useEffect(() => {
    // Determine weather type from condition string
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('snow') || lowerCondition.includes('ice') || lowerCondition.includes('sleet')) {
      setWeatherType('snowy');
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle') || lowerCondition.includes('shower')) {
      setWeatherType('rainy');
    } else if (lowerCondition.includes('storm') || lowerCondition.includes('thunder') || lowerCondition.includes('lightning')) {
      setWeatherType('stormy');
    } else if (lowerCondition.includes('overcast') || (lowerCondition.includes('cloud') && !lowerCondition.includes('partly'))) {
      setWeatherType('cloudy');
    } else if (lowerCondition.includes('sunny') || (lowerCondition.includes('clear') && isDay)) {
      setWeatherType('sunny');
    } else if (lowerCondition.includes('partly cloudy')) {
      setWeatherType('partly-cloudy');
    } else {
      setWeatherType('clear');
    }
    
    // Set time of day
    setTimeOfDay(isDay === 1 ? 'day' : 'night');
  }, [condition, isDay]);
  
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Base background gradient based on time of day */}
      <div 
        className={`absolute inset-0 ${
          timeOfDay === 'day' 
            ? 'bg-gradient-to-b from-blue-400 to-blue-600' 
            : 'bg-gradient-to-b from-indigo-900 via-blue-900 to-slate-900'
        } opacity-95`}
      />
      
      {/* Weather specific animations */}
      <div className="absolute inset-0">
        {weatherType === 'sunny' && timeOfDay === 'day' && (
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              <div className="absolute w-40 h-40 rounded-full bg-yellow-300 blur-md animate-pulse-slow"></div>
              <Sun className="text-yellow-300 w-32 h-32 animate-pulse-slow filter drop-shadow-lg" />
            </div>
            <div className="absolute w-full h-full bg-gradient-to-t from-transparent to-yellow-300/20"></div>
            
            {/* Light rays */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="absolute top-24 left-1/2 h-60 w-1 bg-yellow-200/40"
                style={{
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                  transformOrigin: 'top',
                  filter: 'blur(3px)',
                  animation: 'pulse-slow 5s infinite'
                }}
              />
            ))}
          </div>
        )}
        
        {weatherType === 'clear' && timeOfDay === 'night' && (
          <div className="absolute inset-0">
            <Moon className="text-white w-24 h-24 absolute top-10 right-20 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] animate-float" />
            
            {/* Stars with twinkling effect */}
            <div className="stars">
              {[...Array(200)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `pulse-slow ${Math.random() * 5 + 3}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: Math.random() * 0.7 + 0.3,
                    backgroundColor: i % 5 === 0 ? '#b6edff' : (i % 7 === 0 ? '#ffd1b6' : '#ffffff'),
                    boxShadow: i % 10 === 0 ? '0 0 4px 1px rgba(255, 255, 255, 0.6)' : 'none'
                  }}
                />
              ))}
            </div>
            
            {/* Shooting stars */}
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white"
                style={{
                  width: '2px',
                  height: '2px',
                  top: `${Math.random() * 50}%`,
                  left: `${Math.random() * 100}%`,
                  boxShadow: '0 0 3px 3px rgba(255, 255, 255, 0.3)',
                  animation: `shooting-star 7s linear infinite`,
                  animationDelay: `${i * 9 + 5}s`,
                  opacity: 0
                }}
              />
            ))}
          </div>
        )}
        
        {weatherType === 'cloudy' && (
          <div className="absolute inset-0">
            {/* Thin cloud layers in background */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"
              style={{ filter: 'blur(40px)' }}
            />
            
            {/* Dynamic clouds */}
            {[...Array(10)].map((_, i) => {
              const size = Math.random() * 0.7 + 0.5;
              const speed = Math.random() * 40 + 80;
              return (
                <div 
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${200 * size}px`,
                    height: `${80 * size}px`,
                    top: `${Math.random() * 60 + 5}%`,
                    left: `${-20}%`,
                    animation: `slide-in-right ${speed}s linear infinite`,
                    animationDelay: `${i * 5}s`,
                    opacity: timeOfDay === 'day' ? 0.8 : 0.3,
                    filter: 'blur(5px)'
                  }}
                />
              );
            })}
            
            {/* Foreground clouds */}
            {[...Array(7)].map((_, i) => (
              <div 
                key={i+100}
                className="absolute"
                style={{
                  animation: `slide-in-right ${Math.random() * 15 + 25}s linear infinite`,
                  animationDelay: `${i * 6}s`,
                  top: `${Math.random() * 60 + 10}%`,
                  transform: `scale(${Math.random() * 0.5 + 0.8})`
                }}
              >
                <div className={`w-40 h-16 rounded-full ${
                    timeOfDay === 'day' ? 'bg-white' : 'bg-gray-700'
                  } opacity-90 shadow-lg filter drop-shadow-lg`} 
                  style={{ filter: 'blur(2px)' }}
                />
              </div>
            ))}
          </div>
        )}
        
        {weatherType === 'rainy' && (
          <div className="absolute inset-0">
            {/* Dark cloud overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-700/30"
              style={{ filter: 'blur(30px)' }}
            />
            
            {/* Cloud layers */}
            {[...Array(8)].map((_, i) => {
              const size = Math.random() * 0.5 + 0.8;
              return (
                <div 
                  key={i}
                  className="absolute"
                  style={{
                    animation: `slide-in-right ${Math.random() * 15 + 30}s linear infinite`,
                    animationDelay: `${i * 6}s`,
                    top: `${Math.random() * 30 + 5}%`,
                    transform: `scale(${size})`
                  }}
                >
                  <div className={`w-60 h-24 rounded-full ${
                      timeOfDay === 'day' ? 'bg-gray-500' : 'bg-gray-700'
                    } opacity-90 shadow-lg filter drop-shadow-lg`} 
                    style={{ filter: 'blur(3px)' }}
                  />
                </div>
              );
            })}
            
            {/* Rain drops with realistic motion */}
            <div className="raindrops">
              {[...Array(300)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bg-blue-200"
                  style={{
                    width: '1px',
                    height: `${Math.random() * 20 + 15}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.4 + 0.2,
                    animation: `rain-fall ${Math.random() * 0.5 + 0.7}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    transform: 'rotate(15deg)',
                    filter: 'blur(0.5px)'
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {weatherType === 'snowy' && (
          <div className="absolute inset-0">
            {/* Soft white overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-transparent to-blue-100/20"
              style={{ filter: 'blur(40px)' }}
            />
            
            {/* Cloud layers */}
            {[...Array(6)].map((_, i) => {
              const size = Math.random() * 0.7 + 0.6;
              return (
                <div 
                  key={i}
                  className="absolute"
                  style={{
                    animation: `slide-in-right ${Math.random() * 20 + 30}s linear infinite`,
                    animationDelay: `${i * 5}s`,
                    top: `${Math.random() * 30 + 5}%`,
                    transform: `scale(${size})`
                  }}
                >
                  <div className={`w-64 h-24 rounded-full ${
                      timeOfDay === 'day' ? 'bg-gray-300' : 'bg-gray-600'
                    } opacity-80 shadow-lg filter drop-shadow-lg`} 
                    style={{ filter: 'blur(3px)' }}
                  />
                </div>
              );
            })}
            
            {/* Snowflakes with realistic motion */}
            <div className="snowflakes">
              {[...Array(200)].map((_, i) => {
                const size = Math.random() * 6 + 2;
                const duration = Math.random() * 10 + 10;
                const sway = Math.random() * 20 + 10; // Horizontal sway amount
                
                return (
                  <div 
                    key={i}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      top: `-${size}px`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.8 + 0.2,
                      filter: 'blur(0.5px)',
                      animation: `snow-fall ${duration}s linear infinite, snow-sway ${sway}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * duration}s, ${Math.random() * sway}s`,
                      boxShadow: '0 0 2px 1px rgba(255, 255, 255, 0.3)'
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        {weatherType === 'stormy' && (
          <div className="absolute inset-0">
            {/* Dark cloud overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-gray-900/70"
              style={{ filter: 'blur(20px)' }}
            />
            
            {/* Dark storm clouds */}
            {[...Array(8)].map((_, i) => {
              const size = Math.random() * 0.6 + 0.7;
              return (
                <div 
                  key={i}
                  className="absolute"
                  style={{
                    animation: `slide-in-right ${Math.random() * 15 + 20}s linear infinite`,
                    animationDelay: `${i * 4}s`,
                    top: `${Math.random() * 40 + 5}%`,
                    transform: `scale(${size})`
                  }}
                >
                  <div className="w-64 h-32 rounded-full bg-gray-800 opacity-90 shadow-xl filter drop-shadow-xl" 
                    style={{ filter: 'blur(3px)' }}
                  />
                </div>
              );
            })}
            
            {/* Lightning flashes */}
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute inset-0 bg-white/5"
                style={{
                  animation: `lightning-flash ${Math.random() * 3 + 7}s ease-out infinite`,
                  animationDelay: `${i * 5}s`,
                  opacity: 0
                }}
              />
            ))}
            
            {/* Lightning bolts */}
            {[...Array(4)].map((_, i) => (
              <div 
                key={i+100}
                className="absolute"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${20 + i * 20}%`,
                  width: '3px',
                  height: `${Math.random() * 100 + 100}px`,
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.1))',
                  boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.8), 0 0 20px 5px rgba(255, 255, 255, 0.5)',
                  animation: `lightning-bolt ${Math.random() * 4 + 8}s ease-out infinite`,
                  animationDelay: `${i * 5.5}s`,
                  opacity: 0,
                  zIndex: 2,
                  transform: `rotate(${Math.random() * 10 - 5}deg)`
                }}
              />
            ))}
            
            {/* Heavy rain */}
            <div className="raindrops">
              {[...Array(400)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bg-blue-200"
                  style={{
                    width: '1.5px',
                    height: `${Math.random() * 20 + 20}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.4 + 0.2,
                    animation: `rain-fall ${Math.random() * 0.3 + 0.5}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    transform: 'rotate(20deg)',
                    filter: 'blur(0.5px)'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay to ensure text is readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
    </div>
  );
};

export default WeatherAnimation;
