
import React, { useEffect, useRef, useState } from "react";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import humidity_icon from "../assets/humidity.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import sunrise_icon from "../assets/sunrise.png";
import sunset_icon from "../assets/sunset.png";
import mic_icon from "../assets/microphone.png";
import volume_icon from "../assets/volume.png";
import timezone_icon from "../assets/timezone.png";

// Videos
import clear_sky_video from "../assets/clear-sky.mp4";
import cloudy_video from "../assets/cloudy-sky.mp4";
import raining_video from "../assets/raining.mp4";
import snow_video from "../assets/snow.mp4";

const WeatherBox = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  const videoBackgrounds = {
    Clear: clear_sky_video,
    Clouds: cloudy_video,
    Rain: raining_video,
    Drizzle: raining_video,
    Thunderstorm: raining_video,
    Snow: snow_video,
    Mist: cloudy_video,
    Haze: cloudy_video,
    Fog: cloudy_video,
    Smoke: cloudy_video,
    Dust: cloudy_video,
    Sand: cloudy_video,
    Ash: cloudy_video,
    Squall: raining_video,
    Tornado: raining_video,
  };

  // Voice search function
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser doesn't support voice recognition");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const city = event.results[0][0].transcript;
      inputRef.current.value = city;
      search(city);
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
    };
  };

  // Speak weather data
const speakWeather = () => {
  if (!weatherData) return;

  const speech = new SpeechSynthesisUtterance(
    `Currently in ${weatherData.location}, it is ${weatherData.temperature} degrees Celsius, 
    feels like ${weatherData.feelsLike} degrees. 
    Weather condition is ${weatherData.condition}. 
    The current local time  is ${weatherData.localTime}.
    Humidity is ${weatherData.humidity} percent and wind speed is ${weatherData.windSpeed} kilometers per hour.`
  );

  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
};



  const search = async (city) => {
    if (!city) {
      setError("Please enter a city name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setWeatherData(null);
        return;
      }

      const icon = allIcons[data.weather[0].icon] || clear_icon;

      // Fetch 5-day forecast (3-hour interval data)
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&units=metric&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();
       const getLocalTime = (timezoneOffset) => {
  const utcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const localTime = new Date(utcTime + timezoneOffset * 1000);
  return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        feelsLike: Math.floor(data.main.feels_like),
        location: data.name,
        icon: icon,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        condition: data.weather[0].main.trim(),
        forecast: forecastData.list, // Store forecast array
          localTime: getLocalTime(data.timezone)
      });
    } catch (error) {
      setError("Error fetching weather data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search("Lucknow");
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      {weatherData && (
        <video
          key={weatherData.condition}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={videoBackgrounds[weatherData.condition] || cloudy_video}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Foreground */}
      <div className="relative z-10 mt-6 mb-6 place-self-center p-12 rounded-xl shadow-xl flex flex-col items-center w-[90%] max-w-lg bg-black/20 backdrop-blur-md">
        {/* Search bar */}
        <div className="flex items-center gap-3 w-full mb-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city..."
            onKeyDown={(e) => e.key === "Enter" && search(inputRef.current.value)}
            className="flex-1 h-[50px] rounded-full pl-6 text-[#626262] bg-[#ebfffc] text-lg outline-none border-none focus:ring-2 focus:ring-blue-300 transition"
          />
          <img
            src={search_icon}
            alt="Search"
            onClick={() => search(inputRef.current.value)}
            className="w-[50px] p-[15px] rounded-full bg-[#ebfffc] cursor-pointer hover:scale-110 transition-transform"
          />
          <img
            src={mic_icon}
            alt="Voice Search"
            onClick={startVoiceSearch}
            className="w-[50px] p-[12px] rounded-full bg-[#ebfffc] cursor-pointer hover:scale-110 transition-transform"
          />
          <img
            src={volume_icon}
            alt="Speaker"
            onClick={speakWeather}
            className="w-[50px] p-[12px] rounded-full bg-[#ebfffc] cursor-pointer hover:scale-110 transition-transform"
          />
          
        </div>

        {/* Loading & Error */}
        {loading && <p className="text-white text-lg">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Weather Info */}
        {weatherData && !loading && (
          <>
            <img
              src={weatherData.icon}
              alt=""
              className="w-[150px] my-[15px] transition-transform duration-500 hover:scale-110"
            />
            <p className="text-white text-[60px] leading-none font-semibold">
              {weatherData.temperature}°C
            </p>
            <p className="text-white text-md italic mb-2">
              Feels like {weatherData.feelsLike}°C
            </p>
            <p className="text-white text-[40px] font-medium">
              {weatherData.location}
            </p>

            {/* Stats */}
            <div className="w-full mt-8 text-white flex flex-wrap justify-between gap-6">
              {/* Humidity */}
              <div className="flex items-start gap-3 text-[20px]">
                <img src={humidity_icon} alt="" className="w-[26px] mt-[5px]" />
                <div>
                  <p>{weatherData.humidity}%</p>
                  <span className="block text-sm">Humidity</span>
                </div>
              </div>

              {/* Wind */}
              <div className="flex items-start gap-3 text-[20px]">
                <img src={wind_icon} alt="" className="w-[26px] mt-[5px]" />
                <div>
                  <p>{weatherData.windSpeed} km/h</p>
                  <span className="block text-sm">Wind Speed</span>
                </div>
              </div>

              {/*current local time*/}
              <div className="flex items-start gap-3 text-[20px]">
                <img src={timezone_icon} alt="" className="w-[26px] mt-[5px]" />
                <div>
                  <p>{weatherData.localTime} </p>
                  <span className="block text-sm">Local Time</span>
                </div>
              </div>


              {/* Sunrise */}
              <div className="flex items-start gap-3 text-[20px]">
                <img src={sunrise_icon} alt="" className="w-8" />
                <div>
                  <p>{formatTime(weatherData.sunrise)}</p>
                  <span className="block text-sm">Sunrise</span>
                </div>
              </div>

              {/* Sunset */}
              <div className="flex items-start gap-3 text-[20px]">
                <img src={sunset_icon} alt="" className="w-12" />
                <div>
                  <p>{formatTime(weatherData.sunset)}</p>
                  <span className="block text-sm">Sunset</span>
                </div>
              </div>
            </div>

            {/* 5-day Forecast */}
            {weatherData.forecast && (
              <div className="mt-8 w-full bg-white/10 rounded-xl p-4">
                <h3 className="text-white text-lg mb-3">5-Day Forecast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {weatherData.forecast
                    .filter((_, index) => index % 8 === 0) // every 8th ~ 1 day
                    .map((item, idx) => (
                      <div key={idx} className="text-center text-white">
                        <p>
                          {new Date(item.dt * 1000).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </p>
                        <img
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                          alt=""
                          className="mx-auto w-12"
                        />
                        <p>{Math.round(item.main.temp)}°C</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherBox;




