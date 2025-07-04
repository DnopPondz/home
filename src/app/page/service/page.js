"use client";

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

const ServiceBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('cleaning');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    paymentMethod: 'credit_card',
    promoCode: ''
  });

  const services = {
    cleaning: {
      name: 'ทำความสะอาดทั่วไป',
      prices: [
        { id: 1, name: '9:00 - 10:00 น. เช้าธรรมดา', price: 500 },
        { id: 2, name: '9:00 - 10:00 น. เช้าพรีเมียม', price: 800 },
        { id: 3, name: '9:00 - 10:00 น. เช้าวีไอพี', price: 1000 },
        { id: 4, name: '9:00 - 10:00 น. เช้าเอ็กซ์คลูซีฟ', price: 1200 }
      ]
    },
    aircon: {
      name: 'ล้างแอร์',
      prices: [
        { id: 1, name: 'ล้างแอร์ 1 เครื่อง', price: 600 },
        { id: 2, name: 'ล้างแอร์ 2 เครื่อง', price: 1100 },
        { id: 3, name: 'ล้างแอร์ 3 เครื่อง', price: 1500 },
        { id: 4, name: 'ล้างแอร์ 4 เครื่อง', price: 1800 }
      ]
    },
    repair: {
      name: 'ซ่อมเครื่องใช้ไฟฟ้า',
      prices: [
        { id: 1, name: 'ซ่อมเครื่องใช้เล็ก', price: 400 },
        { id: 2, name: 'ซ่อมเครื่องใช้กลาง', price: 700 },
        { id: 3, name: 'ซ่อมเครื่องใช้ใหญ่', price: 1000 },
        { id: 4, name: 'ซ่อมเครื่องใช้พิเศษ', price: 1500 }
      ]
    }
  };

  const timeSlots = [
    '9:00 - 10:00 น.', '10:00 - 11:00 น.', '11:00 - 12:00 น.',
    '13:00 - 14:00 น.', '14:00 - 15:00 น.', '15:00 - 16:00 น.',
    '16:00 - 17:00 น.', '17:00 - 18:00 น.'
  ];

  const steps = [
    {
      id: 1,
      title: 'รายการ',
      subtitle: 'เลือกสินค้าและบริการ',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'กรอกข้อมูลบริการ',
      subtitle: 'ระบุรายละเอียดการใช้งาน',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20h9" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'ชำระเงิน',
      subtitle: 'ยืนยันและชำระเงิน',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10V8a3 3 0 0 1 6 0v2" />
        </svg>
      )
    }
  ];

  const getStepTitle = (step) => {
    switch(step) {
      case 1: return 'เลือกบริการ';
      case 2: return 'รายละเอียดการจอง';
      case 3: return 'ชำระเงิน';
      case 4: return 'เสร็จสิ้น';
      default: return '';
    }
  };

  const renderStepIndicator = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg backdrop-blur-sm mb-6">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="flex flex-col items-center relative z-10">
              {/* Step Circle */}
              <div 
                className={`w-12 h-12 flex items-center justify-center border-2 rounded-full transition-all duration-300 ease-out transform ${
                  currentStep === step.id 
                    ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-110' 
                    : currentStep > step.id 
                    ? 'border-green-500 bg-green-500 text-white shadow-md' 
                    : 'border-slate-300 bg-white text-slate-400 hover:border-slate-400'
                }`}
              >
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{step.icon}</span>
                )}
              </div>
              
              {/* Step Content */}
              <div className="mt-3 text-center max-w-32">
                <div className={`font-medium text-sm transition-colors duration-200 ${
                  currentStep === step.id 
                    ? 'text-blue-600' 
                    : currentStep > step.id 
                    ? 'text-green-600' 
                    : 'text-slate-500'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-200 ${
                  currentStep === step.id 
                    ? 'text-blue-500' 
                    : currentStep > step.id 
                    ? 'text-green-500' 
                    : 'text-slate-400'
                }`}>
                  {step.subtitle}
                </div>
              </div>
            </div>
            
            {/* Progress Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 px-4 relative">
                <div className="h-0.5 bg-slate-200 relative overflow-hidden rounded-full">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${
                      currentStep > step.id ? 'bg-green-500 w-full' : 'bg-slate-200 w-0'
                    }`}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderServiceSelection = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {renderStepIndicator()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">เลือกบริการ</h2>
          
          <div className="space-y-4">
            {services[selectedService].prices.map((priceOption) => (
              <div key={priceOption.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`price-${priceOption.id}`}
                      name="price"
                      value={priceOption.id}
                      checked={selectedPrice === priceOption.id.toString()}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="mr-4"
                    />
                    <label htmlFor={`price-${priceOption.id}`} className="cursor-pointer">
                      <div className="font-medium text-gray-800">{priceOption.name}</div>
                      <div className="text-sm text-gray-600">บริการ: {services[selectedService].name}</div>
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{priceOption.price} ฿</div>
                    <div className="text-sm text-gray-500">รวม VAT</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <div className="text-center text-blue-600 font-medium">
              Annotate It - From booking to payment in one place
            </div>
            <div className="text-center text-sm text-gray-600 mt-1">
              Service Detail | Administrator | Admin for businessowners
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setCurrentStep(2)}
              disabled={!selectedPrice}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingForm = () => (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {renderStepIndicator()}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">รายละเอียดการจอง</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ข้อมูลบริการ</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทบริการ</label>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 font-medium">
                      {services[selectedService].prices.find(p => p.id.toString() === selectedPrice)?.name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เวลา</label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">เลือกเวลา</option>
                    {timeSlots.map((slot, index) => (
                      <option key={index} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                  <textarea
                    value={bookingData.customerInfo.address}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      customerInfo: { ...prev.customerInfo, address: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="กรอกที่อยู่สำหรับให้บริการ"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">ข้อมูลลูกค้า</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={bookingData.customerInfo.name}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      customerInfo: { ...prev.customerInfo, name: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                  <input
                    type="tel"
                    value={bookingData.customerInfo.phone}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      customerInfo: { ...prev.customerInfo, phone: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกเบอร์โทร"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                  <input
                    type="email"
                    value={bookingData.customerInfo.email}
                    onChange={(e) => setBookingData(prev => ({ 
                      ...prev, 
                      customerInfo: { ...prev.customerInfo, email: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกอีเมล"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">ราคาบริการ</span>
                    <span className="font-medium">
                      {services[selectedService].prices.find(p => p.id.toString() === selectedPrice)?.price} ฿
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>ราคารวม</span>
                    <span>
                      {services[selectedService].prices.find(p => p.id.toString() === selectedPrice)?.price} ฿
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button 
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              กลับไป
            </button>
            <button 
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="bg-gray-50 min-h-screen">
      {renderStepIndicator()}
      
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ชำระเงิน</h2>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">สรุปการจอง</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p>บริการ: {services[selectedService].prices.find(p => p.id.toString() === selectedPrice)?.name}</p>
                <p>วันที่: {bookingData.date}</p>
                <p>เวลา: {bookingData.time}</p>
                <p>ลูกค้า: {bookingData.customerInfo.name}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">วิธีการชำระเงิน</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={bookingData.paymentMethod === 'credit_card'}
                    onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span>บัตรเครดิต/เดบิต</span>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="qr_code"
                    checked={bookingData.paymentMethod === 'qr_code'}
                    onChange={(e) => setBookingData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <span className="w-5 h-5 mr-2 flex items-center justify-center bg-green-100 rounded text-green-600 text-xs">QR</span>
                  <span>QR Code</span>
                </label>
              </div>
            </div>

            {bookingData.paymentMethod === 'credit_card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">หมายเลขบัตร</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">วันหมดอายุ</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bookingData.promoCode}
                  onChange={(e) => setBookingData(prev => ({ ...prev, promoCode: e.target.value }))}
                  placeholder="กรอกรหัสส่วนลด"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  ใช้
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>ยอดชำระ</span>
                <span>
                  {services[selectedService].prices.find(p => p.id.toString() === selectedPrice)?.price} ฿
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                กลับไป
              </button>
              <button 
                onClick={() => setCurrentStep(4)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="bg-gray-50 min-h-screen">
      {renderStepIndicator()}
      
      <div className="max-w-md mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ชำระเงินเรียบร้อย!</h2>
          <p className="text-gray-600 mb-6">การจองของคุณได้รับการยืนยันแล้ว</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-600 mb-1">หมายเลขการจอง</p>
            <p className="font-mono text-lg font-bold">BK-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</p>
            <p className="text-sm text-gray-600 mt-2">วันที่: {new Date().toLocaleDateString('th-TH')}</p>
            <p className="text-sm text-gray-600">
              จำนวนเงิน: {services[selectedService].prices.find(p => p.id.toString() === selectedPrice)?.price} ฿
            </p>
          </div>
          
          <button 
            onClick={() => {
              setCurrentStep(1);
              setSelectedPrice('');
              setBookingData({
                date: '',
                time: '',
                customerInfo: { name: '', phone: '', email: '', address: '' },
                paymentMethod: 'credit_card',
                promoCode: ''
              });
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            จองบริการใหม่
          </button>
        </div>
      </div>
    </div>
  );

  // Service navigation buttons (you can add these to switch between services)
  const renderServiceTabs = () => (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex space-x-4">
          <button 
            onClick={() => setSelectedService('cleaning')}
            className={`px-4 py-2 rounded-lg ${selectedService === 'cleaning' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            ทำความสะอาด
          </button>
          <button 
            onClick={() => setSelectedService('aircon')}
            className={`px-4 py-2 rounded-lg ${selectedService === 'aircon' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            ล้างแอร์
          </button>
          <button 
            onClick={() => setSelectedService('repair')}
            className={`px-4 py-2 rounded-lg ${selectedService === 'repair' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            ซ่อมเครื่องใช้ไฟฟ้า
          </button>
        </div>
      </div>
    </div>
  );

  switch (currentStep) {
    case 1:
      return (
        <div>
          {renderServiceTabs()}
          {renderServiceSelection()}
        </div>
      );
    case 2:
      return renderBookingForm();
    case 3:
      return renderPayment();
    case 4:
      return renderSuccess();
    default:
      return (
        <div>
          {renderServiceTabs()}
          {renderServiceSelection()}
        </div>
      );
  }
};

export default ServiceBookingFlow;