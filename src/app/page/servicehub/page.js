"use client";

import React, { useState, useEffect, useContext } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Modal component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 min-w-[400px] max-w-[95%] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

// Calendar Component
const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Thai month names
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };
  
  const isDateDisabled = (date) => {
    return date < today.setHours(0, 0, 0, 0);
  };
  
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date);
      
      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && onDateSelect(date)}
          disabled={isDisabled}
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
            isSelected
              ? "bg-blue-600 text-white"
              : isDisabled
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-medium">
          {monthNames[month]} {year + 543}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

// Time Selector Component
const TimeSelector = ({ selectedTime, onTimeSelect }) => {
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <h4 className="text-md font-medium mb-3">เลือกเวลา</h4>
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => onTimeSelect(time)}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedTime === time
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};

const ServiceHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("บริการทั้งหมด");
  const [priceRange, setPriceRange] = useState("0-2000฿");
  const [sortBy, setSortBy] = useState("ตามลำดับคะแนน (Ascending)");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Customer contact information state
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // ใช้ AuthContext
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // Fetch services from API on mount
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await axios.get("/api/services");
        const data = response.data;

        const mapped = data.map((s) => ({
          id: s._id,
          title: s.name,
          category: s.serviceType,
          priceOptions: s.priceOptions, // [{price, label}, ...]
          image: s.image || "/service/service-1.jpg",
          rating: 4.5,
          reviews: 100,
          isPopular: false,
        }));

        setServices(mapped);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    }
    fetchServices();
  }, []);

  // Modal workflow
  const openBookingModal = (service) => {
    if (!user || !user.userId) {
      alert("กรุณาเข้าสู่ระบบก่อนจองบริการ");
      router.push("/page/login");
      return;
    }
    setSelectedService(service);
    setSelectedPrice(null);
    setSelectedDate(null);
    setSelectedTime(null);
    // Set default values from user data
    setCustomerAddress(user.location || "");
    setCustomerPhone(user.phone || "");
    setModalStep(1);
    setModalOpen(true);
  };

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // fake function: ใส่ logic ชำระเงินจริงแทนที่นี่
  const handlePayment = async () => {
  setPaymentLoading(true);

  try {
    const amount = parseInt(selectedPrice.price.toString().replace(/[^\d]/g, ""));

    const bookingData = {
      serviceId: selectedService.id,
      userId: user.userId,
      serviceName: selectedService.title,
      serviceCategory: selectedService.category,
      amount,
      estimatedPrice: amount + " ฿", // เพิ่ม field นี้เพื่อให้เหมือน handleBooking
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: customerPhone || user.phone,
      customerLocation: customerAddress || user.location,
      bookingDate: selectedDate.toISOString().split("T")[0],
      bookingTime: selectedTime,
      paymentMethod,
    };

    // 🔹 Step 1: สร้าง Booking ในฐานข้อมูล
    const bookingRes = await axios.post("/api/bookings/[id]", bookingData);

    if (bookingRes.status !== 201) throw new Error("สร้าง booking ไม่สำเร็จ");

    const bookingId = bookingRes.data.booking._id;

    // 🔹 Step 2: สร้าง Stripe session
    const res = await axios.post("/api/checkout", {
      ...bookingData,
      bookingId, // ส่งไปเผื่อใช้ใน metadata หรือ webhook
    });

    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: res.data.id });
  } catch (err) {
    console.error("🔥 Stripe checkout error:", err);
    alert("ไม่สามารถดำเนินการชำระเงินได้");
  } finally {
    setPaymentLoading(false);
  }
};


  // Booking API
  const handleBooking = async () => {
    setLoading(true);
    try {
      const bookingData = {
        serviceId: selectedService.id,
        userId: user.userId,
        serviceName: selectedService.title,
        serviceCategory: selectedService.category,
        estimatedPrice: selectedPrice.price + " ฿",
        selectedOption: selectedPrice.option, 
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: customerPhone || user.phone,
        customerLocation: customerAddress || user.location,
        bookingDate: selectedDate.toISOString().split('T')[0],
        bookingTime: selectedTime,
        paymentMethod,
      };
      const response = await axios.post("/api/bookings/[id]", bookingData);
      if (response.status === 201) {
        setModalOpen(false);
        router.push(`/page/booking-status?bookingId=${response.data.booking._id}`);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการจองบริการ");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับการค้นหาและกรองข้อมูล
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "บริการทั้งหมด" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ฟังก์ชันสำหรับการเรียงลำดับ
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "ตามลำดับคะแนน (Ascending)":
        return a.rating - b.rating;
      case "ตามลำดับคะแนน (Descending)":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleSearch = () => {
    // ฟังก์ชันค้นหา
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      locale: 'th-TH'
    };
    return date.toLocaleDateString('th-TH', options);
  };

  // ------------------- Modal Content -------------------
  const renderModalContent = () => {
    if (!selectedService) return null;
    
    if (modalStep === 1) {
      // เลือกราคา
      return (
        <div>
          <h2 className="text-lg font-bold mb-2">เลือกแพ็กเกจ/ราคา</h2>
          {selectedService.priceOptions.map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-2 py-2 px-3 mb-2 border rounded-lg cursor-pointer ${
                selectedPrice?.price === opt.price ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="price"
                className="accent-blue-500"
                checked={selectedPrice?.price === opt.price}
                onChange={() => setSelectedPrice(opt)}
              />
              <span className="font-medium">{opt.option  || `ตัวเลือก ${idx + 1}`}</span>
              <span className="ml-auto text-blue-700">{opt.price} ฿</span>
            </label>
          ))}
          <button
            className="w-full bg-blue-600 text-white py-2 mt-4 rounded-lg font-medium disabled:opacity-50"
            disabled={!selectedPrice}
            onClick={() => setModalStep(2)}
          >
            ถัดไป
          </button>
        </div>
      );
    }
    
    if (modalStep === 2) {
      // เลือกวันเวลา และข้อมูลติดต่อ
      return (
        <div>
          <h2 className="text-lg font-bold mb-4">เลือกวันที่ เวลา และข้อมูลติดต่อ</h2>
          
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2">เลือกวันที่</h3>
            <Calendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
          
          {selectedDate && (
            <div className="mb-4">
              <TimeSelector
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            </div>
          )}
          
          {/* ข้อมูลติดต่อ */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-3">ข้อมูลติดต่อ</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ที่อยู่ในการให้บริการ
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="กรุณากรอกที่อยู่ที่ต้องการให้บริการ"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  หากไม่กรอก จะใช้ที่อยู่จากโปรไฟล์: {user.location || "ไม่มีข้อมูล"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="กรุณากรอกเบอร์โทรศัพท์"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  หากไม่กรอก จะใช้เบอร์จากโปรไฟล์: {user.phone || "ไม่มีข้อมูล"}
                </p>
              </div>
            </div>
          </div>
          
          {selectedDate && selectedTime && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>วันที่เลือก:</strong> {formatDate(selectedDate)}
              </p>
              <p className="text-sm text-blue-800">
                <strong>เวลาที่เลือก:</strong> {selectedTime} น.
              </p>
              <p className="text-sm text-blue-800">
                <strong>ที่อยู่บริการ:</strong> {customerAddress || user.location || "ไม่มีข้อมูล"}
              </p>
              <p className="text-sm text-blue-800">
                <strong>เบอร์ติดต่อ:</strong> {customerPhone || user.phone || "ไม่มีข้อมูล"}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
              onClick={() => setModalStep(1)}
            >
              ย้อนกลับ
            </button>
            <button
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setModalStep(3)}
            >
              ถัดไป
            </button>
          </div>
        </div>
      );
    }
    
    // Step 3: Payment
    return (
      <div>
        <h2 className="text-lg font-bold mb-3">ชำระเงิน</h2>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h3 className="font-medium mb-2">สรุปการจอง</h3>
          <p className="text-sm text-gray-700">บริการ: {selectedService.title}</p>
          <p className="text-sm text-gray-700">วันที่: {formatDate(selectedDate)}</p>
          <p className="text-sm text-gray-700">เวลา: {selectedTime} น.</p>
          <p className="text-sm text-gray-700">ที่อยู่: {customerAddress || user.location || "ไม่มีข้อมูล"}</p>
          <p className="text-sm text-gray-700">เบอร์: {customerPhone || user.phone || "ไม่มีข้อมูล"}</p>
          <p className="text-sm text-gray-700">ราคา: {selectedPrice?.price} ฿</p>
        </div>
        
        <div className="mb-4">
          <div className="mb-2">ยอดที่ต้องชำระ: <span className="font-semibold text-blue-700">{selectedPrice?.price} ฿</span></div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                className="accent-blue-500"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              <span>โอนผ่าน QR พร้อมเพย์/บัตรเครดิต (Online Payment)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                className="accent-blue-500"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
              />
              <span>ชำระเงินสด (ที่หน้างาน)</span>
            </label>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
            onClick={() => setModalStep(2)}
          >
            ย้อนกลับ
          </button>
          {paymentMethod === "online" ? (
            <button
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
              disabled={paymentLoading}
              onClick={handlePayment}
            >
              {paymentLoading ? "กำลังชำระเงิน..." : "ชำระเงิน"}
            </button>
          ) : (
            <button
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium"
              onClick={handleBooking}
              disabled={loading}
            >
              {loading ? "กำลังดำเนินการ..." : "จองบริการ (เงินสด)"}
            </button>
          )}
        </div>
      </div>
    );
  };

  // ------------------- Service Card -------------------
  const ServiceCard = ({ service }) => (
    <div className="w-[343px] h-[370px] flex flex-col border-gray-300 border rounded-lg bg-white shadow-sm">
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-t-lg overflow-hidden">
        <div className="text-blue-600 font-medium text-lg">
          <Image
            src={service.image}
            alt="service image"
            width={1000}
            height={1000}
            className=""
          />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-[#e7eeff] text-blue-800 text-sm rounded-lg">
            {service.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex-1">{service.title}</h3>
        <div className="flex items-center gap-2 mb-4 text-gray-600">
          <span className="text-sm flex justify-center items-center gap-2">
            <Image src="/home-img/vector.jpg" alt="icon" width={16} height={16} className="" />
            เริ่มต้น {service.priceOptions[0]?.price} ฿
          </span>
        </div>
        <button
          onClick={() => openBookingModal(service)}
          disabled={loading}
          className={`text-blue-500 underline text-left hover:text-blue-700 font-medium ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          เลือกบริการ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">บริการของเรา</h1>
          <p className="text-lg md:text-xl mb-2">
            ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน และอื่น ๆ อีกมากมาย
          </p>
          <p className="text-base md:text-lg opacity-90">
            โดยพนักงานแม่บ้าน และช่างมืออาชีพ
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาบริการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>บริการทั้งหมด</option>
                  <option>บริการทั่วไป</option>
                  <option>บริการซ่อมแซม</option>
                  <option>บริการติดตั้ง</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>0-2000฿</option>
                  <option>0-500฿</option>
                  <option>500-1000฿</option>
                  <option>1000-2000฿</option>
                  <option>2000฿+</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>ตามลำดับคะแนน (Ascending)</option>
                  <option>ตามลำดับคะแนน (Descending)</option>
                  <option>ราคาต่ำ - สูง</option>
                  <option>ราคาสูง - ต่ำ</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              <button 
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6">
          {sortedServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        
        {sortedServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">ไม่พบบริการที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>
      
      {/* Modal booking step */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {renderModalContent()}
      </Modal>

      {/* Load More Button */}
      {/* {sortedServices.length > 0 && (
        <div className="text-center pb-12">
          <button className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            โหลดเพิ่มเติม
          </button>
        </div>
      )} */}
    </div>
  );
};

export default ServiceHub;