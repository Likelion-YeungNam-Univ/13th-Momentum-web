import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyLastHealthData } from "../api/healthApi";
import { getCurrentLocation } from "../api/locationApi";
import WeatherWidget from "../components/WeatherWidget";
import ShadeShelterWidget from "../components/ShadeShelterWidget";
import MapWidget from "../components/MapWidget";
import WeatherLLM from "../components/WeatherMessageWidget";
import AlertWidget from "../components/AlertWidget";
import ProfileModal from "../components/ProfileModal";
import HealthStatusWidget from "../components/HealthStatusWidget";
import ondomi from "../assets/ondomi_logo.png";
import Pin from "../assets/LocationPin.svg";

const Dashboard = ({}) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("위치 확인 중...");
  const [weatherData, setWeatherData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showModal, setShowModal] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  const handleWeatherDataChange = (data) => {
    // console.log("Dashboard - weatherData 수신:", data);
    setWeatherData(data);
  };

  const handleSheltersChange = (shelterData) => {
    setShelters(shelterData);
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const locationData = await getCurrentLocation();
        setLocation(locationData.locationName);
      } catch (error) {
        console.error("위치 정보 가져오기 실패:", error);
        setLocation("위치를 확인할 수 없습니다");
      }
    };
    //워치 데이터 가져오기
    const fetchHealth = async () => {
      try {
        const data = await getMyLastHealthData();
        setHealthData(data);
      } catch (error) {
        console.error("건강 데이터 가져오기 실패:", error);
      } finally {
        setHealthLoading(false);
      }
    };

    getLocation();
    fetchHealth();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const healthTimer = setInterval(fetchHealth, 5000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(healthTimer);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    navigate("/login");
    setIsLogged(false);
  };

  const toWeatherPage = () => {
    navigate("/weather");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-10 lg:px-12 py-16">
        {/* 상단 헤더 바 */}
        <div className="flex justify-between items-center mb-6">
          {/* 알림창 */}
          <div className="flex flex-row items-center space-x-4">
            <img src={ondomi} alt="Logo" className="w-30 h-7" />
            {!isMobile && <AlertWidget />}
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-700">
                {location}
              </span>
              {/* 핀 마크 필요함 */}
              <img src={Pin} alt="LocationPin" className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2">
              {/* 프로필 태그 */}
              <div
                className="flex items-center bg-white rounded-full px-3 py-2 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border border-gray-200"
                onClick={() => setShowModal(true)}
              >
                <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-sm font-bold text-gray-900">사용자</span>
              </div>
            </div>
            <div className="flex items-center px-3 py-2.5 rounded-full bg-[#FF6161] hover:bg-[#E55454] shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border border-gray-200 cursor-pointer">
              <span
                className="text-white font-bold text-sm"
                onClick={handleLogout}
              >
                로그아웃
              </span>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-6">
          {isMobile && <AlertWidget />}
          {/* AI 위젯 */}
          <WeatherLLM weatherData={weatherData} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 날씨 정보 */}
            <div className="cursor-pointer" onClick={toWeatherPage}>
              <WeatherWidget onWeatherDataChange={handleWeatherDataChange} />
            </div>
            {/* 건강 상태 위젯 */}
            <HealthStatusWidget
              healthData={healthData}
              weatherData={weatherData}
              healthLoading={healthLoading}
            />
          </div>

          <div className="bg-white p-6 rounded-[30px] shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 그늘막 쉼터 정보 */}
              <ShadeShelterWidget onSheltersChange={handleSheltersChange} />
              {/* 지도 */}
              {/* https환경에서만 작동 */}
              <MapWidget shelters={shelters} />
            </div>
          </div>
        </div>
      </div>

      {showModal && <ProfileModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;
